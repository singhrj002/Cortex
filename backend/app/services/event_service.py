"""
Event service for handling event operations.
Includes Enron dataset ingestion and event management.
"""

from typing import List, Optional
from datetime import datetime
import os
import logging
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.event import Event
from app.models.person import Person
from app.schemas.event import EventCreate, EventResponse
from app.utils.email_parser import parse_email_text, extract_person_name
from app.core.config import settings

logger = logging.getLogger(__name__)


class EventService:
    """Service for handling event operations and Enron dataset ingestion."""

    def __init__(self, db: Session):
        self.db = db

    async def get_events(
        self,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None,
        topic: Optional[str] = None,
        team: Optional[str] = None,
        q: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[EventResponse]:
        """
        Get events with filtering options.

        Args:
            from_date: Filter events after this date
            to_date: Filter events before this date
            topic: Filter by topic name
            team: Filter by team name
            q: Search query for content
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of events matching the filters
        """
        query = self.db.query(Event)

        # Apply filters
        if from_date:
            query = query.filter(Event.timestamp >= from_date)
        if to_date:
            query = query.filter(Event.timestamp <= to_date)
        if q:
            # Search in subject and body
            search_filter = or_(
                Event.subject.ilike(f"%{q}%"),
                Event.body_text.ilike(f"%{q}%"),
                Event.sender.ilike(f"%{q}%")
            )
            query = query.filter(search_filter)

        # Order by timestamp descending
        query = query.order_by(Event.timestamp.desc())

        # Apply pagination
        events = query.offset(skip).limit(limit).all()

        # Convert to response schema
        return [self._event_to_response(event) for event in events]

    async def create_event(self, event_data: EventCreate) -> EventResponse:
        """
        Create a new event.

        Args:
            event_data: Event creation data

        Returns:
            Created event response
        """
        # Create event model
        event = Event(
            source=event_data.source,
            channel=event_data.channel,
            thread_id=event_data.thread_id,
            timestamp=event_data.timestamp,
            sender=event_data.actor.get("email", ""),
            recipients=[p.get("email") for p in event_data.audience],
            subject=event_data.subject,
            body_text=event_data.content,
            content_hash=event_data.metadata.get("content_hash", ""),
            raw_metadata=event_data.metadata,
        )

        # Check for duplicate
        existing = self.db.query(Event).filter(
            Event.content_hash == event.content_hash
        ).first()

        if existing:
            logger.info(f"Duplicate event detected: {event.content_hash}")
            return self._event_to_response(existing)

        # Save to database
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)

        logger.info(f"Created event: {event.id}")
        return self._event_to_response(event)

    async def ingest_enron_data(
        self,
        path: str,
        limit: Optional[int] = None,
        batch_size: int = 100
    ) -> dict:
        """
        Ingest data from Enron email dataset.

        The Enron dataset structure is typically:
        enron_mail_YYYYMMDD/
          ├── maildir/
          │   ├── person1/
          │   │   ├── sent/
          │   │   ├── inbox/
          │   │   └── ...
          │   └── person2/
          │       └── ...

        Args:
            path: Path to the Enron dataset directory
            limit: Maximum number of emails to process (None = all)
            batch_size: Number of emails to commit per batch

        Returns:
            Dictionary with ingestion statistics
        """
        stats = {
            "total_processed": 0,
            "total_saved": 0,
            "total_duplicates": 0,
            "total_errors": 0,
            "persons_created": 0,
        }

        # Validate path
        enron_path = Path(path)
        if not enron_path.exists():
            raise FileNotFoundError(f"Enron dataset not found at: {path}")

        # Find maildir
        maildir = enron_path / "maildir" if (enron_path / "maildir").exists() else enron_path

        if not maildir.exists():
            raise FileNotFoundError(f"maildir not found in: {path}")

        logger.info(f"Starting Enron ingestion from: {maildir}")

        # Collect email files
        email_files = []
        for email_file in maildir.rglob("*"):
            if email_file.is_file() and not email_file.name.startswith('.'):
                email_files.append(email_file)
                if limit and len(email_files) >= limit:
                    break

        logger.info(f"Found {len(email_files)} email files to process")

        # Process in batches
        batch = []
        person_cache = {}  # Cache for person lookups

        for idx, email_file in enumerate(email_files):
            try:
                # Read email file
                with open(email_file, 'r', encoding='utf-8', errors='ignore') as f:
                    raw_text = f.read()

                # Parse email
                parsed = parse_email_text(raw_text)

                # Skip if parsing failed
                if not parsed.get("sender") or not parsed.get("body_text"):
                    stats["total_errors"] += 1
                    continue

                # Check for duplicate
                existing = self.db.query(Event).filter(
                    Event.content_hash == parsed["content_hash"]
                ).first()

                if existing:
                    stats["total_duplicates"] += 1
                    stats["total_processed"] += 1
                    continue

                # Create event
                event = Event(
                    source="enron",
                    channel="email",
                    thread_id=parsed["raw_metadata"].get("in_reply_to"),
                    timestamp=parsed["timestamp"] or datetime.utcnow(),
                    sender=parsed["sender"],
                    recipients=parsed["recipients"],
                    cc=parsed["cc"],
                    bcc=parsed["bcc"],
                    subject=parsed["subject"],
                    body_text=parsed["body_text"],
                    content_hash=parsed["content_hash"],
                    raw_metadata=parsed["raw_metadata"],
                )

                batch.append(event)

                # Upsert persons
                all_emails = [parsed["sender"]] + parsed["recipients"] + parsed.get("cc", [])
                for email_addr in all_emails:
                    if email_addr and email_addr not in person_cache:
                        person = self._upsert_person(email_addr, parsed, person_cache)
                        if person:
                            stats["persons_created"] += 1

                stats["total_processed"] += 1

                # Commit batch
                if len(batch) >= batch_size:
                    self.db.bulk_save_objects(batch)
                    self.db.commit()
                    stats["total_saved"] += len(batch)
                    logger.info(f"Processed {stats['total_processed']}/{len(email_files)} emails, saved {stats['total_saved']}")
                    batch = []

            except Exception as e:
                logger.error(f"Error processing {email_file}: {e}")
                stats["total_errors"] += 1
                continue

        # Commit remaining batch
        if batch:
            self.db.bulk_save_objects(batch)
            self.db.commit()
            stats["total_saved"] += len(batch)

        logger.info(f"Enron ingestion complete: {stats}")
        return stats

    def _upsert_person(
        self,
        email: str,
        parsed_email: dict,
        cache: dict
    ) -> Optional[Person]:
        """
        Create or update person record.

        Args:
            email: Person's email address
            parsed_email: Parsed email data (for extracting name)
            cache: In-memory cache to avoid duplicate queries

        Returns:
            Person object or None if already cached
        """
        if email in cache:
            return None

        # Check if person exists
        person = self.db.query(Person).filter(Person.email == email).first()

        if person:
            # Update last_seen and event_count
            person.last_seen = datetime.utcnow()
            person.event_count += 1
            cache[email] = person
            return None
        else:
            # Extract name
            name = extract_person_name(email)

            # Create new person
            person = Person(
                email=email,
                name=name,
                first_seen=parsed_email.get("timestamp") or datetime.utcnow(),
                last_seen=datetime.utcnow(),
                event_count=1,
            )
            self.db.add(person)
            cache[email] = person
            return person

    def _event_to_response(self, event: Event) -> EventResponse:
        """Convert Event model to EventResponse schema."""
        return EventResponse(
            id=str(event.id),
            content_hash=event.content_hash,
            source=event.source,
            channel=event.channel,
            thread_id=event.thread_id,
            timestamp=event.timestamp,
            actor={"name": "", "email": event.sender},
            audience=[{"name": "", "email": email} for email in (event.recipients or [])],
            subject=event.subject,
            content=event.body_text,
            attachments=[],
            metadata={
                "cc": event.cc,
                "bcc": event.bcc,
                **event.raw_metadata
            } if event.raw_metadata else {"cc": event.cc, "bcc": event.bcc},
            created_at=event.created_at,
        )
