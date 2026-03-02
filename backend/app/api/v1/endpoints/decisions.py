"""
API endpoints for decision management.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.extraction import Decision, ExtractionStatus
from app.schemas.event import EventResponse

router = APIRouter()


@router.get("/")
async def get_decisions(
    status: Optional[str] = None,
    topic: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """
    Get decisions with optional filtering.

    Args:
        status: Filter by status (proposed, confirmed, deprecated)
        topic: Filter by topic name
        skip: Number of records to skip
        limit: Maximum number of records

    Returns:
        List of decisions
    """
    query = db.query(Decision)

    if status:
        try:
            status_enum = ExtractionStatus(status)
            query = query.filter(Decision.status == status_enum)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status}")

    decisions = query.order_by(Decision.created_at.desc()).offset(skip).limit(limit).all()

    return [decision.to_dict() for decision in decisions]


@router.get("/recent")
async def get_recent_decisions(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Get recent decisions ordered by creation time.

    Args:
        limit: Maximum number of decisions to return (default: 10, max: 100)

    Returns:
        List of recent decisions
    """
    decisions = db.query(Decision).order_by(Decision.created_at.desc()).limit(limit).all()
    return [decision.to_dict() for decision in decisions]


@router.get("/{decision_id}")
async def get_decision(
    decision_id: str,
    db: Session = Depends(get_db),
):
    """
    Get a single decision by ID.

    Args:
        decision_id: Decision UUID

    Returns:
        Decision details
    """
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    return decision.to_dict()


@router.get("/{decision_id}/versions")
async def get_decision_versions(
    decision_id: str,
    db: Session = Depends(get_db),
):
    """
    Get all versions of a decision.

    Args:
        decision_id: Decision UUID or decision_key

    Returns:
        List of decision versions
    """
    # Try to find by ID first, then by decision_key
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        decision = db.query(Decision).filter(Decision.decision_key == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    # Get all versions with same decision_key
    versions = db.query(Decision).filter(
        Decision.decision_key == decision.decision_key
    ).order_by(Decision.version.desc()).all()

    return [v.to_dict() for v in versions]


@router.post("/{decision_id}/verify")
async def verify_decision(
    decision_id: str,
    db: Session = Depends(get_db),
):
    """
    Verify a decision (change status to confirmed).

    Args:
        decision_id: Decision UUID

    Returns:
        Updated decision
    """
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    decision.status = ExtractionStatus.CONFIRMED
    db.commit()
    db.refresh(decision)

    return {"message": "Decision verified", "decision": decision.to_dict()}


@router.post("/{decision_id}/deprecate")
async def deprecate_decision(
    decision_id: str,
    db: Session = Depends(get_db),
):
    """
    Deprecate a decision (mark as obsolete).

    Args:
        decision_id: Decision UUID

    Returns:
        Updated decision
    """
    decision = db.query(Decision).filter(Decision.id == decision_id).first()

    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    decision.status = ExtractionStatus.DEPRECATED
    db.commit()
    db.refresh(decision)

    return {"message": "Decision deprecated", "decision": decision.to_dict()}
