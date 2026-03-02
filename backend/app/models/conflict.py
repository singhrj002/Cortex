"""
Conflict model for tracking contradictions and conflicts in organizational knowledge.
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, Float, ForeignKey, Index, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.session import Base


class ConflictType(str, enum.Enum):
    """Types of conflicts detected by the system."""
    DECISION_CONFLICT = "decision_conflict"  # Contradictory decisions
    CLAIM_CONFLICT = "claim_conflict"  # Contradictory claims/statements
    RESOURCE_CONFLICT = "resource_conflict"  # Overlapping resource allocation
    TIMELINE_CONFLICT = "timeline_conflict"  # Impossible task dependencies
    PRIORITY_CONFLICT = "priority_conflict"  # Conflicting priorities


class ConflictSeverity(str, enum.Enum):
    """Severity levels for conflicts."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ConflictStatus(str, enum.Enum):
    """Status of conflict resolution."""
    OPEN = "open"
    REVIEWING = "reviewing"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class Conflict(Base):
    """
    Represents a detected conflict or contradiction in organizational knowledge.
    Enables tracking and resolution of inconsistencies.
    """

    __tablename__ = "conflicts"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Classification
    conflict_type = Column(SQLEnum(ConflictType), nullable=False, index=True)
    severity = Column(SQLEnum(ConflictSeverity), default=ConflictSeverity.MEDIUM, nullable=False, index=True)
    status = Column(SQLEnum(ConflictStatus), default=ConflictStatus.OPEN, nullable=False, index=True)

    # Conflicting entities
    entity_a_type = Column(String(50), nullable=False)  # decision, task, claim, etc.
    entity_a_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    entity_b_type = Column(String(50), nullable=False)
    entity_b_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Description and evidence
    description = Column(Text, nullable=False)
    evidence = Column(JSON, nullable=True)  # Supporting evidence (event IDs, excerpts, etc.)
    similarity_score = Column(Float, nullable=True)  # For semantic similarity conflicts

    # Resolution
    resolution_type = Column(String(100), nullable=True)  # merge, deprecate_a, deprecate_b, manual
    resolution_notes = Column(Text, nullable=True)
    resolved_by_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    extra_data = Column(JSON, nullable=True)

    # Housekeeping
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    resolved_by = relationship("Person", lazy="joined")

    __table_args__ = (
        Index('idx_conflict_type_status', 'conflict_type', 'status'),
        Index('idx_conflict_severity_status', 'severity', 'status'),
        Index('idx_conflict_entity_a', 'entity_a_type', 'entity_a_id'),
        Index('idx_conflict_entity_b', 'entity_b_type', 'entity_b_id'),
    )

    def __repr__(self):
        return f"<Conflict(id={self.id}, type={self.conflict_type}, severity={self.severity}, status={self.status})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "conflict_type": self.conflict_type.value if self.conflict_type else None,
            "severity": self.severity.value if self.severity else None,
            "status": self.status.value if self.status else None,
            "entity_a": {
                "type": self.entity_a_type,
                "id": str(self.entity_a_id)
            },
            "entity_b": {
                "type": self.entity_b_type,
                "id": str(self.entity_b_id)
            },
            "description": self.description,
            "evidence": self.evidence,
            "similarity_score": self.similarity_score,
            "resolution_type": self.resolution_type,
            "resolution_notes": self.resolution_notes,
            "resolved_by_id": str(self.resolved_by_id) if self.resolved_by_id else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
