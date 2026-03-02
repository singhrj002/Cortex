"""
Notification service for creating and managing user notifications.
Integrates with RoutingService and uses Summarizer Agent for content.
"""

import logging
from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID

from app.models.notification import Notification
from app.models.person import Person
from app.models.extraction import Decision, Task, Claim
from app.models.conflict import Conflict
from app.models.event import Event
from app.services.routing_service import RoutingService

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service for creating and managing notifications.

    Handles:
    1. Notification creation from extraction results
    2. Content generation (titles, bodies)
    3. Delivery tracking
    4. Mark as read/unread
    5. Deduplication
    """

    def __init__(self, db: Session):
        """
        Initialize notification service.

        Args:
            db: Database session
        """
        self.db = db
        self.routing_service = RoutingService(db)

    async def create_notifications_from_extraction(
        self,
        event_id: str,
        extractions: Dict[str, List[Dict]],
        coordinator_routing: Optional[Dict] = None,
        agent_summary: Optional[Dict] = None
    ) -> List[Notification]:
        """
        Create notifications from extraction results.

        Args:
            event_id: Source event UUID
            extractions: Extraction results from Extractor Agent
            coordinator_routing: Routing decisions from Coordinator Agent
            agent_summary: Summary from Summarizer Agent

        Returns:
            List of created notifications
        """
        logger.info(f"[NotificationService] Creating notifications for event {event_id}")

        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            logger.error(f"[NotificationService] Event {event_id} not found")
            return []

        event_data = {
            "sender": event.sender,
            "subject": event.subject,
            "body": event.body_text,
            "timestamp": event.timestamp.isoformat(),
        }

        all_notifications = []

        # Create notifications for decisions
        for decision_data in extractions.get("decisions", []):
            notifications = await self._create_decision_notifications(
                event_id, decision_data, coordinator_routing, event_data
            )
            all_notifications.extend(notifications)

        # Create notifications for tasks
        for task_data in extractions.get("tasks", []):
            notifications = await self._create_task_notifications(
                event_id, task_data, coordinator_routing, event_data
            )
            all_notifications.extend(notifications)

        # Create notifications for claims
        for claim_data in extractions.get("claims", []):
            notifications = await self._create_claim_notifications(
                event_id, claim_data, coordinator_routing, event_data
            )
            all_notifications.extend(notifications)

        # Commit all notifications
        if all_notifications:
            self.db.commit()
            logger.info(f"[NotificationService] Created {len(all_notifications)} notifications")

        return all_notifications

    async def _create_decision_notifications(
        self,
        event_id: str,
        decision_data: Dict,
        coordinator_routing: Optional[Dict],
        event_data: Dict
    ) -> List[Notification]:
        """Create notifications for a decision."""

        # Find the decision in database
        decision = self.db.query(Decision).filter(
            Decision.decision_key == decision_data.get("decision_key")
        ).order_by(Decision.created_at.desc()).first()

        if not decision:
            logger.warning(f"Decision {decision_data.get('decision_key')} not found in database")
            return []

        # Determine recipients
        recipients = self.routing_service.determine_recipients(
            entity_type="decision",
            entity_id=str(decision.id),
            entity_data=self._decision_to_dict(decision),
            coordinator_routing=coordinator_routing,
            event_data=event_data
        )

        # Create notifications
        notifications = []
        for recipient in recipients:
            notification = Notification(
                recipient_email=recipient["email"],
                title=self._generate_decision_title(decision),
                body=self._generate_decision_body(decision, recipient["reason"]),
                notification_type="decision",
                priority=recipient["priority"],
                event_id=event_id,
                decision_id=decision.id,
                reason=recipient["reason"],
                metadata=recipient.get("metadata", {})
            )

            # Link to person if exists
            person = self.db.query(Person).filter(Person.email == recipient["email"]).first()
            if person:
                notification.recipient_id = person.id

            self.db.add(notification)
            notifications.append(notification)

        return notifications

    async def _create_task_notifications(
        self,
        event_id: str,
        task_data: Dict,
        coordinator_routing: Optional[Dict],
        event_data: Dict
    ) -> List[Notification]:
        """Create notifications for a task."""

        # Find the task in database
        task = self.db.query(Task).filter(
            Task.title == task_data.get("title")
        ).order_by(Task.created_at.desc()).first()

        if not task:
            logger.warning(f"Task '{task_data.get('title')}' not found in database")
            return []

        # Determine recipients
        recipients = self.routing_service.determine_recipients(
            entity_type="task",
            entity_id=str(task.id),
            entity_data=self._task_to_dict(task),
            coordinator_routing=coordinator_routing,
            event_data=event_data
        )

        # Create notifications
        notifications = []
        for recipient in recipients:
            notification = Notification(
                recipient_email=recipient["email"],
                title=self._generate_task_title(task),
                body=self._generate_task_body(task, recipient["reason"]),
                notification_type="task",
                priority=recipient["priority"],
                event_id=event_id,
                task_id=task.id,
                reason=recipient["reason"],
                metadata=recipient.get("metadata", {})
            )

            # Link to person if exists
            person = self.db.query(Person).filter(Person.email == recipient["email"]).first()
            if person:
                notification.recipient_id = person.id

            self.db.add(notification)
            notifications.append(notification)

        return notifications

    async def _create_claim_notifications(
        self,
        event_id: str,
        claim_data: Dict,
        coordinator_routing: Optional[Dict],
        event_data: Dict
    ) -> List[Notification]:
        """Create notifications for a claim."""

        # Find the claim in database
        claim = self.db.query(Claim).filter(
            Claim.claim_key == claim_data.get("claim_key")
        ).order_by(Claim.created_at.desc()).first()

        if not claim:
            logger.warning(f"Claim {claim_data.get('claim_key')} not found in database")
            return []

        # Determine recipients
        recipients = self.routing_service.determine_recipients(
            entity_type="claim",
            entity_id=str(claim.id),
            entity_data=self._claim_to_dict(claim),
            coordinator_routing=coordinator_routing,
            event_data=event_data
        )

        # Create notifications
        notifications = []
        for recipient in recipients:
            notification = Notification(
                recipient_email=recipient["email"],
                title=self._generate_claim_title(claim),
                body=self._generate_claim_body(claim, recipient["reason"]),
                notification_type="claim",
                priority=recipient["priority"],
                event_id=event_id,
                reason=recipient["reason"],
                metadata={**recipient.get("metadata", {}), "claim_id": str(claim.id)}
            )

            # Link to person if exists
            person = self.db.query(Person).filter(Person.email == recipient["email"]).first()
            if person:
                notification.recipient_id = person.id

            self.db.add(notification)
            notifications.append(notification)

        return notifications

    # Title generators
    def _generate_decision_title(self, decision: Decision) -> str:
        """Generate notification title for decision."""
        return f"New Decision: {decision.title[:100]}"

    def _generate_task_title(self, task: Task) -> str:
        """Generate notification title for task."""
        return f"Task Assigned: {task.title[:100]}"

    def _generate_claim_title(self, claim: Claim) -> str:
        """Generate notification title for claim."""
        return f"New Claim: {claim.text[:100]}"

    # Body generators
    def _generate_decision_body(self, decision: Decision, reason: str) -> str:
        """Generate notification body for decision."""
        body = f"{reason}\n\n"
        body += f"Decision: {decision.title}\n"
        if decision.summary:
            body += f"Summary: {decision.summary[:200]}...\n"
        if decision.owner:
            body += f"Owner: {decision.owner.name or decision.owner.email}\n"
        body += f"Confidence: {decision.confidence:.0%}"
        return body

    def _generate_task_body(self, task: Task, reason: str) -> str:
        """Generate notification body for task."""
        body = f"{reason}\n\n"
        body += f"Task: {task.title}\n"
        if task.description:
            body += f"Description: {task.description[:200]}...\n"
        if task.assignee:
            body += f"Assignee: {task.assignee.name or task.assignee.email}\n"
        body += f"Priority: {task.priority}\n"
        if task.due_date:
            body += f"Due: {task.due_date.strftime('%Y-%m-%d')}"
        return body

    def _generate_claim_body(self, claim: Claim, reason: str) -> str:
        """Generate notification body for claim."""
        body = f"{reason}\n\n"
        body += f"Claim: {claim.text[:300]}\n"
        if claim.claimant:
            body += f"Claimant: {claim.claimant.name or claim.claimant.email}"
        return body

    # Helper methods to convert models to dicts
    def _decision_to_dict(self, decision: Decision) -> Dict:
        """Convert Decision model to dict for routing."""
        return {
            "decision_key": decision.decision_key,
            "title": decision.title,
            "summary": decision.summary,
            "owner_id": str(decision.owner_id) if decision.owner_id else None,
            "owner_email": decision.owner.email if decision.owner else None,
            "decided_by": decision.decided_by or [],
            "topics": [],  # Would need to query topics
            "confidence": decision.confidence,
        }

    def _task_to_dict(self, task: Task) -> Dict:
        """Convert Task model to dict for routing."""
        return {
            "title": task.title,
            "description": task.description,
            "assignee_id": str(task.assignee_id) if task.assignee_id else None,
            "assignee_email": task.assignee.email if task.assignee else None,
            "created_by_id": str(task.created_by_id) if task.created_by_id else None,
            "created_by_email": task.created_by.email if task.created_by else None,
            "priority": task.priority,
            "status": task.status,
            "topics": [],  # Would need to query topics
        }

    def _claim_to_dict(self, claim: Claim) -> Dict:
        """Convert Claim model to dict for routing."""
        return {
            "claim_key": claim.claim_key,
            "text": claim.text,
            "claimant_id": str(claim.claimant_id) if claim.claimant_id else None,
            "claimant_email": claim.claimant.email if claim.claimant else None,
            "topics": [],  # Would need to query topics
        }

    # Notification management methods
    async def mark_as_read(self, notification_id: UUID, user_email: str) -> Optional[Notification]:
        """
        Mark notification as read.

        Args:
            notification_id: Notification UUID
            user_email: User email (for verification)

        Returns:
            Updated notification or None if not found
        """
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.recipient_email == user_email
        ).first()

        if notification:
            notification.is_read = True
            notification.read_at = datetime.utcnow()
            self.db.commit()
            logger.info(f"[NotificationService] Marked notification {notification_id} as read")
            return notification

        return None

    async def mark_as_delivered(self, notification_id: UUID) -> Optional[Notification]:
        """
        Mark notification as delivered via WebSocket.

        Args:
            notification_id: Notification UUID

        Returns:
            Updated notification or None if not found
        """
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id
        ).first()

        if notification:
            notification.delivered_at = datetime.utcnow()
            self.db.commit()
            logger.debug(f"[NotificationService] Marked notification {notification_id} as delivered")
            return notification

        return None

    async def dismiss_notification(self, notification_id: UUID, user_email: str) -> bool:
        """
        Dismiss notification.

        Args:
            notification_id: Notification UUID
            user_email: User email (for verification)

        Returns:
            True if dismissed, False otherwise
        """
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.recipient_email == user_email
        ).first()

        if notification:
            notification.is_dismissed = True
            self.db.commit()
            logger.info(f"[NotificationService] Dismissed notification {notification_id}")
            return True

        return False

    async def get_user_notifications(
        self,
        user_email: str,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> List[Notification]:
        """
        Get notifications for a user.

        Args:
            user_email: User email
            unread_only: Only return unread notifications
            limit: Maximum number of notifications
            offset: Pagination offset

        Returns:
            List of notifications
        """
        query = self.db.query(Notification).filter(
            Notification.recipient_email == user_email,
            Notification.is_dismissed == False
        )

        if unread_only:
            query = query.filter(Notification.is_read == False)

        notifications = query.order_by(
            Notification.created_at.desc()
        ).limit(limit).offset(offset).all()

        return notifications

    async def get_unread_count(self, user_email: str) -> int:
        """
        Get count of unread notifications for a user.

        Args:
            user_email: User email

        Returns:
            Count of unread notifications
        """
        count = self.db.query(Notification).filter(
            Notification.recipient_email == user_email,
            Notification.is_read == False,
            Notification.is_dismissed == False
        ).count()

        return count
