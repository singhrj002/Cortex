"""
Extraction service for LLM-based knowledge extraction from events.
Uses OpenAI to extract decisions, tasks, claims, and topics.
"""

import json
import logging
from typing import Dict, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from openai import OpenAI

from app.models.event import Event
from app.models.extraction import Decision, Task, Claim, ExtractionStatus
from app.models.person import Person
from app.models.topic import Topic, TopicAssociation
from app.prompts.extraction_prompts import get_extraction_messages
from app.core.config import settings

logger = logging.getLogger(__name__)


class ExtractionService:
    """Service for extracting structured knowledge from events using LLMs."""

    def __init__(self, db: Session):
        self.db = db
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    async def extract_from_event(self, event_id: str) -> Dict:
        """
        Extract knowledge from a single event.

        Args:
            event_id: UUID of the event to process

        Returns:
            Dictionary with extraction results and statistics
        """
        # Load event
        event = self.db.query(Event).filter(Event.id == event_id).first()
        if not event:
            raise ValueError(f"Event not found: {event_id}")

        # Check if already processed
        if event.extraction_status == "completed":
            logger.info(f"Event {event_id} already processed, skipping")
            return {"status": "skipped", "reason": "already_processed"}

        # Update status to processing
        event.extraction_status = "processing"
        self.db.commit()

        try:
            # Prepare email data for extraction
            timestamp_str = event.timestamp.isoformat() if event.timestamp else "Unknown"

            # Call OpenAI for extraction
            extraction_result = await self._call_openai_extraction(
                sender=event.sender,
                recipients=event.recipients or [],
                subject=event.subject or "",
                timestamp=timestamp_str,
                body=event.body_text or ""
            )

            # Parse and save extractions
            stats = {
                "decisions_created": 0,
                "tasks_created": 0,
                "claims_created": 0,
                "topics_created": 0,
            }

            # Save decisions
            for decision_data in extraction_result.get("decisions", []):
                decision = await self._create_decision(decision_data, event)
                if decision:
                    stats["decisions_created"] += 1

            # Save tasks
            for task_data in extraction_result.get("tasks", []):
                task = await self._create_task(task_data, event)
                if task:
                    stats["tasks_created"] += 1

            # Save claims
            for claim_data in extraction_result.get("claims", []):
                claim = await self._create_claim(claim_data, event)
                if claim:
                    stats["claims_created"] += 1

            # Save topics
            topic_ids = []
            for topic_data in extraction_result.get("topics", []):
                topic = await self._upsert_topic(topic_data)
                if topic:
                    topic_ids.append(topic.id)
                    stats["topics_created"] += 1

            # Associate topics with event
            for topic_id in topic_ids:
                self._create_topic_association(topic_id, "event", event.id)

            # Update event status
            event.extraction_status = "completed"
            self.db.commit()

            logger.info(f"Extracted from event {event_id}: {stats}")
            return {"status": "success", "stats": stats, "extraction": extraction_result}

        except Exception as e:
            logger.error(f"Error extracting from event {event_id}: {e}")
            event.extraction_status = "failed"
            event.extraction_error = str(e)
            self.db.commit()
            return {"status": "error", "error": str(e)}

    async def _call_openai_extraction(
        self,
        sender: str,
        recipients: List[str],
        subject: str,
        timestamp: str,
        body: str
    ) -> Dict:
        """
        Call OpenAI API to perform extraction.

        Args:
            sender: Email sender
            recipients: List of recipients
            subject: Email subject
            timestamp: Email timestamp
            body: Email body text

        Returns:
            Parsed extraction result as dictionary
        """
        # Build messages
        messages = get_extraction_messages(sender, recipients, subject, timestamp, body)

        # Call OpenAI API with JSON mode
        response = self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS,
            response_format={"type": "json_object"}
        )

        # Parse response
        content = response.choices[0].message.content
        result = json.loads(content)

        return result

    async def _create_decision(self, decision_data: Dict, event: Event) -> Optional[Decision]:
        """Create a decision from extraction data."""
        try:
            # Normalize decision_key
            decision_key = self._normalize_key(
                decision_data.get("decision_key_hint", decision_data.get("title", "unknown"))
            )

            # Find owner
            owner_email = decision_data.get("owner_email")
            owner = None
            if owner_email:
                owner = self.db.query(Person).filter(Person.email == owner_email).first()

            # Create decision
            decision = Decision(
                decision_key=decision_key,
                title=decision_data.get("title", ""),
                summary=decision_data.get("summary"),
                rationale=decision_data.get("rationale"),
                scope=decision_data.get("scope"),
                status=ExtractionStatus.PROPOSED,
                version="1.0",
                owner_id=owner.id if owner else None,
                decided_by=decision_data.get("decided_by_emails", []),
                confidence=decision_data.get("confidence", 0.5),
                evidence_event_ids=[str(event.id)],
                metadata={"evidence": decision_data.get("evidence")}
            )

            self.db.add(decision)
            self.db.flush()  # Get ID without committing

            logger.info(f"Created decision: {decision.decision_key}")
            return decision

        except Exception as e:
            logger.error(f"Error creating decision: {e}")
            return None

    async def _create_task(self, task_data: Dict, event: Event) -> Optional[Task]:
        """Create a task from extraction data."""
        try:
            # Find assignee
            assignee_email = task_data.get("assignee_email")
            assignee = None
            if assignee_email:
                assignee = self.db.query(Person).filter(Person.email == assignee_email).first()

            # Parse due_date
            due_date = None
            if task_data.get("due_date"):
                try:
                    due_date = datetime.fromisoformat(task_data["due_date"].replace("Z", "+00:00"))
                except Exception:
                    pass

            # Create task
            task = Task(
                title=task_data.get("title", ""),
                description=task_data.get("description"),
                assignee_id=assignee.id if assignee else None,
                status="open",
                priority=task_data.get("priority", "normal"),
                due_date=due_date,
                confidence=task_data.get("confidence", 0.5),
                evidence_event_ids=[str(event.id)],
                metadata={"evidence": task_data.get("evidence")}
            )

            self.db.add(task)
            self.db.flush()

            logger.info(f"Created task: {task.title}")
            return task

        except Exception as e:
            logger.error(f"Error creating task: {e}")
            return None

    async def _create_claim(self, claim_data: Dict, event: Event) -> Optional[Claim]:
        """Create a claim from extraction data."""
        try:
            # Normalize claim_key
            claim_key = self._normalize_key(
                claim_data.get("claim_key_hint", claim_data.get("text", "unknown")[:50])
            )

            # Find claimant
            claimant_email = claim_data.get("claimant_email")
            claimant = None
            if claimant_email:
                claimant = self.db.query(Person).filter(Person.email == claimant_email).first()

            # Create claim
            claim = Claim(
                claim_key=claim_key,
                text=claim_data.get("text", ""),
                polarity=claim_data.get("polarity"),
                claimant_id=claimant.id if claimant else None,
                confidence=claim_data.get("confidence", 0.5),
                evidence_event_ids=[str(event.id)],
                metadata={"evidence": claim_data.get("evidence")}
            )

            self.db.add(claim)
            self.db.flush()

            logger.info(f"Created claim: {claim.claim_key}")
            return claim

        except Exception as e:
            logger.error(f"Error creating claim: {e}")
            return None

    async def _upsert_topic(self, topic_data: Dict) -> Optional[Topic]:
        """Create or update a topic."""
        try:
            topic_name = topic_data.get("name", "").strip()
            if not topic_name:
                return None

            # Check if topic exists
            topic = self.db.query(Topic).filter(Topic.name == topic_name).first()

            if topic:
                # Update mention count and timestamp
                topic.mention_count += 1
                topic.last_mentioned = datetime.utcnow()
                return topic
            else:
                # Create new topic
                topic = Topic(
                    name=topic_name,
                    keywords=topic_data.get("keywords", []),
                    mention_count=1,
                    last_mentioned=datetime.utcnow()
                )
                self.db.add(topic)
                self.db.flush()
                return topic

        except Exception as e:
            logger.error(f"Error upserting topic: {e}")
            return None

    def _create_topic_association(
        self,
        topic_id: str,
        entity_type: str,
        entity_id: str,
        confidence: float = 0.8
    ):
        """Create topic association if it doesn't exist."""
        try:
            # Check if association exists
            existing = self.db.query(TopicAssociation).filter(
                TopicAssociation.topic_id == topic_id,
                TopicAssociation.entity_type == entity_type,
                TopicAssociation.entity_id == entity_id
            ).first()

            if not existing:
                association = TopicAssociation(
                    topic_id=topic_id,
                    entity_type=entity_type,
                    entity_id=entity_id,
                    confidence=confidence
                )
                self.db.add(association)

        except Exception as e:
            logger.error(f"Error creating topic association: {e}")

    def _normalize_key(self, text: str) -> str:
        """Normalize text to create a stable key."""
        import re

        # Convert to lowercase
        key = text.lower()

        # Replace spaces and special chars with underscores
        key = re.sub(r'[^\w\s-]', '', key)
        key = re.sub(r'[\s-]+', '_', key)

        # Limit length
        key = key[:100]

        # Remove leading/trailing underscores
        key = key.strip('_')

        return key or "unknown"

    async def batch_extract(self, event_ids: List[str]) -> Dict:
        """
        Extract from multiple events in batch.

        Args:
            event_ids: List of event UUIDs

        Returns:
            Dictionary with batch extraction statistics
        """
        results = {
            "total": len(event_ids),
            "success": 0,
            "failed": 0,
            "skipped": 0,
            "total_decisions": 0,
            "total_tasks": 0,
            "total_claims": 0,
            "total_topics": 0,
        }

        for event_id in event_ids:
            result = await self.extract_from_event(event_id)

            if result["status"] == "success":
                results["success"] += 1
                stats = result.get("stats", {})
                results["total_decisions"] += stats.get("decisions_created", 0)
                results["total_tasks"] += stats.get("tasks_created", 0)
                results["total_claims"] += stats.get("claims_created", 0)
                results["total_topics"] += stats.get("topics_created", 0)
            elif result["status"] == "skipped":
                results["skipped"] += 1
            else:
                results["failed"] += 1

        logger.info(f"Batch extraction complete: {results}")
        return results
