"""
Topic model for categorizing and organizing organizational knowledge.
Supports hierarchical topic taxonomy.
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, Float, ForeignKey, Index, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.session import Base


class Topic(Base):
    """
    Represents a topic or theme extracted from organizational communications.
    Supports hierarchical categorization (parent/child relationships).
    """

    __tablename__ = "topics"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Content
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    keywords = Column(JSON, nullable=True)  # List of keywords associated with this topic

    # Hierarchy
    parent_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=True, index=True)

    # Activity tracking
    mention_count = Column(Integer, default=0)  # Number of times this topic appears
    last_mentioned = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    extra_data = Column(JSON, nullable=True)

    # Housekeeping
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    parent = relationship("Topic", remote_side=[id], backref="children")

    __table_args__ = (
        Index('idx_topic_name_lower', 'name'),
        Index('idx_topic_mention_count', mention_count.desc()),
        Index('idx_topic_last_mentioned', last_mentioned.desc()),
    )

    def __repr__(self):
        return f"<Topic(id={self.id}, name={self.name}, mention_count={self.mention_count})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "keywords": self.keywords,
            "parent_id": str(self.parent_id) if self.parent_id else None,
            "mention_count": self.mention_count,
            "last_mentioned": self.last_mentioned.isoformat() if self.last_mentioned else None,
            "extra_data": self.extra_data,
        }


class TopicAssociation(Base):
    """
    Associates topics with various entities (events, decisions, tasks, claims).
    Many-to-many relationship with confidence scoring.
    """

    __tablename__ = "topic_associations"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Topic reference
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False, index=True)

    # Entity reference (polymorphic)
    entity_type = Column(String(50), nullable=False, index=True)  # event, decision, task, claim
    entity_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Confidence score for this association
    confidence = Column(Float, nullable=False, default=0.5)

    # Housekeeping
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    topic = relationship("Topic", lazy="joined")

    __table_args__ = (
        Index('idx_topic_assoc_entity', 'entity_type', 'entity_id'),
        Index('idx_topic_assoc_topic_entity', 'topic_id', 'entity_type', 'entity_id', unique=True),
    )

    def __repr__(self):
        return f"<TopicAssociation(topic_id={self.topic_id}, entity={self.entity_type}:{self.entity_id})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "topic_id": str(self.topic_id),
            "entity_type": self.entity_type,
            "entity_id": str(self.entity_id),
            "confidence": self.confidence,
        }
