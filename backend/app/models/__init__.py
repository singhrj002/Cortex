"""
Models package - exports all database models.
Import from this module to ensure all models are registered with SQLAlchemy.
"""

from app.models.event import Event
from app.models.person import Person, Team
from app.models.extraction import Decision, Task, Claim, ExtractionType, ExtractionStatus
from app.models.conflict import Conflict, ConflictType, ConflictSeverity, ConflictStatus
from app.models.topic import Topic, TopicAssociation
from app.models.notification import Notification
from app.models.routing_rule import RoutingRule
from app.models.subscription import Subscription

__all__ = [
    # Event models
    "Event",

    # Person/Team models
    "Person",
    "Team",

    # Extraction models
    "Decision",
    "Task",
    "Claim",
    "ExtractionType",
    "ExtractionStatus",

    # Conflict models
    "Conflict",
    "ConflictType",
    "ConflictSeverity",
    "ConflictStatus",

    # Topic models
    "Topic",
    "TopicAssociation",

    # Notification models
    "Notification",
    "RoutingRule",
    "Subscription",
]
