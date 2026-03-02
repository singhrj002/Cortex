from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from datetime import datetime
from sqlalchemy.orm import Session

from app.schemas.event import EventResponse, EventCreate
from app.services.event_service import EventService
from app.db.session import get_db

router = APIRouter()


def get_event_service(db: Session = Depends(get_db)) -> EventService:
    """Dependency for EventService."""
    return EventService(db)


@router.get("/", response_model=List[EventResponse])
async def get_events(
    from_date: Optional[datetime] = Query(None, alias="from"),
    to_date: Optional[datetime] = Query(None, alias="to"),
    topic: Optional[str] = None,
    team: Optional[str] = None,
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    service: EventService = Depends(get_event_service),
):
    """
    Retrieve events with optional filtering by date range, topic, team, or search query.
    """
    return await service.get_events(from_date, to_date, topic, team, q, skip, limit)


@router.post("/ingest/enron/load")
async def ingest_enron_data(
    path: str,
    limit: Optional[int] = None,
    service: EventService = Depends(get_event_service),
):
    """
    Load and ingest events from Enron email dataset.

    Args:
        path: Path to Enron dataset directory
        limit: Optional limit on number of emails to process

    Returns:
        Ingestion statistics
    """
    try:
        stats = await service.ingest_enron_data(path, limit)
        return {
            "message": f"Successfully processed {stats['total_processed']} emails",
            "stats": stats
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ingest/upload")
async def upload_document(
    # file: UploadFile,
    service: EventService = Depends(get_event_service),
):
    """
    Upload and process a document (txt/pdf) to create events.
    """
    # This would use a file upload, but for now we'll just return a placeholder
    return {"message": "File upload endpoint (to be implemented)"}


@router.post("/", response_model=EventResponse)
async def create_event(
    event: EventCreate,
    service: EventService = Depends(get_event_service),
):
    """
    Create a new event manually.
    """
    return await service.create_event(event)


@router.post("/{event_id}/extract")
async def trigger_extraction(
    event_id: str,
    use_workflow: bool = Query(True, description="Use LangGraph multi-agent workflow"),
    db: Session = Depends(get_db)
):
    """
    Trigger extraction for a specific event.

    Args:
        event_id: Event UUID
        use_workflow: Use LangGraph workflow (True) or simple extraction (False)
        db: Database session

    Returns:
        Task info
    """
    from app.models.event import Event
    from app.worker import process_event_with_workflow, process_event_extraction

    # Verify event exists
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")

    # Trigger appropriate task
    if use_workflow:
        task = process_event_with_workflow.delay(event_id)
        task_type = "workflow"
    else:
        task = process_event_extraction.delay(event_id)
        task_type = "simple"

    return {
        "message": f"Extraction triggered for event {event_id}",
        "task_id": task.id,
        "task_type": task_type,
        "event_id": event_id
    }


@router.post("/extract/batch")
async def trigger_batch_extraction(
    event_ids: List[str],
    use_workflow: bool = Query(True, description="Use LangGraph multi-agent workflow"),
):
    """
    Trigger extraction for multiple events.

    Args:
        event_ids: List of event UUIDs
        use_workflow: Use LangGraph workflow

    Returns:
        Batch task info
    """
    from app.worker import process_event_with_workflow, batch_process_events

    if use_workflow:
        # Trigger individual workflow tasks for each event
        tasks = []
        for event_id in event_ids:
            task = process_event_with_workflow.delay(event_id)
            tasks.append({"event_id": event_id, "task_id": task.id})

        return {
            "message": f"Triggered workflow extraction for {len(event_ids)} events",
            "tasks": tasks
        }
    else:
        # Use batch extraction
        task = batch_process_events.delay(event_ids)
        return {
            "message": f"Triggered batch extraction for {len(event_ids)} events",
            "task_id": task.id,
            "event_count": len(event_ids)
        }