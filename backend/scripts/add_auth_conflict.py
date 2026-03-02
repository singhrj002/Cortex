#!/usr/bin/env python
"""
Add OAuth 2.0 vs Basic Auth conflict to the database.

This script adds:
- Security team claim requiring OAuth 2.0
- Frontend team claim about Basic Auth implementation
- A critical conflict between the two teams
- All necessary events and Neo4j relationships

Run this script independently to add the authentication conflict.
"""

import sys
import os
from datetime import datetime, timedelta
import uuid
import json

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.person import Person, Team
from app.models.extraction import Claim
from app.models.conflict import Conflict, ConflictStatus, ConflictSeverity, ConflictType
from app.models.topic import Topic
from app.models.event import Event
from app.services.graph_service import GraphService
from app.models.graph_schema import NodeType, RelationshipType


def add_auth_conflict():
    """Add OAuth 2.0 vs Basic Auth conflict to database."""

    db = SessionLocal()
    graph = GraphService()

    try:
        print("Starting OAuth 2.0 vs Basic Auth conflict creation...")

        # Get or create necessary teams
        security_team = db.query(Team).filter(Team.name == "Security Team").first()
        if not security_team:
            security_team = Team(
                id=uuid.uuid4(),
                name="Security Team",
                description="Handles security reviews and compliance"
            )
            db.add(security_team)
            db.commit()
            print(f"Created Security Team")

            # Create Neo4j node for team
            graph.create_node(
                NodeType.TEAM,
                {
                    "id": str(security_team.id),
                    "name": security_team.name,
                    "description": security_team.description
                }
            )

        frontend_team = db.query(Team).filter(Team.name == "Frontend Team").first()
        if not frontend_team:
            frontend_team = Team(
                id=uuid.uuid4(),
                name="Frontend Team",
                description="Handles client-side development and UX"
            )
            db.add(frontend_team)
            db.commit()
            print(f"Created Frontend Team")

            # Create Neo4j node for team
            graph.create_node(
                NodeType.TEAM,
                {
                    "id": str(frontend_team.id),
                    "name": frontend_team.name,
                    "description": frontend_team.description
                }
            )

        # Get or create security person (Irene Garcia)
        irene = db.query(Person).filter(Person.email == "irene@example.com").first()
        if not irene:
            irene = Person(
                id=uuid.uuid4(),
                name="Irene Garcia",
                email="irene@example.com",
                team_id=security_team.id,
                extra_data=json.dumps({"title": "Security Engineer"}),
                first_seen=datetime.utcnow(),
                last_seen=datetime.utcnow()
            )
            db.add(irene)
            db.commit()
            print(f"Created person: Irene Garcia")

            # Create Neo4j node for person
            person_node = graph.create_node(
                NodeType.PERSON,
                {
                    "id": str(irene.id),
                    "name": irene.name,
                    "email": irene.email
                }
            )

            if person_node:
                graph.create_relationship(
                    str(irene.id),
                    str(security_team.id),
                    RelationshipType.MEMBER_OF
                )

        # Get or create frontend person (Jack Williams)
        jack = db.query(Person).filter(Person.email == "jack@example.com").first()
        if not jack:
            jack = Person(
                id=uuid.uuid4(),
                name="Jack Williams",
                email="jack@example.com",
                team_id=frontend_team.id,
                extra_data=json.dumps({"title": "Frontend Lead"}),
                first_seen=datetime.utcnow(),
                last_seen=datetime.utcnow()
            )
            db.add(jack)
            db.commit()
            print(f"Created person: Jack Williams")

            # Create Neo4j node for person
            person_node = graph.create_node(
                NodeType.PERSON,
                {
                    "id": str(jack.id),
                    "name": jack.name,
                    "email": jack.email
                }
            )

            if person_node:
                graph.create_relationship(
                    str(jack.id),
                    str(frontend_team.id),
                    RelationshipType.MEMBER_OF
                )

        # Get or create topics
        security_topic = db.query(Topic).filter(Topic.name == "Security").first()
        if not security_topic:
            security_topic = Topic(
                id=uuid.uuid4(),
                name="Security",
                description="Security practices and protocols",
                keywords="security,authentication,authorization"
            )
            db.add(security_topic)
            db.commit()
            print(f"Created topic: Security")

            # Create Neo4j node for topic
            graph.create_node(
                NodeType.TOPIC,
                {
                    "id": str(security_topic.id),
                    "name": security_topic.name,
                    "description": security_topic.description
                }
            )

        api_topic = db.query(Topic).filter(Topic.name == "API Services").first()
        if not api_topic:
            api_topic = Topic(
                id=uuid.uuid4(),
                name="API Services",
                description="API design, implementation and management",
                keywords="api,rest,endpoints"
            )
            db.add(api_topic)
            db.commit()
            print(f"Created topic: API Services")

            # Create Neo4j node for topic
            graph.create_node(
                NodeType.TOPIC,
                {
                    "id": str(api_topic.id),
                    "name": api_topic.name,
                    "description": api_topic.description
                }
            )

        # Create events and claims
        now = datetime.utcnow()

        # 1. Basic Auth implementation event (8 days ago)
        basic_auth_event_time = now - timedelta(days=8)
        basic_auth_event = Event(
            id=uuid.uuid4(),
            source="slack",
            channel="message",
            sender=jack.email,
            body_text="We've implemented Basic Auth for the new API endpoints. It was the simplest approach and gets the job done quickly.",
            timestamp=basic_auth_event_time,
            content_hash=str(uuid.uuid4()),
            raw_metadata=json.dumps({
                "channel": "frontend-team",
                "sender_id": str(jack.id),
                "sender_name": jack.name
            })
        )
        db.add(basic_auth_event)
        db.commit()
        print(f"Created Basic Auth implementation event")

        # Create Neo4j node for event
        graph.create_node(
            NodeType.EVENT,
            {
                "id": str(basic_auth_event.id),
                "channel": basic_auth_event.channel,
                "content": basic_auth_event.body_text,
                "timestamp": basic_auth_event.timestamp.isoformat()
            }
        )

        # Create Basic Auth claim
        basic_auth_claim = Claim(
            id=uuid.uuid4(),
            claim_key="basic_auth_implementation",
            text="Frontend team implemented Basic Auth for API endpoints",
            polarity="neutral",
            claimant_id=jack.id,
            topic_id=api_topic.id,
            confidence=0.90,
            evidence_event_ids=[str(basic_auth_event.id)],
            metadata=json.dumps({
                "implementation": "Basic Auth",
                "api_endpoints": ["user-profile", "settings"],
                "reason": "simplicity"
            })
        )
        db.add(basic_auth_claim)
        db.commit()
        print(f"Created Basic Auth claim: {basic_auth_claim.text}")

        # Create Neo4j node for claim
        basic_auth_claim_node = graph.create_node(
            NodeType.CLAIM,
            {
                "id": str(basic_auth_claim.id),
                "claim_key": basic_auth_claim.claim_key,
                "text": basic_auth_claim.text
            }
        )

        # Create relationships for Basic Auth claim
        graph.create_relationship(
            str(jack.id),
            str(basic_auth_claim.id),
            RelationshipType.MADE_CLAIM
        )

        graph.create_relationship(
            str(basic_auth_claim.id),
            str(api_topic.id),
            RelationshipType.RELATES_TO
        )

        graph.create_relationship(
            str(jack.id),
            str(basic_auth_event.id),
            RelationshipType.SENT
        )

        graph.create_relationship(
            str(basic_auth_claim.id),
            str(frontend_team.id),
            RelationshipType.AFFECTS
        )

        # 2. OAuth requirement event (5 days ago)
        auth_conflict_event_time = now - timedelta(days=5)
        auth_conflict_event = Event(
            id=uuid.uuid4(),
            source="email",
            channel="email",
            sender=irene.email,
            subject="RE: API Authentication Standards",
            body_text="The Security team requires all APIs to use OAuth 2.0 for authentication. " +
                   "However, the Frontend team has implemented Basic Auth for the new API endpoints. " +
                   "This violates our security standards and must be addressed immediately. " +
                   "OAuth 2.0 provides token-based authentication with proper expiration and is the required standard.",
            timestamp=auth_conflict_event_time,
            content_hash=str(uuid.uuid4()),
            recipients=json.dumps([
                jack.email,
                "grace@example.com",
                "frank@example.com",
                "security@example.com"
            ]),
            raw_metadata=json.dumps({
                "sender_id": str(irene.id),
                "sender_name": irene.name,
                "importance": "high"
            })
        )
        db.add(auth_conflict_event)
        db.commit()
        print(f"Created OAuth requirement event")

        # Create Neo4j node for event
        graph.create_node(
            NodeType.EVENT,
            {
                "id": str(auth_conflict_event.id),
                "channel": auth_conflict_event.channel,
                "content": auth_conflict_event.body_text,
                "timestamp": auth_conflict_event.timestamp.isoformat()
            }
        )

        # Create OAuth requirement claim
        oauth_claim = Claim(
            id=uuid.uuid4(),
            claim_key="oauth_required_for_apis",
            text="Security team requires OAuth 2.0 for all API authentication",
            polarity="assertive",
            claimant_id=irene.id,
            topic_id=security_topic.id,
            confidence=0.95,
            evidence_event_ids=[str(auth_conflict_event.id)],
            metadata=json.dumps({
                "security_standard": "SEC-STD-012",
                "requirement_level": "mandatory",
                "applies_to": "all_apis"
            })
        )
        db.add(oauth_claim)
        db.commit()
        print(f"Created OAuth claim: {oauth_claim.text}")

        # Create Neo4j node for claim
        oauth_claim_node = graph.create_node(
            NodeType.CLAIM,
            {
                "id": str(oauth_claim.id),
                "claim_key": oauth_claim.claim_key,
                "text": oauth_claim.text
            }
        )

        # Create relationships for OAuth claim
        graph.create_relationship(
            str(irene.id),
            str(oauth_claim.id),
            RelationshipType.MADE_CLAIM
        )

        graph.create_relationship(
            str(oauth_claim.id),
            str(security_topic.id),
            RelationshipType.RELATES_TO
        )

        graph.create_relationship(
            str(irene.id),
            str(auth_conflict_event.id),
            RelationshipType.SENT
        )

        graph.create_relationship(
            str(oauth_claim.id),
            str(security_team.id),
            RelationshipType.AFFECTS
        )

        # Create contradiction relationship between claims
        graph.create_relationship(
            str(oauth_claim.id),
            str(basic_auth_claim.id),
            RelationshipType.CONTRADICTS
        )

        # 3. Create authentication conflict
        auth_conflict = Conflict(
            id=uuid.uuid4(),
            conflict_type=ConflictType.CLAIM_CONFLICT,
            description="Security team requires OAuth 2.0, but Frontend team implemented Basic Auth",
            status=ConflictStatus.OPEN,
            severity=ConflictSeverity.CRITICAL,
            entity_a_type="Claim",
            entity_a_id=oauth_claim.id,
            entity_b_type="Claim",
            entity_b_id=basic_auth_claim.id,
            evidence=json.dumps([
                str(oauth_claim.id),
                str(basic_auth_claim.id),
                str(auth_conflict_event.id),
                str(basic_auth_event.id)
            ]),
            extra_data=json.dumps({
                "teams_involved": ["Security Team", "Frontend Team"],
                "topic": "authentication",
                "security_impact": "critical",
                "requires_immediate_action": True
            })
        )
        db.add(auth_conflict)
        db.commit()
        print(f"Created authentication conflict: {auth_conflict.description}")

        print("\n✅ Successfully created OAuth 2.0 vs Basic Auth conflict!")
        print(f"   - Security Team Claim: {oauth_claim.text}")
        print(f"   - Frontend Team Claim: {basic_auth_claim.text}")
        print(f"   - Conflict Status: {auth_conflict.status.value}")
        print(f"   - Severity: {auth_conflict.severity.value}")
        print(f"   - Affected Teams: Security Team, Frontend Team")

    except Exception as e:
        print(f"❌ Error creating authentication conflict: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    add_auth_conflict()
