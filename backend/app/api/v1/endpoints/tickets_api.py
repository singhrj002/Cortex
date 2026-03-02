"""
Tickets API — JIRA-like work item tracking.
GET  /api/v1/tickets
GET  /api/v1/tickets/{key}        — e.g. /tickets/SEC-007
PATCH /api/v1/tickets/{key}/status
POST /api/v1/tickets              — create new ticket
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.ticket import Ticket, TicketStatus, TicketPriority

router = APIRouter()


class TicketStatusUpdate(BaseModel):
    status: str
    updated_by: Optional[str] = None
    note: Optional[str] = None


class TicketCreate(BaseModel):
    key: str
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    assignee_name: Optional[str] = None
    assignee_email: Optional[str] = None
    team_name: Optional[str] = None
    sprint: int = 3
    story_points: int = 0


@router.get("/")
def list_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    team: Optional[str] = None,
    assignee: Optional[str] = None,
    blocked_only: bool = False,
    sprint: int = 3,
    db: Session = Depends(get_db),
):
    """Return all tickets with optional filters."""
    q = db.query(Ticket).filter(Ticket.sprint == sprint)

    if status:
        try:
            q = q.filter(Ticket.status == TicketStatus(status))
        except ValueError:
            raise HTTPException(400, f"Invalid status: {status}")

    if priority:
        try:
            q = q.filter(Ticket.priority == TicketPriority(priority))
        except ValueError:
            raise HTTPException(400, f"Invalid priority: {priority}")

    if team:
        q = q.filter(Ticket.team_name.ilike(f"%{team}%"))

    if assignee:
        q = q.filter(Ticket.assignee_name.ilike(f"%{assignee}%"))

    if blocked_only:
        q = q.filter(Ticket.is_blocked == "Y")

    tickets = q.order_by(Ticket.priority.desc(), Ticket.days_open.desc()).all()

    return {
        "sprint": sprint,
        "count": len(tickets),
        "blocked_count": sum(1 for t in tickets if t.is_blocked == "Y"),
        "tickets": [t.to_dict() for t in tickets],
    }


@router.get("/{key}")
def get_ticket(key: str, db: Session = Depends(get_db)):
    """Get a specific ticket by its JIRA-style key (e.g. SEC-007)."""
    ticket = db.query(Ticket).filter(Ticket.key == key.upper()).first()
    if not ticket:
        raise HTTPException(404, f"Ticket '{key}' not found")
    return ticket.to_dict()


@router.patch("/{key}/status")
def update_ticket_status(
    key: str,
    body: TicketStatusUpdate,
    db: Session = Depends(get_db),
):
    """Update ticket status. Triggers health score recalculation on next fetch."""
    ticket = db.query(Ticket).filter(Ticket.key == key.upper()).first()
    if not ticket:
        raise HTTPException(404, f"Ticket '{key}' not found")

    try:
        ticket.status = TicketStatus(body.status)
    except ValueError:
        raise HTTPException(400, f"Invalid status: {body.status}")

    if body.status == "done":
        from datetime import datetime
        ticket.closed_at = datetime.utcnow()
        ticket.is_blocked = "N"

    db.commit()
    db.refresh(ticket)
    return {"status": "updated", "ticket": ticket.to_dict()}


@router.post("/")
def create_ticket(body: TicketCreate, db: Session = Depends(get_db)):
    """Create a new ticket."""
    existing = db.query(Ticket).filter(Ticket.key == body.key.upper()).first()
    if existing:
        raise HTTPException(409, f"Ticket '{body.key}' already exists")

    try:
        status   = TicketStatus(body.status)
        priority = TicketPriority(body.priority)
    except ValueError as e:
        raise HTTPException(400, str(e))

    ticket = Ticket(
        key=body.key.upper(),
        title=body.title,
        description=body.description,
        status=status,
        priority=priority,
        assignee_name=body.assignee_name,
        assignee_email=body.assignee_email,
        team_name=body.team_name,
        sprint=body.sprint,
        story_points=body.story_points,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket.to_dict()
