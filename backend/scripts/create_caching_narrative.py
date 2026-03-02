#!/usr/bin/env python
"""
Create a complex narrative dataset for the graph visualization demonstrating:
- Claims, topics and decisions
- Decision versioning and evolution
- Conflicts between teams
- Resolution and authority
- Organizational intelligence insights

This script implements the 6-stage narrative about caching technology decisions:
1. Initial claim about Redis for caching
2. First decision to use Redis
3. Decision update to switch from Redis to Memcached
4. Conflict between Infra team standards and the decision
5. Resolution via CTO approval
6. Meta-insights about team tension

Run this script to populate the database with this narrative.
"""

import sys
import os
from datetime import datetime, timedelta
import uuid
import json
from sqlalchemy import select

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.person import Person, Team
from app.models.extraction import Decision, Task, Claim, ExtractionStatus
from enum import Enum
from app.models.conflict import Conflict, ConflictStatus, ConflictSeverity, ConflictType
from app.models.topic import Topic
from app.models.event import Event
from enum import Enum

# Define necessary enums that don't exist in the models
class EventType(str, Enum):
    """Types of events supported by the system."""
    EMAIL = "email"
    MEETING = "meeting"
    MESSAGE = "message"
    DOCUMENT = "document"
    TASK = "task"
from app.services.graph_service import GraphService
from app.models.graph_schema import NodeType, RelationshipType


class NarrativeBuilder:
    """Helper class to build a narrative with consistent IDs and timestamps."""
    
    def __init__(self):
        self.db = SessionLocal()
        self.graph = GraphService()
        
        # Store entities for reference
        self.teams = {}
        self.people = {}
        self.topics = {}
        self.claims = {}
        self.decisions = {}
        self.events = {}
        self.conflicts = {}
        
        # Base timestamp for narrative with more variation
        self.now = datetime.utcnow()
        
        # Create a more varied timeline for decisions and events
        self.timeline = {
            'first_claim': self.now - timedelta(days=60),
            'first_decision': self.now - timedelta(days=55),
            'team_discussion': self.now - timedelta(days=45),
            'performance_testing': self.now - timedelta(days=40),
            'decision_update': self.now - timedelta(days=30),
            'security_review': self.now - timedelta(days=25),
            'conflict_emerges': self.now - timedelta(days=20),
            'qa_findings': self.now - timedelta(days=15),
            'leadership_review': self.now - timedelta(days=10),
            'resolution': self.now - timedelta(days=7),
            'implementation': self.now - timedelta(days=5),
            'final_report': self.now - timedelta(days=2)
        }
        
    def create_base_entities(self):
        """Create base entities (teams, people, topics)"""
        print("Creating base entities...")
        
        # Create Teams
        team_data = [
            {"key": "backend", "name": "Backend Team", "desc": "Handles server-side development and APIs"},
            {"key": "infra", "name": "Infra Team", "desc": "Manages infrastructure and DevOps"},
            {"key": "product", "name": "Product Team", "desc": "Handles product design and management"},
            {"key": "frontend", "name": "Frontend Team", "desc": "Handles client-side development and UX"},
            {"key": "data", "name": "Data Team", "desc": "Manages data pipelines and analytics"},
            {"key": "security", "name": "Security Team", "desc": "Handles security reviews and compliance"},
            {"key": "leadership", "name": "Leadership Team", "desc": "Executive decision makers"},
            {"key": "qa", "name": "QA Team", "desc": "Handles testing and quality assurance"}
        ]
        
        for t in team_data:
            team = self.db.query(Team).filter(Team.name == t["name"]).first()
            if not team:
                team = Team(
                    id=uuid.uuid4(),
                    name=t["name"],
                    description=t["desc"]
                )
                self.db.add(team)
                print(f"Added team: {team.name}")
            self.teams[t["key"]] = team
            
            # Create Neo4j node
            self.graph.create_node(
                NodeType.TEAM,
                {
                    "id": str(team.id),
                    "name": team.name,
                    "description": team.description
                }
            )
        
        # Create People
        people_data = [
            {"key": "alice", "name": "Alice Chen", "email": "alice@example.com", "team": "backend", "title": "Senior Backend Engineer"},
            {"key": "bob", "name": "Bob Smith", "email": "bob@example.com", "team": "infra", "title": "Infrastructure Lead"},
            {"key": "carol", "name": "Carol Jones", "email": "carol@example.com", "team": "product", "title": "Product Manager"},
            {"key": "dave", "name": "Dave Johnson", "email": "dave@example.com", "team": "backend", "title": "Backend Lead"},
            {"key": "emma", "name": "Emma Wilson", "email": "emma@example.com", "team": "infra", "title": "DevOps Engineer"},
            {"key": "frank", "name": "Frank Lee", "email": "frank@example.com", "team": "leadership", "title": "CTO"},
            {"key": "grace", "name": "Grace Kim", "email": "grace@example.com", "team": "frontend", "title": "Frontend Engineer"},
            {"key": "henry", "name": "Henry Patel", "email": "henry@example.com", "team": "data", "title": "Data Engineer"},
            {"key": "irene", "name": "Irene Garcia", "email": "irene@example.com", "team": "security", "title": "Security Engineer"},
            {"key": "jack", "name": "Jack Williams", "email": "jack@example.com", "team": "frontend", "title": "Frontend Lead"},
            {"key": "karen", "name": "Karen Thompson", "email": "karen@example.com", "team": "product", "title": "Senior PM"},
            {"key": "leo", "name": "Leo Chen", "email": "leo@example.com", "team": "qa", "title": "QA Engineer"},
            {"key": "maya", "name": "Maya Rodriguez", "email": "maya@example.com", "team": "backend", "title": "Backend Engineer"},
            {"key": "nina", "name": "Nina Patel", "email": "nina@example.com", "team": "data", "title": "Data Scientist"},
            {"key": "oscar", "name": "Oscar Kim", "email": "oscar@example.com", "team": "leadership", "title": "CEO"}
        ]
        
        for p in people_data:
            person = self.db.query(Person).filter(Person.email == p["email"]).first()
            if not person:
                person = Person(
                    id=uuid.uuid4(),
                    name=p["name"],
                    email=p["email"],
                    team_id=self.teams[p["team"]].id,
                    extra_data=json.dumps({"title": p.get("title", "Engineer")}),
                    first_seen=self.now,
                    last_seen=self.now
                )
                self.db.add(person)
                print(f"Added person: {person.name}")
            self.people[p["key"]] = person
            
            # Create Neo4j node
            person_node = self.graph.create_node(
                NodeType.PERSON,
                {
                    "id": str(person.id),
                    "name": person.name,
                    "email": person.email
                }
            )
            
            # Create MEMBER_OF relationship
            if person_node:
                self.graph.create_relationship(
                    str(person.id),
                    str(self.teams[p["team"]].id),
                    RelationshipType.MEMBER_OF
                )
                print(f"Created relationship: {person.name} MEMBER_OF {self.teams[p['team']].name}")
                
        # Create Topics
        topic_data = [
            {"key": "caching", "name": "Caching", "desc": "Data caching technologies and strategies"},
            {"key": "infrastructure", "name": "Infrastructure", "desc": "Infrastructure and platform technologies"},
            {"key": "api", "name": "API Services", "desc": "API design, implementation and management"},
            {"key": "monitoring", "name": "Monitoring", "desc": "System monitoring and observability"},
            {"key": "security", "name": "Security", "desc": "Security practices and protocols"},
            {"key": "testing", "name": "Testing", "desc": "Testing strategies and frameworks"},
            {"key": "deployment", "name": "Deployment", "desc": "Deployment processes and CI/CD"},
            {"key": "database", "name": "Database", "desc": "Database technologies and data management"},
            {"key": "scaling", "name": "Scaling", "desc": "System scaling and performance optimization"}
        ]
        
        for t in topic_data:
            topic = self.db.query(Topic).filter(Topic.name == t["name"]).first()
            if not topic:
                topic = Topic(
                    id=uuid.uuid4(),
                    name=t["name"],
                    description=t["desc"],
                    keywords=f"{t['name']},{t['key']}"
                )
                self.db.add(topic)
                print(f"Added topic: {topic.name}")
            self.topics[t["key"]] = topic
            
            # Create Neo4j node
            self.graph.create_node(
                NodeType.TOPIC,
                {
                    "id": str(topic.id),
                    "name": topic.name,
                    "description": topic.description
                }
            )
            
        self.db.commit()
        
    def stage1_initial_claim(self):
        """
        Stage 1: Initial claim about Redis for caching and topic connection
        """
        print("\nStage 1: Creating initial claim...")
        
        # Create claim event
        event_time = self.timeline['first_claim']
        event = Event(
            id=uuid.uuid4(),
            source="slack",
            channel="message",
            sender=self.people["alice"].email,
            body_text="I've been testing Redis for our caching needs - it looks promising!",
            timestamp=event_time,
            content_hash=str(uuid.uuid4()),  # Generate a unique hash
            raw_metadata=json.dumps({
                "channel": "backend-team",
                "reactions": ["+1", "rocket"],
                "sender_id": str(self.people["alice"].id),
                "sender_name": self.people["alice"].name
            })
        )
        self.db.add(event)
        self.events["redis_testing"] = event
        
        # Create claim
        # Define ClaimPolarity if it doesn't exist in the model
        class ClaimPolarity(str, Enum):
            """Polarity of a claim (positive, negative, neutral, etc.)."""
            POSITIVE = "positive"
            NEGATIVE = "negative"
            NEUTRAL = "neutral"
            ASSERTIVE = "assertive"
            QUESTIONING = "questioning"
            
        claim = Claim(
            id=uuid.uuid4(),
            claim_key="testing_redis",
            text="Testing Redis for caching",
            polarity="positive", # Use string instead of enum
            claimant_id=self.people["alice"].id,
            topic_id=self.topics["caching"].id,
            confidence=0.85,
            evidence_event_ids=[str(event.id)],
            metadata=json.dumps({
                "source": "slack",
                "initial_mention": True
            })
        )
        self.db.add(claim)
        self.claims["redis_testing"] = claim
        
        self.db.commit()
        
        # Create nodes in Neo4j
        event_node = self.graph.create_node(
            NodeType.EVENT, 
            {
                "id": str(event.id),
                "channel": event.channel,
                "content": event.body_text,
                "timestamp": event.timestamp.isoformat()
            }
        )
        
        claim_node = self.graph.create_node(
            NodeType.CLAIM,
            {
                "id": str(claim.id),
                "claim_key": claim.claim_key,
                "text": claim.text
            }
        )
        
        # Create relationships
        self.graph.create_relationship(
            str(self.people["alice"].id),
            str(claim.id),
            RelationshipType.MADE_CLAIM
        )
        
        self.graph.create_relationship(
            str(claim.id),
            str(self.topics["caching"].id),
            RelationshipType.RELATES_TO
        )
        
        self.graph.create_relationship(
            str(self.people["alice"].id),
            str(event.id),
            RelationshipType.SENT
        )
        
        print(f"Created claim: {claim.text} by {self.people['alice'].name}")
        
    def stage2_first_decision(self):
        """
        Stage 2: First decision to use Redis for caching
        """
        print("\nStage 2: Creating first decision (Redis)...")
        
        # Create meeting event
        event_time = self.timeline['first_decision']
        event = Event(
            id=uuid.uuid4(),
            source="calendar",
            channel="meeting",
            sender=self.people["dave"].email,
            body_text="Backend Team Meeting - Selected Redis for caching in the API service. " +
                   "After evaluating options, we will use Redis for caching in the API service.",
            timestamp=event_time,
            content_hash=str(uuid.uuid4()),  # Generate a unique hash
            recipients=json.dumps([
                self.people["alice"].email,
                self.people["emma"].email
            ]),
            raw_metadata=json.dumps({
                "attendees": [
                    {"email": self.people["alice"].email, "name": self.people["alice"].name},
                    {"email": self.people["dave"].email, "name": self.people["dave"].name},
                    {"email": self.people["emma"].email, "name": self.people["emma"].name}
                ],
                "meeting_id": "meet-123-456",
                "sender_id": str(self.people["dave"].id),
                "sender_name": self.people["dave"].name
            })
        )
        self.db.add(event)
        self.events["redis_decision_meeting"] = event
        
        # Create decision
        decision = Decision(
            id=uuid.uuid4(),
            decision_key="caching_strategy",
            title="Caching Strategy",
            status=ExtractionStatus.CONFIRMED,
            version="1.0",
            summary="Use Redis for caching in the API service",
            rationale="Redis provides good performance and has the features we need for API caching",
            owner_id=self.people["dave"].id,
            affected_teams=[str(self.teams["backend"].id)],
            evidence_event_ids=[str(event.id), str(self.events["redis_testing"].id)],
            metadata=json.dumps({
                "technology": "Redis",
                "services_affected": ["api-service"]
            })
        )
        self.db.add(decision)
        self.decisions["redis"] = decision
        
        self.db.commit()
        
        # Create nodes in Neo4j
        event_node = self.graph.create_node(
            NodeType.EVENT, 
            {
                "id": str(event.id),
                "channel": event.channel,
                "content": event.body_text,
                "timestamp": event.timestamp.isoformat()
            }
        )
        
        decision_node = self.graph.create_node(
            NodeType.DECISION,
            {
                "id": str(decision.id),
                "decision_key": decision.decision_key,
                "title": decision.title,
                "version": decision.version,
                "summary": decision.summary
            }
        )
        
        # Create relationships
        # Person -> Decision (ownership)
        self.graph.create_relationship(
            str(self.people["dave"].id),
            str(decision.id),
            RelationshipType.MADE_DECISION
        )
        
        # Decision -> Event (supported by)
        self.graph.create_relationship(
            str(decision.id),
            str(event.id),
            RelationshipType.SUPPORTED_BY
        )
        
        # Decision -> Topic (relates to)
        self.graph.create_relationship(
            str(decision.id),
            str(self.topics["caching"].id),
            RelationshipType.RELATES_TO
        )
        
        # Decision -> Team (affects)
        self.graph.create_relationship(
            str(decision.id),
            str(self.teams["backend"].id),
            RelationshipType.AFFECTS
        )
        
        print(f"Created decision: {decision.title} v{decision.version} - {decision.summary}")
        
    def stage3_decision_update(self):
        """
        Stage 3: Decision update to switch from Redis to Memcached
        """
        print("\nStage 3: Creating decision update (Redis to Memcached)...")
        
        # Create email event
        event_time = self.timeline['decision_update']
        event = Event(
            id=uuid.uuid4(),
            source="email",
            channel="email",
            sender=self.people["dave"].email,
            subject="Decision Update: Switching from Redis to Memcached",
            body_text="After two weeks of using Redis, we're experiencing operational overhead we didn't anticipate. " +
                   "The monitoring and management requirements are taking up too much time. " +
                   "We will move to Memcached instead, which is simpler to operate.",
            timestamp=event_time,
            content_hash=str(uuid.uuid4()),  # Generate a unique hash
            recipients=json.dumps([
                self.people["alice"].email,
                self.people["bob"].email,
                "backend-team@example.com"
            ]),
            thread_id="thread-789",
            raw_metadata=json.dumps({
                "sender_id": str(self.people["dave"].id),
                "sender_name": self.people["dave"].name
            })
        )
        self.db.add(event)
        self.events["memcached_decision_email"] = event
        
        # Create updated decision
        decision_v2 = Decision(
            id=uuid.uuid4(),
            decision_key="caching_strategy",  # Same key for versioning
            title="Caching Strategy",
            status=ExtractionStatus.CONFIRMED,
            version="2.0",
            summary="Use Memcached for caching in the API service",
            rationale="Memcached provides simpler operations and maintenance compared to Redis",
            owner_id=self.people["dave"].id,
            affected_teams=[str(self.teams["backend"].id), str(self.teams["infra"].id)],
            evidence_event_ids=[str(event.id)],
            metadata=json.dumps({
                "technology": "Memcached",
                "previous_technology": "Redis",
                "services_affected": ["api-service"]
            })
        )
        self.db.add(decision_v2)
        self.decisions["memcached"] = decision_v2
        
        self.db.commit()
        
        # Create nodes in Neo4j
        event_node = self.graph.create_node(
            NodeType.EVENT, 
            {
                "id": str(event.id),
                "channel": event.channel,
                "content": event.body_text,
                "timestamp": event.timestamp.isoformat()
            }
        )
        
        decision_node = self.graph.create_node(
            NodeType.DECISION,
            {
                "id": str(decision_v2.id),
                "decision_key": decision_v2.decision_key,
                "title": decision_v2.title,
                "version": decision_v2.version,
                "summary": decision_v2.summary
            }
        )
        
        # Create relationships
        # Person -> Decision (ownership)
        self.graph.create_relationship(
            str(self.people["dave"].id),
            str(decision_v2.id),
            RelationshipType.MADE_DECISION
        )
        
        # Decision -> Event (supported by)
        self.graph.create_relationship(
            str(decision_v2.id),
            str(event.id),
            RelationshipType.SUPPORTED_BY
        )
        
        # Decision -> Topic (relates to)
        self.graph.create_relationship(
            str(decision_v2.id),
            str(self.topics["caching"].id),
            RelationshipType.RELATES_TO
        )
        
        # Decision -> Teams (affects)
        self.graph.create_relationship(
            str(decision_v2.id),
            str(self.teams["backend"].id),
            RelationshipType.AFFECTS
        )
        
        self.graph.create_relationship(
            str(decision_v2.id),
            str(self.teams["infra"].id),
            RelationshipType.AFFECTS
        )
        
        # Decision v2 -> Decision v1 (supersedes)
        self.graph.create_relationship(
            str(decision_v2.id),
            str(self.decisions["redis"].id),
            RelationshipType.SUPERSEDES
        )
        
        # Add shadow topic events - people discussing caching technology informally
        shadow_event1_time = self.now - timedelta(days=12)
        shadow_event1 = Event(
            id=uuid.uuid4(),
            source="slack",
            channel="message",
            sender=self.people["grace"].email,
            body_text="Hey frontend team - has anyone talked to backend about their caching choice? I'm worried it might impact our client-side performance.",
            timestamp=shadow_event1_time,
            content_hash=str(uuid.uuid4()),
            raw_metadata=json.dumps({
                "channel": "frontend-team",
                "sender_id": str(self.people["grace"].id),
                "sender_name": self.people["grace"].name
            })
        )
        self.db.add(shadow_event1)
        
        shadow_event2_time = self.now - timedelta(days=11)
        shadow_event2 = Event(
            id=uuid.uuid4(),
            source="slack",
            channel="message",
            sender=self.people["jack"].email,
            body_text="I heard they're switching from Redis to Memcached. Anyone know why? I thought Redis was our standard.",
            timestamp=shadow_event2_time,
            content_hash=str(uuid.uuid4()),
            raw_metadata=json.dumps({
                "channel": "frontend-team",
                "sender_id": str(self.people["jack"].id),
                "sender_name": self.people["jack"].name
            })
        )
        self.db.add(shadow_event2)
        
        self.graph.create_node(
            NodeType.EVENT,
            {
                "id": str(shadow_event1.id),
                "channel": shadow_event1.channel,
                "content": shadow_event1.body_text,
                "timestamp": shadow_event1.timestamp.isoformat()
            }
        )
        
        self.graph.create_node(
            NodeType.EVENT,
            {
                "id": str(shadow_event2.id),
                "channel": shadow_event2.channel,
                "content": shadow_event2.body_text,
                "timestamp": shadow_event2.timestamp.isoformat()
            }
        )
        
        # Add shadow topic relationships
        self.graph.create_relationship(
            str(self.people["grace"].id),
            str(shadow_event1.id),
            RelationshipType.SENT
        )
        
        self.graph.create_relationship(
            str(self.people["jack"].id),
            str(shadow_event2.id),
            RelationshipType.SENT
        )
        
        self.graph.create_relationship(
            str(shadow_event1.id),
            str(self.topics["caching"].id),
            RelationshipType.RELATES_TO
        )
        
        self.graph.create_relationship(
            str(shadow_event2.id),
            str(self.topics["caching"].id),
            RelationshipType.RELATES_TO
        )
        
        print(f"Created decision: {decision_v2.title} v{decision_v2.version} - {decision_v2.summary}")
        print(f"Added supersedes relationship: v2 supersedes v1")
        print(f"Added shadow topic events and relationships for caching discussion")
        
    def stage4_conflict_appears(self):
        """
        Stage 4: Conflict between Infra team standards and the decision
        """
        print("\nStage 4: Creating conflict...")
        
        # Create email event
        event_time = self.now - timedelta(days=7)
        event = Event(
            id=uuid.uuid4(),
            source="email",
            channel="email",
            sender=self.people["bob"].email,
            subject="RE: Decision Update: Switching from Redis to Memcached",
            body_text="The Infra team's standards document clearly states that Redis is our standard caching solution. " +
                   "All services must use Redis for caching to ensure compatibility with our monitoring and management tools. " +
                   "The switch to Memcached violates this standard.",
            timestamp=event_time,
            content_hash=str(uuid.uuid4()),  # Generate a unique hash
            recipients=json.dumps([
                self.people["dave"].email,
                self.people["frank"].email,
                "leads@example.com"
            ]),
            thread_id="thread-789",
            raw_metadata=json.dumps({
                "sender_id": str(self.people["bob"].id),
                "sender_name": self.people["bob"].name,
                "importance": "high"
            })
        )
        self.db.add(event)
        self.events["infra_standard_email"] = event
        
        # Create claim
        claim = Claim(
            id=uuid.uuid4(),
            claim_key="infra_redis_standard",
            text="Infra standards require Redis for caching",
            polarity="assertive", # Use string instead of enum
            claimant_id=self.people["bob"].id,
            topic_id=self.topics["caching"].id,
            confidence=0.95,
            evidence_event_ids=[str(event.id)],
            metadata=json.dumps({
                "standard_reference": "INFRA-STD-007",
                "conflicts_with": str(self.decisions["memcached"].id)
            })
        )
        self.db.add(claim)
        self.claims["redis_standard"] = claim
        
        # Create conflict
        conflict = Conflict(
            id=uuid.uuid4(),
            conflict_type=ConflictType.DECISION_CONFLICT,
            description="Conflict between Backend's decision to use Memcached and Infra team standards requiring Redis",
            status=ConflictStatus.OPEN,
            severity=ConflictSeverity.HIGH,
            entity_a_type="Decision",
            entity_a_id=self.decisions["memcached"].id,
            entity_b_type="Claim",
            entity_b_id=claim.id,
            evidence=json.dumps([
                str(self.decisions["memcached"].id),
                str(claim.id),
                str(event.id)
            ]),
            extra_data=json.dumps({
                "teams_involved": ["Backend Team", "Infra Team"],
                "decision_version": "2.0",
                "topic": "caching"
            })
        )
        self.db.add(conflict)
        self.conflicts["caching_conflict"] = conflict
        
        self.db.commit()
        
        # Create nodes in Neo4j
        event_node = self.graph.create_node(
            NodeType.EVENT, 
            {
                "id": str(event.id),
                "channel": event.channel,
                "content": event.body_text,
                "timestamp": event.timestamp.isoformat()
            }
        )
        
        claim_node = self.graph.create_node(
            NodeType.CLAIM,
            {
                "id": str(claim.id),
                "claim_key": claim.claim_key,
                "text": claim.text
            }
        )
        
        # Create relationships
        # Person -> Claim
        self.graph.create_relationship(
            str(self.people["bob"].id),
            str(claim.id),
            RelationshipType.MADE_CLAIM
        )
        
        # Claim -> Topic
        self.graph.create_relationship(
            str(claim.id),
            str(self.topics["caching"].id),
            RelationshipType.RELATES_TO
        )
        
        # Person -> Event
        self.graph.create_relationship(
            str(self.people["bob"].id),
            str(event.id),
            RelationshipType.SENT
        )
        
        # Claim -> Decision (contradicts)
        self.graph.create_relationship(
            str(claim.id),
            str(self.decisions["memcached"].id),
            RelationshipType.CONTRADICTS
        )
        
        # Create additional conflict - Security concern
        security_event_time = self.now - timedelta(days=6)
        security_event = Event(
            id=uuid.uuid4(),
            source="email",
            channel="email",
            sender=self.people["irene"].email,
            subject="Security Concerns: Memcached Implementation",
            body_text="The Security team has not been consulted on the Memcached implementation. We have concerns about the default configuration's lack of authentication. Please engage with us before proceeding with this change.",
            timestamp=security_event_time,
            content_hash=str(uuid.uuid4()),
            recipients=json.dumps([
                self.people["dave"].email,
                self.people["frank"].email,
                "security@example.com"
            ]),
            raw_metadata=json.dumps({
                "sender_id": str(self.people["irene"].id),
                "sender_name": self.people["irene"].name,
                "importance": "high"
            })
        )
        self.db.add(security_event)
        
        security_claim = Claim(
            id=uuid.uuid4(),
            claim_key="memcached_security_concerns",
            text="Memcached default config lacks authentication and poses security risks",
            polarity="negative",
            claimant_id=self.people["irene"].id,
            topic_id=self.topics["security"].id,
            confidence=0.90,
            evidence_event_ids=[str(security_event.id)],
            metadata=json.dumps({
                "security_impact": "high",
                "conflicts_with": str(self.decisions["memcached"].id),
                "requires_review": True
            })
        )
        self.db.add(security_claim)
        
        security_conflict = Conflict(
            id=uuid.uuid4(),
            conflict_type=ConflictType.DECISION_CONFLICT,
            description="Security team concerns about Memcached authentication not addressed in decision",
            status=ConflictStatus.OPEN,
            severity=ConflictSeverity.CRITICAL,
            entity_a_type="Decision",
            entity_a_id=self.decisions["memcached"].id,
            entity_b_type="Claim",
            entity_b_id=security_claim.id,
            evidence=json.dumps([
                str(self.decisions["memcached"].id),
                str(security_claim.id),
                str(security_event.id)
            ]),
            extra_data=json.dumps({
                "teams_involved": ["Backend Team", "Security Team"],
                "decision_version": "2.0",
                "topic": "security",
                "requires_immediate_attention": True
            })
        )
        self.db.add(security_conflict)
        self.conflicts["security_conflict"] = security_conflict
        
        # Create Neo4j nodes for security concern
        self.graph.create_node(
            NodeType.EVENT,
            {
                "id": str(security_event.id),
                "channel": security_event.channel,
                "content": security_event.body_text,
                "timestamp": security_event.timestamp.isoformat()
            }
        )
        
        security_claim_node = self.graph.create_node(
            NodeType.CLAIM,
            {
                "id": str(security_claim.id),
                "claim_key": security_claim.claim_key,
                "text": security_claim.text
            }
        )
        
        # Create relationships for security concern
        self.graph.create_relationship(
            str(self.people["irene"].id),
            str(security_claim.id),
            RelationshipType.MADE_CLAIM
        )
        
        self.graph.create_relationship(
            str(security_claim.id),
            str(self.topics["security"].id),
            RelationshipType.RELATES_TO
        )
        
        self.graph.create_relationship(
            str(security_claim.id),
            str(self.decisions["memcached"].id),
            RelationshipType.CONTRADICTS
        )
        
        self.graph.create_relationship(
            str(self.people["irene"].id),
            str(security_event.id),
            RelationshipType.SENT
        )
        
        # Add performance concern from QA team
        qa_event_time = self.timeline['qa_findings']
        qa_event = Event(
            id=uuid.uuid4(),
            source="slack",
            channel="message",
            sender=self.people["leo"].email,
            body_text="Our performance tests with Memcached are showing 40% higher latency than Redis in high-load scenarios. This could impact our SLAs.",
            timestamp=qa_event_time,
            content_hash=str(uuid.uuid4()),
            raw_metadata=json.dumps({
                "channel": "qa-team",
                "sender_id": str(self.people["leo"].id),
                "sender_name": self.people["leo"].name,
                "thread_ts": "1623456789.000000"
            })
        )
        self.db.add(qa_event)
        
        qa_claim = Claim(
            id=uuid.uuid4(),
            claim_key="memcached_performance_concerns",
            text="Memcached shows 40% higher latency than Redis in high-load tests",
            polarity="negative",
            claimant_id=self.people["leo"].id,
            topic_id=self.topics["scaling"].id,
            confidence=0.88,
            evidence_event_ids=[str(qa_event.id)],
            metadata=json.dumps({
                "performance_impact": "high",
                "relates_to": str(self.decisions["memcached"].id),
                "test_results": "available"
            })
        )
        self.db.add(qa_claim)
        
        self.graph.create_node(
            NodeType.EVENT,
            {
                "id": str(qa_event.id),
                "channel": qa_event.channel,
                "content": qa_event.body_text,
                "timestamp": qa_event.timestamp.isoformat()
            }
        )
        
        qa_claim_node = self.graph.create_node(
            NodeType.CLAIM,
            {
                "id": str(qa_claim.id),
                "claim_key": qa_claim.claim_key,
                "text": qa_claim.text
            }
        )
        
        self.graph.create_relationship(
            str(self.people["leo"].id),
            str(qa_claim.id),
            RelationshipType.MADE_CLAIM
        )
        
        self.graph.create_relationship(
            str(qa_claim.id),
            str(self.topics["scaling"].id),
            RelationshipType.RELATES_TO
        )
        
        self.graph.create_relationship(
            str(qa_claim.id),
            str(self.decisions["memcached"].id),
            RelationshipType.RELATED_TO
        )
        
        self.graph.create_relationship(
            str(self.people["leo"].id),
            str(qa_event.id),
            RelationshipType.SENT
        )

        # Add OAuth vs Basic Auth conflict
        auth_conflict_event_time = self.now - timedelta(days=5)
        auth_conflict_event = Event(
            id=uuid.uuid4(),
            source="email",
            channel="email",
            sender=self.people["irene"].email,
            subject="RE: API Authentication Standards",
            body_text="The Security team requires all APIs to use OAuth 2.0 for authentication. " +
                   "However, the Frontend team has implemented Basic Auth for the new API endpoints. " +
                   "This violates our security standards and must be addressed immediately. " +
                   "OAuth 2.0 provides token-based authentication with proper expiration and is the required standard.",
            timestamp=auth_conflict_event_time,
            content_hash=str(uuid.uuid4()),
            recipients=json.dumps([
                self.people["jack"].email,
                self.people["grace"].email,
                self.people["frank"].email,
                "security@example.com"
            ]),
            raw_metadata=json.dumps({
                "sender_id": str(self.people["irene"].id),
                "sender_name": self.people["irene"].name,
                "importance": "high"
            })
        )
        self.db.add(auth_conflict_event)

        # Create OAuth requirement claim
        oauth_claim = Claim(
            id=uuid.uuid4(),
            claim_key="oauth_required_for_apis",
            text="Security team requires OAuth 2.0 for all API authentication",
            polarity="assertive",
            claimant_id=self.people["irene"].id,
            topic_id=self.topics["security"].id,
            confidence=0.95,
            evidence_event_ids=[str(auth_conflict_event.id)],
            metadata=json.dumps({
                "security_standard": "SEC-STD-012",
                "requirement_level": "mandatory",
                "applies_to": "all_apis"
            })
        )
        self.db.add(oauth_claim)
        self.claims["oauth_required"] = oauth_claim

        # Create Basic Auth implementation event
        basic_auth_event_time = self.now - timedelta(days=8)
        basic_auth_event = Event(
            id=uuid.uuid4(),
            source="slack",
            channel="message",
            sender=self.people["jack"].email,
            body_text="We've implemented Basic Auth for the new API endpoints. It was the simplest approach and gets the job done quickly.",
            timestamp=basic_auth_event_time,
            content_hash=str(uuid.uuid4()),
            raw_metadata=json.dumps({
                "channel": "frontend-team",
                "sender_id": str(self.people["jack"].id),
                "sender_name": self.people["jack"].name
            })
        )
        self.db.add(basic_auth_event)

        # Create Basic Auth implementation claim
        basic_auth_claim = Claim(
            id=uuid.uuid4(),
            claim_key="basic_auth_implementation",
            text="Frontend team implemented Basic Auth for API endpoints",
            polarity="neutral",
            claimant_id=self.people["jack"].id,
            topic_id=self.topics["api"].id,
            confidence=0.90,
            evidence_event_ids=[str(basic_auth_event.id)],
            metadata=json.dumps({
                "implementation": "Basic Auth",
                "api_endpoints": ["user-profile", "settings"],
                "reason": "simplicity"
            })
        )
        self.db.add(basic_auth_claim)
        self.claims["basic_auth_impl"] = basic_auth_claim

        # Create authentication conflict
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
        self.db.add(auth_conflict)
        self.conflicts["auth_conflict"] = auth_conflict

        # Create Neo4j nodes for OAuth conflict
        self.graph.create_node(
            NodeType.EVENT,
            {
                "id": str(auth_conflict_event.id),
                "channel": auth_conflict_event.channel,
                "content": auth_conflict_event.body_text,
                "timestamp": auth_conflict_event.timestamp.isoformat()
            }
        )

        self.graph.create_node(
            NodeType.EVENT,
            {
                "id": str(basic_auth_event.id),
                "channel": basic_auth_event.channel,
                "content": basic_auth_event.body_text,
                "timestamp": basic_auth_event.timestamp.isoformat()
            }
        )

        oauth_claim_node = self.graph.create_node(
            NodeType.CLAIM,
            {
                "id": str(oauth_claim.id),
                "claim_key": oauth_claim.claim_key,
                "text": oauth_claim.text
            }
        )

        basic_auth_claim_node = self.graph.create_node(
            NodeType.CLAIM,
            {
                "id": str(basic_auth_claim.id),
                "claim_key": basic_auth_claim.claim_key,
                "text": basic_auth_claim.text
            }
        )

        # Create relationships for OAuth claim
        self.graph.create_relationship(
            str(self.people["irene"].id),
            str(oauth_claim.id),
            RelationshipType.MADE_CLAIM
        )

        self.graph.create_relationship(
            str(oauth_claim.id),
            str(self.topics["security"].id),
            RelationshipType.RELATES_TO
        )

        self.graph.create_relationship(
            str(self.people["irene"].id),
            str(auth_conflict_event.id),
            RelationshipType.SENT
        )

        # Create relationships for Basic Auth claim
        self.graph.create_relationship(
            str(self.people["jack"].id),
            str(basic_auth_claim.id),
            RelationshipType.MADE_CLAIM
        )

        self.graph.create_relationship(
            str(basic_auth_claim.id),
            str(self.topics["api"].id),
            RelationshipType.RELATES_TO
        )

        self.graph.create_relationship(
            str(self.people["jack"].id),
            str(basic_auth_event.id),
            RelationshipType.SENT
        )

        # Create contradiction relationship between claims
        self.graph.create_relationship(
            str(oauth_claim.id),
            str(basic_auth_claim.id),
            RelationshipType.CONTRADICTS
        )

        # Link claims to affected teams
        self.graph.create_relationship(
            str(oauth_claim.id),
            str(self.teams["security"].id),
            RelationshipType.AFFECTS
        )

        self.graph.create_relationship(
            str(basic_auth_claim.id),
            str(self.teams["frontend"].id),
            RelationshipType.AFFECTS
        )

        print(f"Created claim: {claim.text} by {self.people['bob'].name}")
        print(f"Created conflict: {conflict.description}")
        print(f"Added security conflict: {security_conflict.description}")
        print(f"Added performance concerns from QA team")
        print(f"Added OAuth vs Basic Auth conflict between Security and Frontend teams")
        
    def stage5_resolution(self):
        """
        Stage 5: Resolution via CTO approval
        """
        print("\nStage 5: Creating resolution...")
        
        # Create meeting event
        event_time = self.now - timedelta(days=3)
        event = Event(
            id=uuid.uuid4(),
            source="calendar",
            channel="meeting",
            sender=self.people["frank"].email,
            body_text="Meeting between CTO, Backend and Infra leads. " +
                   "After reviewing the operational challenges with Redis and the Backend team's needs, " +
                   "CTO Frank Lee has approved an exception to the Infra standards, allowing the API service " +
                   "to use Memcached. The Infra team will update their monitoring tools to support this exception.",
            timestamp=event_time,
            content_hash=str(uuid.uuid4()),  # Generate a unique hash
            recipients=json.dumps([
                self.people["dave"].email,
                self.people["bob"].email
            ]),
            raw_metadata=json.dumps({
                "attendees": [
                    {"email": self.people["frank"].email, "name": self.people["frank"].name},
                    {"email": self.people["dave"].email, "name": self.people["dave"].name},
                    {"email": self.people["bob"].email, "name": self.people["bob"].name}
                ],
                "meeting_id": "meet-456-789",
                "decision_made": True,
                "sender_id": str(self.people["frank"].id),
                "sender_name": self.people["frank"].name
            })
        )
        self.db.add(event)
        self.events["resolution_meeting"] = event
        
        # Create final decision
        decision_v3 = Decision(
            id=uuid.uuid4(),
            decision_key="caching_strategy",  # Same key for versioning
            title="Caching Strategy",
            status=ExtractionStatus.CONFIRMED,  # Use confirmed as the highest level available
            version="3.0",
            summary="Use Memcached for API service caching (exception to standards)",
            rationale="CTO approved exception to Infra standards due to operational concerns with Redis",
            owner_id=self.people["frank"].id,  # Now owned by CTO
            affected_teams=[str(self.teams["backend"].id), str(self.teams["infra"].id)],
            evidence_event_ids=[str(event.id)],
            metadata=json.dumps({
                "technology": "Memcached",
                "exception_to_standards": True,
                "exception_approver": "CTO",
                "exception_id": "EX-2023-42",
                "services_affected": ["api-service"]
            })
        )
        self.db.add(decision_v3)
        self.decisions["memcached_exception"] = decision_v3
        
        # Update conflict statuses
        conflict = self.conflicts["caching_conflict"]
        conflict.status = ConflictStatus.RESOLVED
        conflict.resolved_at = event_time
        conflict.resolution_type = "executive_decision"
        conflict.resolution_notes = "CTO approved exception to standards"
        conflict.resolved_by_id = self.people["frank"].id
        self.db.add(conflict)
        
        # Update security conflict - partially addressed only
        security_conflict = self.conflicts["security_conflict"]
        security_conflict.status = ConflictStatus.REVIEWING
        security_conflict.review_notes = "CTO acknowledged security concerns; requiring auth configuration"
        security_conflict.reviewer_id = self.people["frank"].id
        self.db.add(security_conflict)
        
        # Add task to address security concerns
        security_task = Task(
            id=uuid.uuid4(),
            task_key="implement_memcached_auth",
            title="Implement authentication for Memcached",
            description="Configure Memcached with SASL authentication and add appropriate security measures",
            status=ExtractionStatus.PROPOSED,
            assignee_id=self.people["maya"].id,
            created_by_id=self.people["frank"].id,
            due_date=self.now + timedelta(days=3),
            evidence_event_ids=[str(event.id), str(security_event.id)]
        )
        self.db.add(security_task)
        
        task_node = self.graph.create_node(
            NodeType.TASK,
            {
                "id": str(security_task.id),
                "task_key": security_task.task_key,
                "title": security_task.title,
                "description": security_task.description,
                "status": security_task.status.value
            }
        )
        
        self.graph.create_relationship(
            str(self.people["frank"].id),
            str(security_task.id),
            RelationshipType.CREATED
        )
        
        self.graph.create_relationship(
            str(self.people["maya"].id),
            str(security_task.id),
            RelationshipType.ASSIGNED_TO
        )
        
        self.graph.create_relationship(
            str(security_task.id),
            str(decision_v3.id),
            RelationshipType.RELATED_TO
        )
        
        self.graph.create_relationship(
            str(security_task.id),
            str(security_claim.id),
            RelationshipType.ADDRESSES
        )
        
        self.db.commit()
        
        # Create nodes in Neo4j
        event_node = self.graph.create_node(
            NodeType.EVENT,
            {
                "id": str(event.id),
                "channel": event.channel,
                "content": event.body_text,
                "timestamp": event.timestamp.isoformat()
            }
        )
        
        decision_node = self.graph.create_node(
            NodeType.DECISION,
            {
                "id": str(decision_v3.id),
                "decision_key": decision_v3.decision_key,
                "title": decision_v3.title,
                "version": decision_v3.version,
                "summary": decision_v3.summary,
                "status": decision_v3.status.value
            }
        )
        
        # Create relationships
        # Person -> Decision (ownership)
        self.graph.create_relationship(
            str(self.people["frank"].id),
            str(decision_v3.id),
            RelationshipType.MADE_DECISION
        )
        
        # Decision -> Event (supported by)
        self.graph.create_relationship(
            str(decision_v3.id),
            str(event.id),
            RelationshipType.SUPPORTED_BY
        )
        
        # Decision -> Topic (relates to)
        self.graph.create_relationship(
            str(decision_v3.id),
            str(self.topics["caching"].id),
            RelationshipType.RELATES_TO
        )
        
        # Decision -> Teams (affects)
        self.graph.create_relationship(
            str(decision_v3.id),
            str(self.teams["backend"].id),
            RelationshipType.AFFECTS
        )
        
        self.graph.create_relationship(
            str(decision_v3.id),
            str(self.teams["infra"].id),
            RelationshipType.AFFECTS
        )
        
        # Decision v3 -> Decision v2 (supersedes)
        self.graph.create_relationship(
            str(decision_v3.id),
            str(self.decisions["memcached"].id),
            RelationshipType.SUPERSEDES
        )
        
        print(f"Created decision: {decision_v3.title} v{decision_v3.version} - {decision_v3.summary}")
        print(f"Updated conflict status to RESOLVED")
    
    def stage6_meta_insights(self):
        """
        Stage 6: Meta-insights about team tension
        """
        print("\nStage 6: Creating meta-insights...")
        
        # Create a custom "meta" relationship between teams
        # Note: This isn't a standard relationship type, but we're adding it to model the narrative
        
        # Use a custom query to create this edge since it's not in standard schema
        query = """
        MATCH (t1:Team {id: $team1_id})
        MATCH (t2:Team {id: $team2_id})
        CREATE (t1)-[r:COMMUNICATION_TENSION {
            tension_level: $tension_level,
            detected_at: $detected_at,
            conflict_count: $conflict_count,
            insight: $insight
        }]->(t2)
        RETURN r
        """
        
        # Create tension between multiple teams
        team_tensions = [
            {
                "team1": "backend",
                "team2": "infra",
                "level": "high",
                "count": 1,
                "insight": "These teams have disagreed on infrastructure decisions"
            },
            {
                "team1": "backend",
                "team2": "security",
                "level": "medium",
                "count": 1,
                "insight": "Security concerns not addressed early in decision process"
            },
            {
                "team1": "frontend",
                "team2": "backend",
                "level": "low",
                "count": 0,
                "insight": "Communication gap on decisions affecting client performance"
            },
            {
                "team1": "product",
                "team2": "qa",
                "level": "medium",
                "count": 0,
                "insight": "Product decisions sometimes deployed without sufficient testing"
            }
        ]
        
        for tension in team_tensions:
            params = {
                "team1_id": str(self.teams[tension["team1"]].id),
                "team2_id": str(self.teams[tension["team2"]].id),
                "tension_level": tension["level"],
                "detected_at": self.now.isoformat(),
                "conflict_count": tension["count"],
                "insight": tension["insight"]
            }
            
            try:
                self.graph.client.execute_write(query, params)
                print(f"Created COMMUNICATION_TENSION relationship between {tension['team1']} and {tension['team2']} teams")
            except Exception as e:
                print(f"Error creating meta relationship: {e}")
        
        try:
            self.graph.client.execute_write(query, params)
            print("Created COMMUNICATION_TENSION relationship between Backend and Infra teams")
        except Exception as e:
            print(f"Error creating meta relationship: {e}")
        
        # Add meta properties to topics
        shadow_topics_data = [
            {
                "topic": "caching",
                "properties": {
                    "high_churn": True,
                    "churn_detected_at": self.now.isoformat(),
                    "decision_versions": 3,
                    "insight": "This topic has high decision churn and may need clearer ownership"
                }
            },
            {
                "topic": "security",
                "properties": {
                    "under_addressed": True,
                    "detected_at": self.now.isoformat(),
                    "critical_concerns": 1,
                    "insight": "Security concerns are typically raised late in decision process"
                }
            },
            {
                "topic": "scaling",
                "properties": {
                    "emerging_issue": True,
                    "detected_at": self.now.isoformat(),
                    "evidence_count": 2,
                    "insight": "Performance implications not adequately considered in early decisions"
                }
            },
            {
                "topic": "monitoring",
                "properties": {
                    "shadow_topic": True,
                    "detected_at": self.now.isoformat(),
                    "mention_count": 4,
                    "insight": "Monitoring strategy discussions happening in scattered communications"
                }
            }
        ]
        
        query = """
        MATCH (t:Topic {id: $topic_id})
        SET t += $properties
        RETURN t
        """
        
        for topic_data in shadow_topics_data:
            params = {
                "topic_id": str(self.topics[topic_data["topic"]].id),
                "properties": topic_data["properties"]
            }
            
            try:
                self.graph.client.execute_write(query, params)
                print(f"Added meta information to {topic_data['topic']} topic")
            except Exception as e:
                print(f"Error adding meta information: {e}")
        
        try:
            self.graph.client.execute_write(query, params)
            print("Added meta information to Caching topic")
        except Exception as e:
            print(f"Error adding meta information: {e}")
    
    def create_additional_decisions(self):
        """Create additional decisions to enrich the dataset"""
        print("\nCreating additional decisions...")
        
        # 1. Load testing decision
        load_testing_event_time = self.timeline['performance_testing']
        load_testing_event = Event(
            id=uuid.uuid4(),
            source="email",
            channel="email",
            sender=self.people["leo"].email,
            subject="Caching Load Testing Plan",
            body_text="We've completed our load testing plan for the new caching implementation. " +
                    "We will use a combination of synthetic and real traffic patterns to validate " +
                    "the performance under high load conditions. All teams should review the attached plan.",
            timestamp=load_testing_event_time,
            content_hash=str(uuid.uuid4()),
            recipients=json.dumps([
                self.people["dave"].email,
                self.people["bob"].email,
                self.people["emma"].email,
                self.people["alice"].email
            ])
        )
        self.db.add(load_testing_event)
        
        load_testing_decision = Decision(
            id=uuid.uuid4(),
            decision_key="caching_load_testing",
            title="Caching Load Testing Methodology",
            status=ExtractionStatus.CONFIRMED,
            version="1.0",
            summary="Implement comprehensive load testing for all caching solutions",
            rationale="Ensure caching solutions meet performance requirements under various load conditions",
            owner_id=self.people["leo"].id,
            affected_teams=[str(self.teams["qa"].id), str(self.teams["backend"].id), str(self.teams["infra"].id)],
            evidence_event_ids=[str(load_testing_event.id)],
            metadata=json.dumps({
                "testing_tools": ["k6", "JMeter", "custom scripts"],
                "load_patterns": ["steady", "spike", "gradual increase"],
                "related_to": "caching_strategy"
            })
        )
        self.db.add(load_testing_decision)
        
        # Create nodes in Neo4j
        self.graph.create_node(
            NodeType.EVENT,
            {
                "id": str(load_testing_event.id),
                "channel": load_testing_event.channel,
                "content": load_testing_event.body_text,
                "timestamp": load_testing_event.timestamp.isoformat()
            }
        )
        
        load_testing_node = self.graph.create_node(
            NodeType.DECISION,
            {
                "id": str(load_testing_decision.id),
                "decision_key": load_testing_decision.decision_key,
                "title": load_testing_decision.title,
                "version": load_testing_decision.version,
                "summary": load_testing_decision.summary
            }
        )
        
        # Create relationships
        self.graph.create_relationship(
            str(self.people["leo"].id),
            str(load_testing_decision.id),
            RelationshipType.MADE_DECISION
        )
        
        self.graph.create_relationship(
            str(load_testing_decision.id),
            str(self.topics["scaling"].id),
            RelationshipType.RELATES_TO
        )
        
        self.graph.create_relationship(
            str(load_testing_decision.id),
            str(self.decisions["memcached_exception"].id),
            RelationshipType.RELATED_TO
        )
        
        print(f"Created decision: {load_testing_decision.title} - {load_testing_decision.summary}")
        
        # 2. Authentication implementation decision
        auth_event_time = self.timeline['implementation']
        auth_event = Event(
            id=uuid.uuid4(),
            source="slack",
            channel="message",
            sender=self.people["maya"].email,
            body_text="I've completed the implementation of SASL authentication for Memcached. The PR is ready for review by security team.",
            timestamp=auth_event_time,
            content_hash=str(uuid.uuid4())
        )
        self.db.add(auth_event)
        
        auth_decision = Decision(
            id=uuid.uuid4(),
            decision_key="memcached_auth_implementation",
            title="Memcached Authentication Implementation",
            status=ExtractionStatus.CONFIRMED,
            version="1.0",
            summary="Implement SASL authentication for Memcached",
            rationale="Address security concerns raised by Security team",
            owner_id=self.people["maya"].id,
            affected_teams=[str(self.teams["backend"].id), str(self.teams["security"].id)],
            evidence_event_ids=[str(auth_event.id)],
            metadata=json.dumps({
                "auth_method": "SASL",
                "implements_security_requirement": True,
                "related_to": "caching_strategy"
            })
        )
        self.db.add(auth_decision)
        
        # Create nodes in Neo4j
        self.graph.create_node(
            NodeType.EVENT,
            {
                "id": str(auth_event.id),
                "channel": auth_event.channel,
                "content": auth_event.body_text,
                "timestamp": auth_event.timestamp.isoformat()
            }
        )
        
        auth_node = self.graph.create_node(
            NodeType.DECISION,
            {
                "id": str(auth_decision.id),
                "decision_key": auth_decision.decision_key,
                "title": auth_decision.title,
                "version": auth_decision.version,
                "summary": auth_decision.summary
            }
        )
        
        # Create relationships
        self.graph.create_relationship(
            str(self.people["maya"].id),
            str(auth_decision.id),
            RelationshipType.MADE_DECISION
        )
        
        self.graph.create_relationship(
            str(auth_decision.id),
            str(self.topics["security"].id),
            RelationshipType.RELATES_TO
        )
        
        self.graph.create_relationship(
            str(auth_decision.id),
            str(self.decisions["memcached_exception"].id),
            RelationshipType.IMPLEMENTS
        )
        
        print(f"Created decision: {auth_decision.title} - {auth_decision.summary}")
        
        # 3. Monitoring strategy decision
        monitoring_event_time = self.timeline['final_report']
        monitoring_event = Event(
            id=uuid.uuid4(),
            source="email",
            channel="email",
            sender=self.people["bob"].email,
            subject="Caching Monitoring Strategy",
            body_text="Following our implementation of Memcached with authentication, we need a comprehensive " +
                    "monitoring strategy. Infra team proposes the attached monitoring setup using Prometheus and Grafana " +
                    "with custom alerts for cache hit rates, memory utilization, and connection issues.",
            timestamp=monitoring_event_time,
            content_hash=str(uuid.uuid4()),
            recipients=json.dumps([
                self.people["dave"].email,
                self.people["maya"].email,
                self.people["emma"].email,
                self.people["frank"].email
            ])
        )
        self.db.add(monitoring_event)
        
        monitoring_decision = Decision(
            id=uuid.uuid4(),
            decision_key="caching_monitoring",
            title="Caching Monitoring Strategy",
            status=ExtractionStatus.CONFIRMED,
            version="1.0",
            summary="Implement Prometheus/Grafana monitoring for Memcached",
            rationale="Ensure visibility into caching performance and detect issues early",
            owner_id=self.people["bob"].id,
            affected_teams=[str(self.teams["infra"].id), str(self.teams["backend"].id)],
            evidence_event_ids=[str(monitoring_event.id)],
            metadata=json.dumps({
                "monitoring_tools": ["Prometheus", "Grafana"],
                "alert_metrics": ["hit_rate", "memory_usage", "connection_count"],
                "related_to": "caching_strategy"
            })
        )
        self.db.add(monitoring_decision)
        
        # Create nodes in Neo4j
        self.graph.create_node(
            NodeType.EVENT,
            {
                "id": str(monitoring_event.id),
                "channel": monitoring_event.channel,
                "content": monitoring_event.body_text,
                "timestamp": monitoring_event.timestamp.isoformat()
            }
        )
        
        monitoring_node = self.graph.create_node(
            NodeType.DECISION,
            {
                "id": str(monitoring_decision.id),
                "decision_key": monitoring_decision.decision_key,
                "title": monitoring_decision.title,
                "version": monitoring_decision.version,
                "summary": monitoring_decision.summary
            }
        )
        
        # Create relationships
        self.graph.create_relationship(
            str(self.people["bob"].id),
            str(monitoring_decision.id),
            RelationshipType.MADE_DECISION
        )
        
        self.graph.create_relationship(
            str(monitoring_decision.id),
            str(self.topics["monitoring"].id),
            RelationshipType.RELATES_TO
        )
        
        self.graph.create_relationship(
            str(monitoring_decision.id),
            str(self.decisions["memcached_exception"].id),
            RelationshipType.RELATED_TO
        )
        
        print(f"Created decision: {monitoring_decision.title} - {monitoring_decision.summary}")
        
        # Commit changes
        self.db.commit()
    
    def create_shadow_topic_events(self):
        """Generate additional shadow topic discussions to populate the shadow topics dashboard"""
        print("\nCreating additional shadow topic events...")
        
        # Events related to monitoring (shadow topic with no formal decision)
        monitoring_events = [
            {
                "sender": "henry",
                "message": "We need to standardize our monitoring approach across services.",
                "source": "slack",
                "time": self.timeline['team_discussion'] - timedelta(days=2)
            },
            {
                "sender": "emma",
                "message": "Anyone know what monitoring tools the new microservices are using?",
                "source": "slack",
                "time": self.timeline['team_discussion']
            },
            {
                "sender": "jack",
                "message": "Frontend team is using Datadog for client monitoring, but I heard backend is using Prometheus?",
                "source": "slack",
                "time": self.timeline['performance_testing'] - timedelta(days=5)
            },
            {
                "sender": "nina",
                "message": "We should create a monitoring strategy document. Currently each team is using different tools.",
                "source": "email",
                "time": self.timeline['security_review'] - timedelta(days=5),
                "recipients": ["henry", "emma", "dave", "bob"]
            }
        ]
        
        for event_data in monitoring_events:
            event_time = self.now - timedelta(days=event_data["days_ago"])
            event = Event(
                id=uuid.uuid4(),
                source=event_data["source"],
                channel="message" if event_data["source"] == "slack" else "email",
                sender=self.people[event_data["sender"]].email,
                body_text=event_data["message"],
                timestamp=event_time,
                content_hash=str(uuid.uuid4())
            )
            
            if event_data["source"] == "email" and "recipients" in event_data:
                event.recipients = json.dumps([self.people[r].email for r in event_data["recipients"]])
                
            self.db.add(event)
            
            # Create node and relationships
            event_node = self.graph.create_node(
                NodeType.EVENT,
                {
                    "id": str(event.id),
                    "channel": event.channel,
                    "content": event.body_text,
                    "timestamp": event.timestamp.isoformat()
                }
            )
            
            # Create sender relationship
            self.graph.create_relationship(
                str(self.people[event_data["sender"]].id),
                str(event.id),
                RelationshipType.SENT
            )
            
            # Connect to monitoring topic
            self.graph.create_relationship(
                str(event.id),
                str(self.topics["monitoring"].id),
                RelationshipType.RELATES_TO
            )
        
        # Events related to testing standards (another emerging shadow topic)
        testing_events = [
            {
                "sender": "leo",
                "message": "Are we standardizing on Jest for all frontend testing?",
                "source": "slack",
                "time": self.timeline['first_claim'] + timedelta(days=5)
            },
            {
                "sender": "grace",
                "message": "Our team is using Cypress for E2E but I heard other teams are using Playwright?",
                "source": "slack",
                "time": self.timeline['first_claim'] + timedelta(days=10)
            },
            {
                "sender": "dave",
                "message": "Backend is using pytest but we're inconsistent about mocking strategies.",
                "source": "slack",
                "time": self.timeline['decision_update'] - timedelta(days=2)
            },
            {
                "sender": "carol",
                "message": "We need a unified testing strategy across teams. Quality is becoming too inconsistent.",
                "source": "email",
                "time": self.timeline['conflict_emerges'] - timedelta(days=5),
                "recipients": ["leo", "grace", "dave", "frank"]
            },
            {
                "sender": "maya",
                "message": "I created a draft testing strategy doc, can someone from each team review it?",
                "source": "slack",
                "time": self.timeline['resolution'] - timedelta(days=1)
            }
        ]
        
        for event_data in testing_events:
            event_time = event_data["time"] if "time" in event_data else self.now - timedelta(days=20)
            event = Event(
                id=uuid.uuid4(),
                source=event_data["source"],
                channel="message" if event_data["source"] == "slack" else "email",
                sender=self.people[event_data["sender"]].email,
                body_text=event_data["message"],
                timestamp=event_time,
                content_hash=str(uuid.uuid4())
            )
            
            if event_data["source"] == "email" and "recipients" in event_data:
                event.recipients = json.dumps([self.people[r].email for r in event_data["recipients"]])
                
            self.db.add(event)
            
            # Create node and relationships
            event_node = self.graph.create_node(
                NodeType.EVENT,
                {
                    "id": str(event.id),
                    "channel": event.channel,
                    "content": event.body_text,
                    "timestamp": event.timestamp.isoformat()
                }
            )
            
            # Create sender relationship
            self.graph.create_relationship(
                str(self.people[event_data["sender"]].id),
                str(event.id),
                RelationshipType.SENT
            )
            
            # Connect to testing topic
            self.graph.create_relationship(
                str(event.id),
                str(self.topics["testing"].id),
                RelationshipType.RELATES_TO
            )
        
        self.db.commit()
        print("Created shadow topic events for monitoring and testing topics")
    
    def build_narrative(self):
        """Execute all narrative stages in sequence"""
        self.create_base_entities()
        self.stage1_initial_claim()
        self.stage2_first_decision()
        self.stage3_decision_update()
        self.stage4_conflict_appears()
        self.stage5_resolution()
        self.stage6_meta_insights()
        
        # Add additional decisions to enrich the dataset
        self.create_additional_decisions()
        
        # Generate additional shadow topic events with no direct conflict
        self.create_shadow_topic_events()
        
        print("\nEnhanced narrative creation complete!")


if __name__ == "__main__":
    # Build the narrative
    try:
        builder = NarrativeBuilder()
        builder.build_narrative()
        print("\nSuccessfully created enhanced caching decision narrative with all stages!")
    except Exception as e:
        print(f"Error creating narrative: {e}")
        import traceback
    
        traceback.print_exc()