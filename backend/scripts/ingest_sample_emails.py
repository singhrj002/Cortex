#!/usr/bin/env python3
"""
Script to ingest sample emails into the AI Chief of Staff system.
Reads the sample emails from the frontend test data and creates Events.
"""

import asyncio
import hashlib
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

import httpx
from sqlalchemy.orm import Session

# Add parent directory to path for imports
import sys
sys.path.append(str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.models.event import Event
from app.models.person import Person
from app.services.event_service import EventService


# Sample emails data (converted from TypeScript)
SAMPLE_EMAILS = [
    {
        "id": "e001",
        "from": {"name": "John Smith", "email": "john.smith@acme.com"},
        "to": [{"name": "Alice Chen", "email": "alice.chen@company.com"}],
        "cc": [{"name": "Product Team", "email": "product@company.com"}],
        "subject": "Project Alpha Status Update - Q1 2026",
        "body": {
            "text": """Hi Alice,

I wanted to provide you with the latest status update for Project Alpha.

Current progress:
- Frontend redesign: 85% complete
- Backend API refactoring: 75% complete
- Database migration: 90% complete
- Integration tests: 50% complete

Key achievements this week:
1. Successfully migrated 3 out of 4 database shards with zero downtime
2. Fixed 28 critical bugs identified during QA testing
3. Implemented the new dashboard analytics module

Challenges:
- We're experiencing some performance issues with the new search functionality
- The third-party payment gateway integration is taking longer than expected

Next steps:
1. Complete the remaining database shard migration by Feb 15
2. Resolve performance issues with the search functionality
3. Finalize integration with the payment gateway
4. Begin comprehensive system testing

Please let me know if you have any questions or concerns.

Best regards,
John Smith
Senior Project Manager
ACME Corporation
Phone: +1 (555) 123-4567"""
        },
        "date": "2026-02-07T14:35:00Z",
        "importance": "high"
    },
    {
        "id": "e002",
        "from": {"name": "Sarah Johnson", "email": "sarah.johnson@partner.org"},
        "to": [{"name": "Alice Chen", "email": "alice.chen@company.com"}],
        "subject": "Partnership Opportunity - New Market Expansion",
        "body": {
            "text": """Hello Alice,

I hope this email finds you well. I'm reaching out to discuss an exciting partnership opportunity between our organizations.

As you may know, Partner Organization is planning to expand into the Asian market in Q3 2026, and we believe that a strategic partnership with Company would be mutually beneficial. Your expertise in the region combined with our product offerings could create significant value for both our customers and stakeholders.

Key benefits of the partnership:
- Accelerated market entry for both organizations
- Shared resources and reduced operational costs
- Cross-promotion opportunities
- Combined technology stack advantages

I've attached a detailed proposal for your review. The document includes market analysis, potential partnership models, and projected financial outcomes.

Would you be available for a virtual meeting next week to discuss this further? I'm flexible on Tuesday and Thursday between 10 AM and 2 PM EST.

Looking forward to your response.

Best regards,
Sarah Johnson
Business Development Director
Partner Organization
sarah.johnson@partner.org
+1 (555) 987-6543"""
        },
        "date": "2026-02-06T09:15:00Z",
        "importance": "high"
    },
    {
        "id": "e003",
        "from": {"name": "Tech Newsletter", "email": "newsletter@tech-weekly.com"},
        "to": [{"name": "Subscribers", "email": "subscribers@tech-weekly.com"}],
        "subject": "This Week in Tech: AI Breakthroughs, Quantum Computing, and More",
        "body": {
            "text": """THIS WEEK IN TECH
February 5, 2026

TOP STORIES

1. REVOLUTIONARY AI MODEL BREAKS REASONING BARRIERS
Researchers at OpenMind Labs have unveiled a new AI model that demonstrates unprecedented reasoning capabilities. The model, named "LogicNet-7", successfully solved complex mathematical proofs and demonstrated causal reasoning abilities that closely mirror human cognitive processes.

2. QUANTUM COMPUTING REACHES COMMERCIAL MILESTONE
QuantumWave Technologies announced the first commercially viable quantum computer with 1,000+ stable qubits. The system, priced at $15 million, is already being deployed in pharmaceutical research, cryptography, and climate modeling applications.

3. GLOBAL TECH REGULATION FRAMEWORK PROPOSED
The International Technology Coalition (ITC) has proposed a comprehensive global framework for technology regulation. The proposal addresses AI ethics, data privacy, platform accountability, and digital market competition.

4. NEUROMORPHIC CHIPS SET NEW EFFICIENCY RECORDS
BrainSilicon's new neuromorphic chip performs AI tasks while consuming 95% less energy than conventional processors.

5. CLIMATE TECH INVESTMENT REACHES $500 BILLION
Global investment in climate technology has surpassed $500 billion annually, with carbon capture, alternative energy storage, and sustainable agriculture technologies leading the growth."""
        },
        "date": "2026-02-05T08:00:00Z",
        "importance": "normal"
    },
    {
        "id": "e004",
        "from": {"name": "Michael Brown", "email": "michael.brown@company.com"},
        "to": [{"name": "Alice Chen", "email": "alice.chen@company.com"}],
        "subject": "Urgent: Security Incident Report - Action Required",
        "body": {
            "text": """SECURITY INCIDENT NOTIFICATION
CLASSIFICATION: CONFIDENTIAL

Dear Alice,

I'm writing to inform you about a security incident that was detected by our monitoring systems at 02:35 UTC today. Our security team has identified suspicious activity that may indicate unauthorized access attempts to our customer database.

INCIDENT DETAILS:
- Timestamp: 2026-02-06 02:35:12 UTC
- Target: Customer Database (us-east-db-cluster)
- Nature: Multiple failed authentication attempts followed by a successful login
- Origin: IP address: 185.126.xxx.xxx (Location: Eastern Europe)
- Current Status: The suspicious session has been terminated and the affected account locked

ACTIONS TAKEN SO FAR:
1. Terminated all active sessions for the affected service accounts
2. Implemented temporary IP blocking rules for the suspicious sources
3. Increased logging and monitoring across all database clusters
4. Notified the InfoSec team who have begun an investigation

REQUIRED ACTIONS FROM YOU:
1. Approve the emergency access protocol for the InfoSec team (form attached)
2. Authorize the temporary shutdown of external database access if deemed necessary
3. Prepare for a possible emergency executive briefing if the investigation uncovers a confirmed breach

We will provide hourly updates as the situation develops. Please acknowledge receipt of this email at your earliest convenience.

Regards,
Michael Brown
Chief Information Security Officer
Company"""
        },
        "date": "2026-02-06T03:15:00Z",
        "importance": "high"
    },
    {
        "id": "e005",
        "from": {"name": "HR Department", "email": "hr@company.com"},
        "to": [{"name": "All Employees", "email": "employees@company.com"}],
        "subject": "Annual Performance Review Process - 2026",
        "body": {
            "text": """Dear Colleagues,

This email provides information about the upcoming annual performance review process for 2026.

SCHEDULE:
- Self-assessment submission: February 20-28, 2026
- Manager reviews: March 1-15, 2026
- Review discussions: March 16-31, 2026
- Performance ratings finalized: April 10, 2026
- Compensation adjustments effective: May 1, 2026

WHAT'S NEW THIS YEAR:
- We've simplified the assessment form based on your feedback
- Added a new "Career Aspirations" section
- Introduced an optional peer feedback component

ACTION REQUIRED:
1. Complete your self-assessment in Workday by February 28
2. Submit 3-5 peer feedback requests by February 15 (optional)
3. Update your career goals and development plan

RESOURCES:
- Performance review guidelines and FAQs are available on the HR portal
- Review workshops will be held in each office (schedule attached)
- For questions, contact your HR Business Partner

Best regards,
HR Department"""
        },
        "date": "2026-02-05T15:30:00Z",
        "importance": "normal"
    }
]


def create_events_from_samples(db: Session) -> List[Event]:
    """Create Event records from sample emails."""
    events = []

    for email_data in SAMPLE_EMAILS:
        # Extract data
        sender = email_data["from"]["email"]
        recipients = [r["email"] for r in email_data.get("to", [])]
        cc = [r["email"] for r in email_data.get("cc", [])] if email_data.get("cc") else None
        subject = email_data.get("subject", "")
        body = email_data["body"]["text"]
        timestamp = datetime.fromisoformat(email_data["date"].replace("Z", "+00:00"))

        # Create content hash for deduplication
        content_for_hash = f"{sender}{subject}{body}"
        content_hash = hashlib.sha256(content_for_hash.encode()).hexdigest()

        # Check if event already exists
        existing = db.query(Event).filter(Event.content_hash == content_hash).first()
        if existing:
            print(f"⏭️  Skipping duplicate email: {subject}")
            continue

        # Create event
        event = Event(
            source="sample_data",
            channel="email",
            timestamp=timestamp,
            sender=sender,
            recipients=recipients,
            cc=cc,
            subject=subject,
            body_text=body,
            content_hash=content_hash,
            extraction_status="pending",
            raw_metadata={
                "from_name": email_data["from"]["name"],
                "importance": email_data.get("importance", "normal"),
                "original_id": email_data.get("id")
            }
        )

        db.add(event)
        events.append(event)
        print(f"✅ Created event: {subject}")

    # Commit events first
    if events:
        db.commit()
        print(f"\n✨ Successfully created {len(events)} events")
    else:
        print("\n⚠️  No new events created (all were duplicates)")
        return events

    # Now upsert persons for all events
    print("\n👥 Creating/updating person records...")
    persons_seen = set()  # Track emails we've already processed in this run

    for email_data in SAMPLE_EMAILS:
        all_emails = [email_data["from"]] + email_data.get("to", [])
        if email_data.get("cc"):
            all_emails.extend(email_data["cc"])

        timestamp = datetime.fromisoformat(email_data["date"].replace("Z", "+00:00"))

        for person_data in all_emails:
            email = person_data["email"]

            # Skip if we've already processed this email in this run
            if email in persons_seen:
                continue
            persons_seen.add(email)

            # Check if person exists in database
            person = db.query(Person).filter(Person.email == email).first()
            if not person:
                person = Person(
                    email=email,
                    name=person_data["name"],
                    first_seen=timestamp,
                    last_seen=timestamp,
                    event_count=1
                )
                db.add(person)
                print(f"  ✅ Created person: {person_data['name']} ({email})")
            else:
                person.last_seen = max(person.last_seen, timestamp)
                person.event_count += 1
                print(f"  ♻️  Updated person: {person_data['name']} ({email})")

    db.commit()
    print(f"\n✅ Person records updated successfully")

    return events


async def trigger_extractions(event_ids: List[str], use_workflow: bool = True):
    """Trigger extraction for created events."""
    api_url = "http://localhost:8000"

    async with httpx.AsyncClient(timeout=60.0) as client:
        for event_id in event_ids:
            try:
                print(f"🔄 Triggering extraction for event {event_id}...")
                response = await client.post(
                    f"{api_url}/api/v1/events/{event_id}/extract",
                    params={"use_workflow": use_workflow}
                )

                if response.status_code == 200:
                    result = response.json()
                    print(f"  ✅ Extraction started: Task ID {result.get('task_id')}")
                else:
                    print(f"  ❌ Failed: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"  ❌ Error: {e}")


def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(description="Ingest sample emails into the system")
    parser.add_argument(
        "--extract",
        action="store_true",
        help="Trigger extraction workflow after creating events"
    )
    parser.add_argument(
        "--simple",
        action="store_true",
        help="Use simple extraction instead of LangGraph workflow"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("AI Chief of Staff - Sample Email Ingestion")
    print("=" * 60)
    print()

    # Create events
    db = SessionLocal()
    try:
        events = create_events_from_samples(db)
        event_ids = [str(event.id) for event in events]

        if events and args.extract:
            print("\n" + "=" * 60)
            print("Triggering Extraction Workflow")
            print("=" * 60)
            print()
            asyncio.run(trigger_extractions(event_ids, use_workflow=not args.simple))
            print("\n💡 Tip: Check the Celery worker logs to see extraction progress")
            print("💡 Tip: Visit http://localhost:3000/decisions to see extracted decisions")
        elif events:
            print("\n💡 Tip: Run with --extract flag to automatically trigger extraction")
            print(f"💡 Tip: Or use the Admin panel at http://localhost:3000/admin")

    finally:
        db.close()

    print("\n" + "=" * 60)
    print("Ingestion Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
