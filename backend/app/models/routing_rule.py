"""
Routing rule model for configurable notification routing.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.db.session import Base


class RoutingRule(Base):
    """
    Configurable routing rules for determining notification recipients.

    Rules can be based on:
    - Entity type (decision, task, claim)
    - Person attributes (role, team, keywords)
    - Content matching (keywords, topics)
    - Graph relationships (mentions, dependencies)
    """
    __tablename__ = "routing_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Rule metadata
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    rule_type = Column(String(50), nullable=False, index=True)  # mention, owner, assignee, topic_subscriber, keyword, custom

    # Rule configuration
    entity_type = Column(String(50), nullable=True)  # decision, task, claim, conflict (null = all types)
    conditions = Column(JSON, nullable=False)  # Matching conditions

    # Priority and behavior
    priority = Column(Integer, default=50, nullable=False)  # Higher priority rules evaluated first
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    notification_priority = Column(String(20), default="normal")  # Priority level for generated notifications

    # Deduplication
    deduplicate = Column(Boolean, default=True)  # Avoid duplicate notifications to same person

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String(255), nullable=True)  # Admin user who created rule

    def __repr__(self):
        return f"<RoutingRule {self.name} type={self.rule_type}>"

    def to_dict(self):
        """Convert to dictionary for JSON serialization."""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "rule_type": self.rule_type,
            "entity_type": self.entity_type,
            "conditions": self.conditions,
            "priority": self.priority,
            "is_active": self.is_active,
            "notification_priority": self.notification_priority,
            "deduplicate": self.deduplicate,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
