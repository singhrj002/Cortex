"""
Routing service for intelligent notification recipient determination.
Uses Coordinator Agent output, routing rules, and user subscriptions.
"""

import logging
from typing import Dict, List, Set, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.person import Person
from app.models.routing_rule import RoutingRule
from app.models.subscription import Subscription
from app.models.extraction import Decision, Task, Claim
from app.models.topic import Topic

logger = logging.getLogger(__name__)


class RoutingService:
    """
    Service for determining notification recipients.

    Combines:
    1. Coordinator Agent routing decisions (from multi-agent workflow)
    2. Configurable routing rules (database)
    3. User subscriptions (topics, keywords, people)
    4. Graph-based routing (mentions, relationships)
    """

    def __init__(self, db: Session):
        """
        Initialize routing service.

        Args:
            db: Database session
        """
        self.db = db

    def determine_recipients(
        self,
        entity_type: str,
        entity_id: str,
        entity_data: Dict[str, Any],
        coordinator_routing: Optional[Dict] = None,
        event_data: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """
        Determine who should receive notifications for an entity.

        Args:
            entity_type: Type of entity (decision, task, claim, conflict)
            entity_id: Entity UUID
            entity_data: Entity details
            coordinator_routing: Routing decisions from Coordinator Agent
            event_data: Original event data for context

        Returns:
            List of recipients with details: [{email, reason, priority, metadata}]
        """
        logger.info(f"[RoutingService] Determining recipients for {entity_type} {entity_id}")

        recipients: Set[str] = set()
        recipient_details: Dict[str, Dict] = {}

        # 1. Use Coordinator Agent routing if provided
        if coordinator_routing:
            self._apply_coordinator_routing(
                coordinator_routing, recipients, recipient_details
            )

        # 2. Apply direct attribution (owner, assignee)
        self._apply_direct_attribution(
            entity_type, entity_data, recipients, recipient_details
        )

        # 3. Apply routing rules
        self._apply_routing_rules(
            entity_type, entity_data, event_data, recipients, recipient_details
        )

        # 4. Apply user subscriptions
        self._apply_subscriptions(
            entity_type, entity_data, recipients, recipient_details
        )

        # 5. Apply graph-based routing (mentions)
        if event_data:
            self._apply_mentions(
                event_data, recipients, recipient_details
            )

        # Convert to list and deduplicate
        final_recipients = []
        for email in recipients:
            details = recipient_details.get(email, {})
            final_recipients.append({
                "email": email,
                "reason": details.get("reason", "You may be interested in this"),
                "priority": details.get("priority", "normal"),
                "metadata": details.get("metadata", {})
            })

        logger.info(f"[RoutingService] Determined {len(final_recipients)} recipients")
        return final_recipients

    def _apply_coordinator_routing(
        self,
        coordinator_routing: Dict,
        recipients: Set[str],
        recipient_details: Dict
    ):
        """Apply routing decisions from Coordinator Agent."""
        notify_list = coordinator_routing.get("notify", [])

        for item in notify_list:
            email = item.get("email")
            if email:
                recipients.add(email)
                recipient_details[email] = {
                    "reason": item.get("reason", "Coordinator Agent determined relevance"),
                    "priority": item.get("priority", "normal"),
                    "metadata": {"source": "coordinator_agent"}
                }

    def _apply_direct_attribution(
        self,
        entity_type: str,
        entity_data: Dict,
        recipients: Set[str],
        recipient_details: Dict
    ):
        """Apply direct attribution (owner, assignee, creator)."""

        if entity_type == "decision":
            # Notify decision owner
            owner_email = entity_data.get("owner_email")
            if owner_email:
                recipients.add(owner_email)
                recipient_details[owner_email] = {
                    "reason": "You own this decision",
                    "priority": "high",
                    "metadata": {"role": "owner"}
                }

            # Notify decided_by participants
            decided_by = entity_data.get("decided_by", [])
            for person_id in decided_by:
                person = self.db.query(Person).filter(Person.id == person_id).first()
                if person:
                    recipients.add(person.email)
                    recipient_details[person.email] = {
                        "reason": "You participated in this decision",
                        "priority": "high",
                        "metadata": {"role": "participant"}
                    }

        elif entity_type == "task":
            # Notify task assignee
            assignee_email = entity_data.get("assignee_email")
            if assignee_email:
                recipients.add(assignee_email)
                recipient_details[assignee_email] = {
                    "reason": "This task is assigned to you",
                    "priority": entity_data.get("priority", "normal"),
                    "metadata": {"role": "assignee"}
                }

            # Notify task creator
            created_by_email = entity_data.get("created_by_email")
            if created_by_email and created_by_email != assignee_email:
                recipients.add(created_by_email)
                recipient_details[created_by_email] = {
                    "reason": "You created this task",
                    "priority": "normal",
                    "metadata": {"role": "creator"}
                }

        elif entity_type == "claim":
            # Notify claimant
            claimant_email = entity_data.get("claimant_email")
            if claimant_email:
                recipients.add(claimant_email)
                recipient_details[claimant_email] = {
                    "reason": "You made this claim",
                    "priority": "normal",
                    "metadata": {"role": "claimant"}
                }

    def _apply_routing_rules(
        self,
        entity_type: str,
        entity_data: Dict,
        event_data: Optional[Dict],
        recipients: Set[str],
        recipient_details: Dict
    ):
        """Apply configurable routing rules from database."""

        # Get active routing rules for this entity type
        rules = self.db.query(RoutingRule).filter(
            RoutingRule.is_active == True,
            (RoutingRule.entity_type == entity_type) | (RoutingRule.entity_type == None)
        ).order_by(RoutingRule.priority.desc()).all()

        for rule in rules:
            matched_emails = self._evaluate_rule(rule, entity_data, event_data)
            for email in matched_emails:
                recipients.add(email)
                if email not in recipient_details:  # Don't override existing reasons
                    recipient_details[email] = {
                        "reason": f"Routing rule: {rule.name}",
                        "priority": rule.notification_priority,
                        "metadata": {"rule_id": str(rule.id), "rule_type": rule.rule_type}
                    }

    def _evaluate_rule(
        self,
        rule: RoutingRule,
        entity_data: Dict,
        event_data: Optional[Dict]
    ) -> List[str]:
        """
        Evaluate a routing rule and return matching emails.

        Rule types:
        - mention: Notify people mentioned in text
        - owner: Notify entity owner
        - topic_subscriber: Notify topic subscribers
        - keyword: Notify on keyword match
        - team: Notify specific teams
        """
        emails = []

        conditions = rule.conditions or {}

        if rule.rule_type == "topic_subscriber":
            # Get topics from entity_data
            topics = entity_data.get("topics", [])
            topic_names = [t.get("name") if isinstance(t, dict) else t for t in topics]

            # Find subscribers
            for topic_name in topic_names:
                topic = self.db.query(Topic).filter(Topic.name == topic_name).first()
                if topic:
                    subscriptions = self.db.query(Subscription).filter(
                        Subscription.subscription_type == "topic",
                        Subscription.target_id == str(topic.id),
                        Subscription.notification_enabled == True
                    ).all()

                    for sub in subscriptions:
                        person = self.db.query(Person).filter(Person.id == sub.person_id).first()
                        if person:
                            emails.append(person.email)

        elif rule.rule_type == "keyword":
            # Check for keyword matches
            keywords = conditions.get("keywords", [])
            text_to_search = ""

            if entity_data.get("title"):
                text_to_search += entity_data["title"] + " "
            if entity_data.get("summary"):
                text_to_search += entity_data["summary"] + " "
            if event_data and event_data.get("body"):
                text_to_search += event_data["body"]

            text_lower = text_to_search.lower()

            for keyword in keywords:
                if keyword.lower() in text_lower:
                    # Find subscribers to this keyword
                    subscriptions = self.db.query(Subscription).filter(
                        Subscription.subscription_type == "keyword",
                        Subscription.notification_enabled == True
                    ).all()

                    for sub in subscriptions:
                        sub_keywords = sub.keywords or []
                        if keyword.lower() in [k.lower() for k in sub_keywords]:
                            person = self.db.query(Person).filter(Person.id == sub.person_id).first()
                            if person:
                                emails.append(person.email)

        elif rule.rule_type == "team":
            # Notify specific teams
            team_ids = conditions.get("team_ids", [])
            persons = self.db.query(Person).filter(Person.team_id.in_(team_ids)).all()
            emails.extend([p.email for p in persons])

        return list(set(emails))  # Deduplicate

    def _apply_subscriptions(
        self,
        entity_type: str,
        entity_data: Dict,
        recipients: Set[str],
        recipient_details: Dict
    ):
        """Apply user subscriptions (topics, keywords, people)."""

        # Topic subscriptions already handled in routing rules
        # Person subscriptions: notify followers
        if entity_type in ["decision", "claim"]:
            owner_id = entity_data.get("owner_id") or entity_data.get("claimant_id")
            if owner_id:
                subscriptions = self.db.query(Subscription).filter(
                    Subscription.subscription_type == "person",
                    Subscription.target_id == str(owner_id),
                    Subscription.notification_enabled == True
                ).all()

                for sub in subscriptions:
                    person = self.db.query(Person).filter(Person.id == sub.person_id).first()
                    if person:
                        recipients.add(person.email)
                        if person.email not in recipient_details:
                            recipient_details[person.email] = {
                                "reason": "You follow this person",
                                "priority": "normal",
                                "metadata": {"subscription_type": "person"}
                            }

    def _apply_mentions(
        self,
        event_data: Dict,
        recipients: Set[str],
        recipient_details: Dict
    ):
        """Apply mention-based routing (people mentioned in text)."""

        # Extract emails from body text (simple regex-based extraction)
        import re
        body = event_data.get("body", "")
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        mentioned_emails = re.findall(email_pattern, body)

        for email in mentioned_emails:
            # Verify person exists in database
            person = self.db.query(Person).filter(Person.email == email).first()
            if person:
                recipients.add(email)
                if email not in recipient_details:
                    recipient_details[email] = {
                        "reason": "You were mentioned in this communication",
                        "priority": "normal",
                        "metadata": {"source": "mention"}
                    }

    def create_default_rules(self) -> List[RoutingRule]:
        """
        Create default routing rules for new installations.

        Returns:
            List of created routing rules
        """
        default_rules = [
            {
                "name": "notify_decision_owner",
                "description": "Notify decision owner when decision is created or updated",
                "rule_type": "owner",
                "entity_type": "decision",
                "conditions": {},
                "priority": 100,
                "notification_priority": "high",
            },
            {
                "name": "notify_task_assignee",
                "description": "Notify person when task is assigned to them",
                "rule_type": "assignee",
                "entity_type": "task",
                "conditions": {},
                "priority": 100,
                "notification_priority": "high",
            },
            {
                "name": "notify_conflict_parties",
                "description": "Notify all parties involved in a conflict",
                "rule_type": "custom",
                "entity_type": "conflict",
                "conditions": {"notify_all_parties": True},
                "priority": 90,
                "notification_priority": "urgent",
            },
            {
                "name": "notify_topic_subscribers",
                "description": "Notify users subscribed to relevant topics",
                "rule_type": "topic_subscriber",
                "entity_type": None,  # All entity types
                "conditions": {},
                "priority": 50,
                "notification_priority": "normal",
            },
        ]

        created_rules = []
        for rule_data in default_rules:
            # Check if rule already exists
            existing = self.db.query(RoutingRule).filter(
                RoutingRule.name == rule_data["name"]
            ).first()

            if not existing:
                rule = RoutingRule(**rule_data)
                self.db.add(rule)
                created_rules.append(rule)

        if created_rules:
            self.db.commit()
            logger.info(f"[RoutingService] Created {len(created_rules)} default routing rules")

        return created_rules
