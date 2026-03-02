"""
Conflicts API — list conflicts from DB and trigger AI conflict detection.
GET  /api/v1/conflicts
POST /api/v1/conflicts/detect/{event_id}   — run AI detection on a specific event
POST /api/v1/conflicts/detect-all          — scan all unprocessed events
PATCH /api/v1/conflicts/{conflict_id}/resolve
"""

import logging
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.conflict import Conflict, ConflictStatus, ConflictSeverity
from app.models.event import Event
from app.services.conflict_detection_service import (
    detect_conflicts_in_event,
    get_conflict_summary,
)

router = APIRouter()
logger = logging.getLogger(__name__)


def _conflict_response(c: Conflict) -> dict:
    """Serialize a Conflict to the shape the frontend expects."""
    from datetime import datetime as dt, timezone
    now = dt.now(timezone.utc)
    created = c.created_at
    if created and created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    days_open = (now - created).days if created else 0
    entities = (c.extra_data or {}).get("entities", [])
    return {
        **c.to_dict(),
        "entity_ids": entities,
        "days_open": days_open,
    }


class ResolveRequest(BaseModel):
    resolution: str
    resolved_by: Optional[str] = None


@router.get("/")
def list_conflicts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Return all conflicts, optionally filtered by status or severity."""
    q = db.query(Conflict)

    if status:
        try:
            q = q.filter(Conflict.status == ConflictStatus(status))
        except ValueError:
            raise HTTPException(400, f"Invalid status: {status}")

    if severity:
        try:
            q = q.filter(Conflict.severity == ConflictSeverity(severity))
        except ValueError:
            raise HTTPException(400, f"Invalid severity: {severity}")

    conflicts = q.order_by(Conflict.severity.desc(), Conflict.created_at.desc()).all()
    return {
        "total": len(conflicts),
        "conflicts": [_conflict_response(c) for c in conflicts],
    }


@router.get("/summary")
def conflict_summary(db: Session = Depends(get_db)):
    """Return a high-level conflict summary for ARIA briefs."""
    return get_conflict_summary(db)


@router.post("/detect/{event_id}")
async def detect_for_event(
    event_id: UUID,
    background_tasks: BackgroundTasks,
    use_ai: bool = True,
    db: Session = Depends(get_db),
):
    """
    Trigger conflict detection for a specific event using the multi-agent pipeline.
    Returns immediately with task info; detection runs in background.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(404, f"Event {event_id} not found")

    # Run detection in background to avoid request timeout on heavy AI calls
    async def run_detection():
        try:
            result = await detect_conflicts_in_event(event, db, use_ai=use_ai)
            logger.info(f"Detection complete for event {event_id}: {len(result)} conflicts")
        except Exception as exc:
            logger.error(f"Detection failed for event {event_id}: {exc}")

    background_tasks.add_task(run_detection)

    return {
        "status": "detection_queued",
        "event_id": str(event_id),
        "message": f"Conflict detection started for event '{event.subject or event_id}'. Results saved to DB.",
    }


@router.post("/detect-all")
async def detect_all_events(
    background_tasks: BackgroundTasks,
    use_ai: bool = True,
    db: Session = Depends(get_db),
):
    """
    Scan ALL completed events that haven't had conflicts checked yet.
    Runs asynchronously — check GET /conflicts for results.
    """
    events = db.query(Event).filter(Event.extraction_status == "completed").all()

    async def run_bulk():
        for event in events:
            try:
                await detect_conflicts_in_event(event, db, use_ai=use_ai)
            except Exception as exc:
                logger.error(f"Bulk detection error on {event.id}: {exc}")

    background_tasks.add_task(run_bulk)

    return {
        "status": "bulk_detection_queued",
        "events_queued": len(events),
        "message": f"Scanning {len(events)} events for conflicts. Check /conflicts for results.",
    }


@router.patch("/{conflict_id}/resolve")
def resolve_conflict(
    conflict_id: UUID,
    body: ResolveRequest,
    db: Session = Depends(get_db),
):
    """Mark a conflict as resolved. Updates health score on next computation."""
    conflict = db.query(Conflict).filter(Conflict.id == conflict_id).first()
    if not conflict:
        raise HTTPException(404, f"Conflict {conflict_id} not found")

    conflict.status = ConflictStatus.RESOLVED
    conflict.resolution_notes = body.resolution
    # Store resolved_by name in extra_data (field is a UUID FK, not a string)
    extra = conflict.extra_data or {}
    extra["resolved_by"] = body.resolved_by
    conflict.extra_data = extra
    from datetime import datetime as dt, timezone
    conflict.resolved_at = dt.now(timezone.utc)
    db.commit()
    db.refresh(conflict)

    return {"status": "resolved", "conflict": _conflict_response(conflict)}
