"""
Ticket model — JIRA-like work items tracked per sprint.
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

from app.db.session import Base


class TicketStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    REVIEW = "review"
    DONE = "done"


class TicketPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Ticket(Base):
    """JIRA-like work item. Tracks sprint progress and team velocity."""

    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(32), unique=True, nullable=False, index=True)  # e.g. SEC-007
    title = Column(String(255), nullable=False)
    description = Column(Text)

    status = Column(SQLEnum(TicketStatus), default=TicketStatus.TODO, nullable=False)
    priority = Column(SQLEnum(TicketPriority), default=TicketPriority.MEDIUM, nullable=False)

    # People
    assignee_name = Column(String(100))
    assignee_email = Column(String(200))
    reporter_name = Column(String(100))

    # Sprint / team
    team_name = Column(String(100))
    sprint = Column(Integer, default=3)

    # Metrics
    story_points = Column(Integer, default=0)
    days_open = Column(Integer, default=0)

    # Flags
    is_blocked = Column(String(1), default="N")   # Y/N
    is_shadow = Column(String(1), default="N")     # shadow work flag
    is_conflict_linked = Column(String(1), default="N")
    conflict_id = Column(String(100))              # links to conflicts table

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_tickets_team", "team_name"),
        Index("ix_tickets_status", "status"),
        Index("ix_tickets_assignee", "assignee_email"),
    )

    def to_dict(self):
        return {
            "id": str(self.id),
            "key": self.key,
            "title": self.title,
            "description": self.description,
            "status": self.status.value if self.status else None,
            "priority": self.priority.value if self.priority else None,
            "assignee_name": self.assignee_name,
            "team_name": self.team_name,
            "sprint": self.sprint,
            "days_open": self.days_open,
            "is_blocked": self.is_blocked == "Y",
            "is_shadow": self.is_shadow == "Y",
            "is_conflict_linked": self.is_conflict_linked == "Y",
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,
        }
