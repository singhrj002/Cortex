"""
Subscription model for user preferences on notifications.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, JSON, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class Subscription(Base):
    """
    User subscriptions to topics, keywords, or entities.

    Allows users to:
    - Subscribe to specific topics
    - Follow specific people
    - Get notified on keyword matches
    - Set notification preferences
    """
    __tablename__ = "subscriptions"
    __table_args__ = (
        UniqueConstraint('person_id', 'subscription_type', 'target_id', name='unique_subscription'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Subscriber
    person_id = Column(UUID(as_uuid=True), ForeignKey("persons.id"), nullable=False, index=True)

    # Subscription target
    subscription_type = Column(String(50), nullable=False, index=True)  # topic, person, keyword, decision, project
    target_id = Column(String(255), nullable=True, index=True)  # ID of topic, person, etc. (null for keyword subscriptions)
    target_name = Column(String(255), nullable=False)  # Display name

    # Preferences
    notification_enabled = Column(Boolean, default=True, nullable=False)
    email_enabled = Column(Boolean, default=False, nullable=False)  # Future: email notifications
    priority_filter = Column(String(20), nullable=True)  # Only notify if priority >= this level

    # Metadata
    keywords = Column(JSON, nullable=True)  # For keyword subscriptions
    extra_data = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    person = relationship("Person", back_populates="subscriptions")

    def __repr__(self):
        return f"<Subscription person={self.person_id} type={self.subscription_type} target={self.target_name}>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization."""
        return {
            "id": str(self.id),
            "person_id": str(self.person_id),
            "subscription_type": self.subscription_type,
            "target_id": self.target_id,
            "target_name": self.target_name,
            "notification_enabled": self.notification_enabled,
            "email_enabled": self.email_enabled,
            "priority_filter": self.priority_filter,
            "keywords": self.keywords,
            "extra_data": self.extra_data,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
