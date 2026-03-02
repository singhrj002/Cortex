"""
Event model for storing organizational communications.
Supports emails, documents, meeting transcripts, and other communication channels.
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON, Index, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.session import Base


class Event(Base):
    """
    Stores raw communication events with metadata.
    Serves as the foundation for extraction and knowledge graph construction.
    """

    __tablename__ = "events"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Source and channel
    source = Column(String(50), nullable=False, index=True)  # 'enron', 'slack', 'upload', etc.
    channel = Column(String(50), nullable=False, index=True)  # 'email', 'chat', 'doc', 'meeting'
    thread_id = Column(String(255), nullable=True, index=True)  # For threading conversations

    # Timestamp
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)

    # Participants
    sender = Column(String(255), nullable=False, index=True)  # Email or username
    recipients = Column(JSON, nullable=True)  # List of recipient emails/usernames
    cc = Column(JSON, nullable=True)  # CC list (email-specific)
    bcc = Column(JSON, nullable=True)  # BCC list (email-specific)

    # Content
    subject = Column(String(500), nullable=True)  # Subject line (email-specific)
    body_text = Column(Text, nullable=False)  # Main content
    content_hash = Column(String(64), unique=True, nullable=False, index=True)  # SHA256 for deduplication

    # Metadata
    raw_metadata = Column(JSON, nullable=True)  # Additional source-specific metadata

    # Housekeeping
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Processing status
    extraction_status = Column(String(20), default="pending", index=True)  # pending, processing, completed, failed
    extraction_error = Column(Text, nullable=True)  # Error message if extraction failed

    # Relationships
    notifications = relationship("Notification", back_populates="event")

    __table_args__ = (
        Index('idx_event_timestamp_desc', timestamp.desc()),
        Index('idx_event_source_timestamp', 'source', timestamp.desc()),
        Index('idx_event_extraction_status', 'extraction_status'),
    )

    def __repr__(self):
        return f"<Event(id={self.id}, source={self.source}, sender={self.sender}, timestamp={self.timestamp})>"

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "id": str(self.id),
            "source": self.source,
            "channel": self.channel,
            "thread_id": self.thread_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "sender": self.sender,
            "recipients": self.recipients,
            "cc": self.cc,
            "bcc": self.bcc,
            "subject": self.subject,
            "body_text": self.body_text[:500] + "..." if self.body_text and len(self.body_text) > 500 else self.body_text,
            "content_hash": self.content_hash,
            "extraction_status": self.extraction_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
