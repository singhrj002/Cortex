"""
API endpoints for knowledge graph operations.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from sqlalchemy.orm import Session
from fastapi import Depends

from app.db.session import get_db
from app.services.graph_service import GraphService
from app.services.sync_service import SyncService
from app.models.graph_schema import NodeType

router = APIRouter()


@router.get("/stats")
async def get_graph_stats():
    """
    Get graph statistics (node counts, relationship counts, etc.).

    Returns:
        Statistics dictionary
    """
    try:
        graph = GraphService()
        stats = graph.get_graph_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/subgraph")
async def get_subgraph(
    center_id: str = Query(..., description="ID of center node (use '*' for all nodes)"),
    depth: int = Query(2, description="Traversal depth"),
    node_types: Optional[List[str]] = Query(None, description="Filter by node types"),
):
    """
    Get subgraph around a central node.

    Args:
        center_id: ID of center node (use '*' for all nodes)
        depth: How many hops to traverse (default: 2)
        node_types: Optional list of node types to include

    Returns:
        Subgraph with nodes and relationships
    """
    try:
        graph = GraphService()

        # Handle "*" as wildcard to return all nodes
        if center_id == "*":
            # Get full graph
            full_graph = graph.export_full_graph(current_only=True)
            return full_graph

        # Convert string node types to enums
        type_filters = None
        if node_types:
            try:
                type_filters = [NodeType(t) for t in node_types]
            except ValueError as e:
                raise HTTPException(status_code=400, detail=f"Invalid node type: {e}")

        subgraph = graph.get_subgraph(center_id, depth, type_filters)
        return subgraph
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/node/{node_id}/history")
async def get_node_history(
    node_id: str,
    node_type: str = Query(..., description="Type of node (Decision, Task, Claim)"),
):
    """
    Get version history for a node.

    Args:
        node_id: Node ID or key
        node_type: Type of node

    Returns:
        List of node versions
    """
    try:
        graph = GraphService()

        # Convert string to enum
        try:
            type_enum = NodeType(node_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid node type: {node_type}")

        history = graph.get_node_history(type_enum, node_id)
        return {"node_id": node_id, "node_type": node_type, "versions": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/state")
async def get_time_travel_state(
    timestamp: str = Query(..., description="ISO format timestamp"),
    node_type: str = Query("Decision", description="Type of node"),
):
    """
    Get graph state at a specific point in time (time-travel query).

    Args:
        timestamp: ISO format timestamp
        node_type: Type of node to query

    Returns:
        Nodes valid at that timestamp
    """
    try:
        graph = GraphService()

        # Convert string to enum
        try:
            type_enum = NodeType(node_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid node type: {node_type}")

        nodes = graph.get_state_at_time(type_enum, timestamp)
        return {"timestamp": timestamp, "node_type": node_type, "nodes": nodes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/export")
async def export_graph(
    current_only: bool = Query(True, description="Only export current versions"),
):
    """
    Export entire graph.

    Args:
        current_only: Only export current versions (default: True)

    Returns:
        Full graph export with nodes and relationships
    """
    try:
        graph = GraphService()
        export_data = graph.export_full_graph(current_only)
        return export_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync")
async def sync_to_graph(
    entity_type: str = Query(..., description="Entity type to sync (persons, decisions, tasks, claims, topics, all)"),
    limit: Optional[int] = Query(None, description="Limit per entity type"),
    db: Session = Depends(get_db),
):
    """
    Sync PostgreSQL data to Neo4j graph.

    Args:
        entity_type: Type of entity to sync (persons, decisions, tasks, claims, topics, all)
        limit: Optional limit on number of entities per type

    Returns:
        Sync statistics
    """
    try:
        sync = SyncService(db)

        if entity_type == "all":
            result = await sync.full_sync(limit)
        elif entity_type == "persons":
            result = await sync.sync_all_persons(limit)
        elif entity_type == "decisions":
            result = await sync.sync_all_decisions(limit)
        elif entity_type == "tasks":
            result = await sync.sync_all_tasks(limit)
        elif entity_type == "claims":
            result = await sync.sync_all_claims(limit)
        elif entity_type == "topics":
            result = await sync.sync_all_topics(limit)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid entity type: {entity_type}")

        return {"message": "Sync complete", "results": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/initialize")
async def initialize_graph_schema():
    """
    Initialize graph schema (create indexes and constraints).

    Returns:
        Success message
    """
    try:
        graph = GraphService()
        graph.initialize_schema()
        return {"message": "Graph schema initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_graph(
    q: str = Query(..., description="Search query"),
    node_type: str = Query("Decision", description="Type of node to search"),
    limit: int = Query(100, description="Maximum results"),
):
    """
    Search nodes by text.

    Args:
        q: Search query
        node_type: Type of node to search
        limit: Maximum results

    Returns:
        List of matching nodes
    """
    try:
        graph = GraphService()

        # Convert string to enum
        try:
            type_enum = NodeType(node_type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid node type: {node_type}")

        results = graph.search_nodes(type_enum, q, limit=limit)
        return {"query": q, "node_type": node_type, "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
