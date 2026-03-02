"""
Person model for deduplicated organizational entities.
Tracks individuals across all communication channels.
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Index, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.session import Base


class Person(Base):
    """
    Deduplicated person entity.
    Email serves as the unique identifier across all communications.
    """

    __tablename__ = "persons"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Identification
    email = Column(String(255), unique=True, nullable=False, index=True)  # Primary identifier
    name = Column(String(255), nullable=True, index=True)  # Display name (extracted/parsed)

    # Organization
    team_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True, index=True)

    # Metadata
    extra_data = Column(JSON, nullable=True)  # Additional person-specific data (title, department, etc.)

    # Activity tracking
    first_seen = Column(DateTime(timezone=True), nullable=False)
    last_seen = Column(DateTime(timezone=True), nullable=False)
    event_count = Column(Integer, default=0)  # Number of events this person participated in

    # Housekeeping
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    team = relationship("Team", back_populates="members", lazy="joined")
    notifications = relationship("Notification", back_populates="recipient", foreign_keys="[Notification.recipient_id]")
    subscriptions = relationship("Subscription", back_populates="person")

    __table_args__ = (
        Index('idx_person_email_lower', 'email'),  # Case-insensitive search
        Index('idx_person_last_seen', last_seen.desc()),
    )

    def __repr__(self):
        return f"<Person(id={self.id}, email={self.email}, name={self.name})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "team_id": str(self.team_id) if self.team_id else None,
            "extra_data": self.extra_data,
            "first_seen": self.first_seen.isoformat() if self.first_seen else None,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "event_count": self.event_count,
        }


class Team(Base):
    """
    Team/Department structure for organizational hierarchy.
    """

    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(String(1000), nullable=True)

    # Hierarchy
    parent_id = Column(UUID(as_uuid=True), ForeignKey("teams.id"), nullable=True, index=True)

    # Metadata
    extra_data = Column(JSON, nullable=True)

    # Housekeeping
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    members = relationship("Person", back_populates="team", lazy="select")
    parent = relationship("Team", remote_side=[id], backref="children")

    def __repr__(self):
        return f"<Team(id={self.id}, name={self.name})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "parent_id": str(self.parent_id) if self.parent_id else None,
            "extra_data": self.extra_data,
        }
