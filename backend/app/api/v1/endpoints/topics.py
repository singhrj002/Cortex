"""
API endpoints for topic management.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.topic import Topic, TopicAssociation

router = APIRouter()


@router.get("/")
async def get_topics(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Get all topics.

    Args:
        skip: Number of records to skip
        limit: Maximum number of records

    Returns:
        List of topics
    """
    topics = db.query(Topic).order_by(Topic.mention_count.desc()).offset(skip).limit(limit).all()
    return [topic.to_dict() for topic in topics]


@router.get("/trending")
async def get_trending_topics(
    limit: int = Query(10, description="Number of trending topics"),
    db: Session = Depends(get_db),
):
    """
    Get trending topics (most mentions recently).

    Args:
        limit: Number of topics to return

    Returns:
        List of trending topics
    """
    topics = db.query(Topic).order_by(
        Topic.mention_count.desc(),
        Topic.last_mentioned.desc()
    ).limit(limit).all()

    return [topic.to_dict() for topic in topics]


@router.get("/{topic_id}")
async def get_topic(
    topic_id: str,
    db: Session = Depends(get_db),
):
    """
    Get a single topic by ID.

    Args:
        topic_id: Topic UUID

    Returns:
        Topic details
    """
    topic = db.query(Topic).filter(Topic.id == topic_id).first()

    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    return topic.to_dict()


@router.get("/{topic_id}/entities")
async def get_topic_entities(
    topic_id: str,
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Get entities associated with a topic.

    Args:
        topic_id: Topic UUID
        entity_type: Optional filter by entity type (decision, task, claim, event)
        skip: Number of records to skip
        limit: Maximum number of records

    Returns:
        List of entity associations
    """
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")

    # Query associations
    query = db.query(TopicAssociation).filter(TopicAssociation.topic_id == topic_id)

    if entity_type:
        query = query.filter(TopicAssociation.entity_type == entity_type)

    associations = query.offset(skip).limit(limit).all()

    return {
        "topic": topic.to_dict(),
        "associations": [assoc.to_dict() for assoc in associations]
    }
