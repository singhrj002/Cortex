"""
Graph service for managing Neo4j knowledge graph operations.
Implements versioning system for tracking changes over time.
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from uuid import UUID

from app.db.neo4j_client import get_neo4j_client
from app.models.graph_schema import (
    NodeType,
    RelationshipType,
    get_node_merge_query,
    get_relationship_creation_query,
    get_versioning_query,
    get_current_state_query,
    get_time_travel_query,
)

logger = logging.getLogger(__name__)


class GraphService:
    """
    Service for managing knowledge graph operations with versioning.

    Versioning System:
    - Each node has: version, valid_from, valid_to, superseded_by_id
    - Updates create new versions instead of modifying existing nodes
    - Old versions marked with valid_to = current_timestamp
    - Queries default to valid_to IS NULL (current state)
    - Time-travel queries filter by valid_from/valid_to
    """

    def __init__(self):
        self.client = get_neo4j_client()

    def create_node(
        self,
        node_type: NodeType,
        properties: Dict[str, Any],
        version: str = "1.0"
    ) -> Optional[Dict]:
        """
        Create a new node with versioning metadata.

        Args:
            node_type: Type of node to create
            properties: Node properties
            version: Version number (default: "1.0")

        Returns:
            Created node properties or None if failed
        """
        try:
            # Add versioning metadata
            now = datetime.utcnow().isoformat()
            properties["version"] = version
            properties["valid_from"] = now
            properties["valid_to"] = None  # Current version
            properties["superseded_by_id"] = None

            # Create node
            query = get_node_merge_query(node_type, "id", properties)
            result = self.client.execute_write(query, properties)

            logger.info(f"Created {node_type.value} node: {properties.get('id')}")
            return result[0]["n"] if result else None

        except Exception as e:
            logger.error(f"Error creating {node_type.value} node: {e}")
            return None

    def update_node(
        self,
        node_type: NodeType,
        node_id: str,
        new_properties: Dict[str, Any],
        increment_version: bool = True
    ) -> Optional[Dict]:
        """
        Update node by creating new version and marking old as superseded.

        Args:
            node_type: Type of node
            node_id: Node ID to update
            new_properties: New property values
            increment_version: Whether to increment version number

        Returns:
            New version node properties or None if failed
        """
        try:
            # Get current version
            current = self.get_node_current_version(node_type, node_id)
            if not current:
                logger.warning(f"Node not found for update: {node_id}")
                return None

            # Calculate new version
            current_version = current.get("version", "1.0")
            if increment_version:
                major, minor = current_version.split(".")
                new_version = f"{major}.{int(minor) + 1}"
            else:
                new_version = current_version

            # Mark current version as superseded
            now = datetime.utcnow().isoformat()
            supersede_query = f"""
            MATCH (n:{node_type.value} {{id: $node_id, valid_to: NULL}})
            SET n.valid_to = $now,
                n.superseded_by_id = $new_node_id
            RETURN n
            """

            # Generate new node ID for new version
            import uuid
            new_node_id = str(uuid.uuid4())

            # Prepare new node properties
            new_node_props = {**current, **new_properties}
            new_node_props["id"] = new_node_id
            new_node_props["version"] = new_version
            new_node_props["valid_from"] = now
            new_node_props["valid_to"] = None
            new_node_props["superseded_by_id"] = None

            # Preserve original key (decision_key, claim_key, etc.)
            if "decision_key" in current:
                new_node_props["decision_key"] = current["decision_key"]
            if "claim_key" in current:
                new_node_props["claim_key"] = current["claim_key"]

            # Execute in transaction
            queries = [
                (supersede_query, {"node_id": node_id, "now": now, "new_node_id": new_node_id}),
                (get_node_merge_query(node_type, "id", new_node_props), new_node_props)
            ]

            success = self.client.execute_transaction(queries)

            if success:
                logger.info(f"Updated {node_type.value} {node_id} -> version {new_version}")
                return new_node_props
            else:
                return None

        except Exception as e:
            logger.error(f"Error updating {node_type.value} node {node_id}: {e}")
            return None

    def get_node_current_version(self, node_type: NodeType, identifier: str) -> Optional[Dict]:
        """
        Get current version of a node (valid_to IS NULL).

        Args:
            node_type: Type of node
            identifier: Node ID or key

        Returns:
            Current node properties or None
        """
        query = f"""
        MATCH (n:{node_type.value})
        WHERE (n.id = $identifier OR n.decision_key = $identifier OR n.claim_key = $identifier)
          AND n.valid_to IS NULL
        RETURN n
        LIMIT 1
        """

        result = self.client.execute_read(query, {"identifier": identifier})
        return result[0]["n"] if result else None

    def get_node_history(self, node_type: NodeType, key: str) -> List[Dict]:
        """
        Get all versions of a node ordered by version.

        Args:
            node_type: Type of node
            key: decision_key, claim_key, or id

        Returns:
            List of node versions (newest first)
        """
        query = f"""
        MATCH (n:{node_type.value})
        WHERE n.decision_key = $key OR n.claim_key = $key OR n.id = $key
        RETURN n
        ORDER BY n.version DESC
        """

        result = self.client.execute_read(query, {"key": key})
        return [r["n"] for r in result]

    def get_state_at_time(self, node_type: NodeType, timestamp: str) -> List[Dict]:
        """
        Get graph state at a specific timestamp (time-travel query).

        Args:
            node_type: Type of node
            timestamp: ISO format timestamp

        Returns:
            List of nodes valid at that time
        """
        query = f"""
        MATCH (n:{node_type.value})
        WHERE n.valid_from <= $timestamp
          AND (n.valid_to IS NULL OR n.valid_to > $timestamp)
        RETURN n
        """

        result = self.client.execute_read(query, {"timestamp": timestamp})
        return [r["n"] for r in result]

    def create_relationship(
        self,
        from_node_id: str,
        to_node_id: str,
        rel_type: RelationshipType,
        properties: Optional[Dict] = None
    ) -> bool:
        """
        Create a relationship between two nodes.

        Args:
            from_node_id: Source node ID
            to_node_id: Target node ID
            rel_type: Relationship type
            properties: Optional relationship properties

        Returns:
            True if successful
        """
        try:
            query = f"""
            MATCH (a {{id: $from_id, valid_to: NULL}})
            MATCH (b {{id: $to_id, valid_to: NULL}})
            MERGE (a)-[r:{rel_type.value}]->(b)
            """

            if properties:
                set_clauses = ", ".join([f"r.{k} = ${k}" for k in properties.keys()])
                query += f"\nSET {set_clauses}"

            query += "\nRETURN r"

            params = {
                "from_id": from_node_id,
                "to_id": to_node_id,
                **(properties or {})
            }

            result = self.client.execute_write(query, params)
            return len(result) > 0

        except Exception as e:
            logger.error(f"Error creating relationship {rel_type.value}: {e}")
            return False

    def get_subgraph(
        self,
        center_node_id: str,
        depth: int = 2,
        node_types: Optional[List[NodeType]] = None
    ) -> Dict[str, List]:
        """
        Get subgraph around a central node.

        Args:
            center_node_id: ID of central node
            depth: How many hops to traverse
            node_types: Optional filter for node types

        Returns:
            Dictionary with nodes and relationships
        """
        type_filter = ""
        if node_types:
            types_str = "|".join([t.value for t in node_types])
            type_filter = f":{types_str}"

        query = f"""
        MATCH path = (center {{id: $center_id, valid_to: NULL}})-[*1..{depth}]-(connected{type_filter})
        WHERE connected.valid_to IS NULL
        RETURN nodes(path) as nodes, relationships(path) as rels
        """

        result = self.client.execute_read(query, {"center_id": center_node_id})

        # Deduplicate nodes and relationships
        nodes_dict = {}
        rels_dict = {}

        for record in result:
            for node in record.get("nodes", []):
                node_id = node.get("id")
                if node_id:
                    nodes_dict[node_id] = node

            for rel in record.get("rels", []):
                rel_id = f"{rel.get('start')}-{rel.get('type')}-{rel.get('end')}"
                rels_dict[rel_id] = rel

        return {
            "nodes": list(nodes_dict.values()),
            "relationships": list(rels_dict.values())
        }

    def export_full_graph(self, current_only: bool = True) -> Dict[str, List]:
        """
        Export entire graph.

        Args:
            current_only: Only export current versions (True) or all versions (False)

        Returns:
            Dictionary with all nodes and relationships
        """
        where_clause = "WHERE n.valid_to IS NULL" if current_only else ""

        # Query to get all nodes with their labels and properties
        nodes_query = f"""
        MATCH (n)
        {where_clause}
        RETURN elementId(n) as id, labels(n) as labels, properties(n) as properties
        """

        # Query to get relationships
        rels_query = f"""
        MATCH (n)
        {where_clause}
        MATCH (n)-[r]-(m)
        WHERE m.valid_to IS NULL
        RETURN elementId(startNode(r)) as source,
               elementId(endNode(r)) as target,
               type(r) as relationship,
               properties(r) as properties
        """

        nodes_result = self.client.execute_read(nodes_query)
        rels_result = self.client.execute_read(rels_query)

        # Format nodes with type from labels
        nodes = []
        if nodes_result:
            for record in nodes_result:
                node = {
                    "id": record.get("id"),
                    "type": record.get("labels", [])[0] if record.get("labels") else "Unknown",
                    "properties": record.get("properties", {})
                }
                nodes.append(node)

        # Format relationships
        relationships = []
        if rels_result:
            for record in rels_result:
                rel = {
                    "source": record.get("source"),
                    "target": record.get("target"),
                    "relationship": record.get("relationship"),
                    "properties": record.get("properties", {})
                }
                relationships.append(rel)

        return {"nodes": nodes, "relationships": relationships}

    def search_nodes(
        self,
        node_type: NodeType,
        search_text: str,
        search_fields: List[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """
        Search nodes by text in specified fields.

        Args:
            node_type: Type of nodes to search
            search_text: Search query
            search_fields: Fields to search in (default: ["title", "name", "text"])
            limit: Maximum results

        Returns:
            List of matching nodes
        """
        if not search_fields:
            search_fields = ["title", "name", "text", "summary"]

        conditions = " OR ".join([f"n.{field} CONTAINS $search_text" for field in search_fields])

        query = f"""
        MATCH (n:{node_type.value})
        WHERE ({conditions})
          AND n.valid_to IS NULL
        RETURN n
        LIMIT {limit}
        """

        result = self.client.execute_read(query, {"search_text": search_text})
        return [r["n"] for r in result]

    def get_graph_stats(self) -> Dict[str, Any]:
        """
        Get comprehensive graph statistics.

        Returns:
            Statistics dictionary
        """
        return self.client.get_stats()

    def initialize_schema(self):
        """Initialize graph schema with indexes and constraints."""
        self.client.create_indexes()
        self.client.create_constraints()
        logger.info("Graph schema initialized")
