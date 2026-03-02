"""
Extraction models for LLM-extracted organizational knowledge.
Includes decisions, tasks, claims, risks, and dependencies.
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, Float, ForeignKey, Index, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.session import Base


class ExtractionType(str, enum.Enum):
    """Types of extractions supported by the system."""
    DECISION = "decision"
    TASK = "task"
    CLAIM = "claim"
    RISK = "risk"
    DEPENDENCY = "dependency"


class ExtractionStatus(str, enum.Enum):
    """Status of an extraction."""
    PROPOSED = "proposed"  # Newly extracted, not verified
    CONFIRMED = "confirmed"  # Verified by human or high confidence
    DEPRECATED = "deprecated"  # Superseded or obsolete


class Decision(Base):
    """
    Represents a decision extracted from organizational communications.
    Supports versioning for tracking decision evolution.
    """

    __tablename__ = "decisions"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Unique stable key for versioning
    decision_key = Column(String(255), nullable=False, index=True)  # e.g., "db_choice_api_gateway"

    # Content
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    rationale = Column(Text, nullable=True)
    scope = Column(Text, nullable=True)

    # Status
    status = Column(SQLEnum(ExtractionStatus), default=ExtractionStatus.PROPOSED, nullable=False, index=True)

    # Versioning
    version = Column(String(20), default="1.0", nullable=False)
    superseded_by_id = Column(UUID(as_uuid=True), ForeignKey("decisions.id"), nullable=True)

    # Attribution
    owner_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"), nullable=True, index=True)
    decided_by = Column(JSON, nullable=True)  # List of person IDs involved in decision

    # Impact
    affected_teams = Column(JSON, nullable=True)  # List of team IDs
    affected_projects = Column(JSON, nullable=True)  # List of project IDs

    # Confidence and evidence
    confidence = Column(Float, nullable=False, default=0.5)  # 0.0 to 1.0
    evidence_event_ids = Column(JSON, nullable=True)  # List of event IDs supporting this decision

    # Metadata
    extra_data = Column(JSON, nullable=True)

    # Housekeeping
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("Person", foreign_keys=[owner_id], lazy="joined")
    notifications = relationship("Notification", back_populates="decision")

    __table_args__ = (
        Index('idx_decision_key_version', 'decision_key', 'version'),
        Index('idx_decision_status', 'status'),
        Index('idx_decision_confidence', 'confidence'),
    )

    def __repr__(self):
        return f"<Decision(id={self.id}, key={self.decision_key}, title={self.title[:50]})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "decision_key": self.decision_key,
            "title": self.title,
            "summary": self.summary,
            "rationale": self.rationale,
            "scope": self.scope,
            "status": self.status.value if self.status else None,
            "version": self.version,
            "owner_id": str(self.owner_id) if self.owner_id else None,
            "decided_by": self.decided_by,
            "affected_teams": self.affected_teams,
            "affected_projects": self.affected_projects,
            "confidence": self.confidence,
            "evidence_event_ids": self.evidence_event_ids,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Task(Base):
    """
    Represents an action item or task extracted from communications.
    """

    __tablename__ = "tasks"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Content
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)

    # Assignment
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"), nullable=True, index=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"), nullable=True)

    # Status
    status = Column(String(50), default="open", index=True)  # open, in_progress, completed, blocked
    priority = Column(String(20), default="normal")  # low, normal, high, urgent

    # Timing
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Confidence and evidence
    confidence = Column(Float, nullable=False, default=0.5)
    evidence_event_ids = Column(JSON, nullable=True)

    # Metadata
    extra_data = Column(JSON, nullable=True)

    # Housekeeping
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    assignee = relationship("Person", foreign_keys=[assignee_id], lazy="joined")
    created_by = relationship("Person", foreign_keys=[created_by_id], lazy="joined")
    notifications = relationship("Notification", back_populates="task")

    __table_args__ = (
        Index('idx_task_status', 'status'),
        Index('idx_task_due_date', 'due_date'),
        Index('idx_task_assignee', 'assignee_id', 'status'),
    )

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title[:50]}, status={self.status})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "assignee_id": str(self.assignee_id) if self.assignee_id else None,
            "status": self.status,
            "priority": self.priority,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "confidence": self.confidence,
            "evidence_event_ids": self.evidence_event_ids,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Claim(Base):
    """
    Represents a factual claim or statement extracted from communications.
    Used for contradiction detection and organizational knowledge tracking.
    """

    __tablename__ = "claims"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Unique stable key
    claim_key = Column(String(255), nullable=False, index=True)

    # Content
    text = Column(Text, nullable=False)
    polarity = Column(String(20), nullable=True)  # positive, negative, neutral

    # Attribution
    claimant_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"), nullable=True, index=True)

    # Classification
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=True, index=True)

    # Confidence and evidence
    confidence = Column(Float, nullable=False, default=0.5)
    evidence_event_ids = Column(JSON, nullable=True)

    # Metadata
    extra_data = Column(JSON, nullable=True)

    # Housekeeping
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    claimant = relationship("Person", lazy="joined")
    topic = relationship("Topic", lazy="joined")

    __table_args__ = (
        Index('idx_claim_key', 'claim_key'),
        Index('idx_claim_topic', 'topic_id'),
        Index('idx_claim_confidence', 'confidence'),
    )

    def __repr__(self):
        return f"<Claim(id={self.id}, key={self.claim_key}, text={self.text[:50]})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "claim_key": self.claim_key,
            "text": self.text,
            "polarity": self.polarity,
            "claimant_id": str(self.claimant_id) if self.claimant_id else None,
            "topic_id": str(self.topic_id) if self.topic_id else None,
            "confidence": self.confidence,
            "evidence_event_ids": self.evidence_event_ids,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
