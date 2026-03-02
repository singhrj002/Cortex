"""
Neo4j graph schema definitions.
Defines node types, relationship types, and their properties.
"""

from enum import Enum
from typing import Dict, List


class NodeType(str, Enum):
    """Node types in the knowledge graph."""
    PERSON = "Person"
    TEAM = "Team"
    DECISION = "Decision"
    TASK = "Task"
    CLAIM = "Claim"
    TOPIC = "Topic"
    EVENT = "Event"
    PROJECT = "Project"
    RISK = "Risk"


class RelationshipType(str, Enum):
    """Relationship types in the knowledge graph."""
    # Person relationships
    MEMBER_OF = "MEMBER_OF"  # Person -> Team
    SENT = "SENT"  # Person -> Event
    MENTIONS = "MENTIONS"  # Event -> Person/Topic/Decision/Task

    # Decision relationships
    MADE_DECISION = "MADE_DECISION"  # Person -> Decision
    HAS_VERSION = "HAS_VERSION"  # Decision -> DecisionVersion
    SUPPORTED_BY = "SUPPORTED_BY"  # Decision -> Event
    AFFECTS = "AFFECTS"  # Decision -> Team/Project/Person
    DEPENDS_ON = "DEPENDS_ON"  # Decision -> Decision
    SUPERSEDES = "SUPERSEDES"  # Decision -> Decision (newer -> older)

    # Task relationships
    ASSIGNED_TO = "ASSIGNED_TO"  # Task -> Person
    CREATED_BY = "CREATED_BY"  # Task -> Person
    RELATES_TO = "RELATES_TO"  # Decision/Task/Claim -> Topic
    BLOCKS = "BLOCKS"  # Task -> Task

    # Claim relationships
    MADE_CLAIM = "MADE_CLAIM"  # Person -> Claim
    CONTRADICTS = "CONTRADICTS"  # Claim -> Claim

    # Topic relationships
    SUBCATEGORY_OF = "SUBCATEGORY_OF"  # Topic -> Topic

    # Communication relationships
    COMMUNICATES_WITH = "COMMUNICATES_WITH"  # Team -> Team


# Node property schemas
NODE_SCHEMAS: Dict[NodeType, Dict] = {
    NodeType.PERSON: {
        "required": ["id", "email", "name"],
        "optional": ["team_id", "metadata", "first_seen", "last_seen", "event_count"],
        "indexes": ["email", "name"]
    },
    NodeType.TEAM: {
        "required": ["id", "name"],
        "optional": ["description", "parent_id", "metadata"],
        "indexes": ["name"]
    },
    NodeType.DECISION: {
        "required": ["id", "decision_key", "title", "status", "version"],
        "optional": [
            "summary", "rationale", "scope", "confidence",
            "owner_id", "decided_by", "affected_teams", "affected_projects",
            "evidence_event_ids", "metadata",
            "valid_from", "valid_to", "superseded_by_id"
        ],
        "indexes": ["decision_key", "status", "version", "valid_to"]
    },
    NodeType.TASK: {
        "required": ["id", "title", "status"],
        "optional": [
            "description", "assignee_id", "created_by_id",
            "priority", "due_date", "completed_at",
            "confidence", "evidence_event_ids", "metadata"
        ],
        "indexes": ["status", "assignee_id"]
    },
    NodeType.CLAIM: {
        "required": ["id", "claim_key", "text"],
        "optional": [
            "polarity", "claimant_id", "topic_id",
            "confidence", "evidence_event_ids", "metadata"
        ],
        "indexes": ["claim_key"]
    },
    NodeType.TOPIC: {
        "required": ["id", "name"],
        "optional": [
            "description", "keywords", "parent_id",
            "mention_count", "last_mentioned", "metadata"
        ],
        "indexes": ["name"]
    },
    NodeType.EVENT: {
        "required": ["id", "source", "channel", "timestamp", "sender"],
        "optional": [
            "thread_id", "recipients", "subject", "body_text",
            "content_hash", "metadata"
        ],
        "indexes": ["timestamp", "source"]
    },
}


# Relationship property schemas
RELATIONSHIP_SCHEMAS: Dict[RelationshipType, Dict] = {
    RelationshipType.MADE_DECISION: {
        "properties": ["timestamp", "confidence"]
    },
    RelationshipType.SUPPORTED_BY: {
        "properties": ["confidence", "evidence_excerpt"]
    },
    RelationshipType.AFFECTS: {
        "properties": ["impact_level", "description"]
    },
    RelationshipType.DEPENDS_ON: {
        "properties": ["dependency_type", "critical"]
    },
    RelationshipType.CONTRADICTS: {
        "properties": ["similarity_score", "conflict_type"]
    },
    RelationshipType.COMMUNICATES_WITH: {
        "properties": ["count", "topics", "last_communication"]
    },
}


def get_node_creation_query(node_type: NodeType, properties: Dict) -> str:
    """
    Generate Cypher query for creating a node.

    Args:
        node_type: Type of node to create
        properties: Node properties

    Returns:
        Cypher CREATE query
    """
    props_str = ", ".join([f"{k}: ${k}" for k in properties.keys()])
    return f"CREATE (n:{node_type.value} {{{props_str}}}) RETURN n"


def get_node_merge_query(node_type: NodeType, match_key: str, properties: Dict) -> str:
    """
    Generate Cypher query for merging a node (create or update).

    Args:
        node_type: Type of node
        match_key: Property to match on (e.g., 'email', 'id')
        properties: Node properties

    Returns:
        Cypher MERGE query
    """
    set_clauses = ", ".join([f"n.{k} = ${k}" for k in properties.keys() if k != match_key])

    query = f"""
    MERGE (n:{node_type.value} {{{match_key}: ${match_key}}})
    ON CREATE SET {set_clauses}
    ON MATCH SET {set_clauses}
    RETURN n
    """
    return query.strip()


def get_relationship_creation_query(
    from_type: NodeType,
    from_key: str,
    from_value: str,
    to_type: NodeType,
    to_key: str,
    to_value: str,
    rel_type: RelationshipType,
    properties: Dict = None
) -> str:
    """
    Generate Cypher query for creating a relationship.

    Args:
        from_type: Source node type
        from_key: Source node match property
        from_value: Source node match value
        to_type: Target node type
        to_key: Target node match property
        to_value: Target node match value
        rel_type: Relationship type
        properties: Optional relationship properties

    Returns:
        Cypher CREATE relationship query
    """
    props_str = ""
    if properties:
        props_str = "{" + ", ".join([f"{k}: ${k}" for k in properties.keys()]) + "}"

    query = f"""
    MATCH (a:{from_type.value} {{{from_key}: $from_value}})
    MATCH (b:{to_type.value} {{{to_key}: $to_value}})
    CREATE (a)-[r:{rel_type.value} {props_str}]->(b)
    RETURN r
    """
    return query.strip()


def get_versioning_query(decision_key: str) -> str:
    """
    Get all versions of a decision ordered by version.

    Args:
        decision_key: Decision key to query

    Returns:
        Cypher query for version history
    """
    return """
    MATCH (d:Decision {decision_key: $decision_key})
    RETURN d
    ORDER BY d.version DESC
    """


def get_current_state_query() -> str:
    """
    Get only current versions (valid_to IS NULL).

    Returns:
        Cypher query for current state
    """
    return """
    MATCH (d:Decision)
    WHERE d.valid_to IS NULL
    RETURN d
    """


def get_time_travel_query(timestamp: str) -> str:
    """
    Get graph state at a specific timestamp.

    Args:
        timestamp: ISO format timestamp

    Returns:
        Cypher query for time-travel
    """
    return """
    MATCH (d:Decision)
    WHERE d.valid_from <= $timestamp
      AND (d.valid_to IS NULL OR d.valid_to > $timestamp)
    RETURN d
    """
