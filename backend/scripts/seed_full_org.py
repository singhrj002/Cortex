#!/usr/bin/env python3
"""
seed_full_org.py — Seeds the full Nexus Technologies org data into PostgreSQL.

Populates:
  - Teams (6 engineering teams)
  - People (12 employees)
  - EmployeeMetrics (per-sprint scores, velocity, risk)
  - Tickets (15 JIRA-like work items — real conflicts baked in)
  - Conflicts (6 active tensions — detected from events)
  - Events (22 org emails/communications)
  - Topics (3 key active topics)

Run: python scripts/seed_full_org.py
"""

import sys
import os
import uuid
from datetime import datetime, timedelta

# Ensure we're running from the backend directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal, engine, Base
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.models.employee_metric import EmployeeMetric, RiskLevel
from app.models.conflict import Conflict, ConflictType, ConflictSeverity, ConflictStatus
from app.models.event import Event
from app.models.person import Person, Team
from app.models.topic import Topic

# Import all models to ensure tables are created
import app.models.ticket
import app.models.employee_metric

Base.metadata.create_all(bind=engine)

NOW = datetime.utcnow()


def seed_teams(db):
    print("→ Seeding teams...")
    teams_data = [
        {"name": "Engineering Leadership", "description": "CTO and VP Engineering"},
        {"name": "Backend",    "description": "Alice Chen's backend squad"},
        {"name": "Frontend",   "description": "Jack Williams' frontend squad"},
        {"name": "DevOps",     "description": "Bob Martinez' infrastructure team"},
        {"name": "Security",   "description": "Irene Garcia's security team"},
        {"name": "QA",         "description": "Leo Zhang's quality assurance team"},
    ]
    teams = {}
    for td in teams_data:
        existing = db.query(Team).filter(Team.name == td["name"]).first()
        if not existing:
            t = Team(name=td["name"], description=td.get("description"))
            db.add(t)
            db.flush()
            teams[td["name"]] = t
        else:
            teams[td["name"]] = existing
    db.commit()
    print(f"  ✓ {len(teams_data)} teams")
    return teams


def seed_people(db):
    print("→ Seeding people...")
    people_data = [
        {"name": "Grace Liu",        "email": "grace.liu@nexustech.com",        "team": "Engineering Leadership"},
        {"name": "Michael Park",     "email": "michael.park@nexustech.com",     "team": "Engineering Leadership"},
        {"name": "Alice Chen",       "email": "alice.chen@nexustech.com",       "team": "Backend"},
        {"name": "David Kim",        "email": "david.kim@nexustech.com",        "team": "Backend"},
        {"name": "Jack Williams",    "email": "jack.williams@nexustech.com",    "team": "Frontend"},
        {"name": "Sarah Chen",       "email": "sarah.chen@nexustech.com",       "team": "Frontend"},
        {"name": "Bob Martinez",     "email": "bob.martinez@nexustech.com",     "team": "DevOps"},
        {"name": "Carlos Rodriguez", "email": "carlos.rodriguez@nexustech.com", "team": "DevOps"},
        {"name": "Irene Garcia",     "email": "irene.garcia@nexustech.com",     "team": "Security"},
        {"name": "Marcus Thompson",  "email": "marcus.thompson@nexustech.com",  "team": "Security"},
        {"name": "Leo Zhang",        "email": "leo.zhang@nexustech.com",        "team": "QA"},
        {"name": "Emma Wilson",      "email": "emma.wilson@nexustech.com",      "team": "QA"},
    ]
    from datetime import timezone
    now_tz = datetime.now(timezone.utc)

    people = {}
    for pd in people_data:
        existing = db.query(Person).filter(Person.email == pd["email"]).first()
        if not existing:
            team = db.query(Team).filter(Team.name == pd["team"]).first()
            p = Person(
                name=pd["name"],
                email=pd["email"],
                team_id=team.id if team else None,
                extra_data={"organization": "Nexus Technologies", "team_name": pd["team"]},
                first_seen=now_tz,
                last_seen=now_tz,
                event_count=0,
            )
            db.add(p)
            people[pd["email"]] = p
        else:
            people[pd["email"]] = existing
    db.commit()
    print(f"  ✓ {len(people_data)} people")
    return people


def seed_employee_metrics(db):
    print("→ Seeding employee metrics...")
    metrics_data = [
        {
            "name": "Grace Liu", "email": "grace.liu@nexustech.com",
            "role": "CTO", "team": "Engineering Leadership", "tier": "executive",
            "score": 85, "velocity": 90, "communication": 88, "collaboration": 80,
            "tickets_resolved": 0, "tickets_blocked": 0, "avg_close": 0,
            "pr_reviews": 3, "hours": 44, "risk": RiskLevel.HEALTHY,
            "trend": [80, 82, 83, 84, 85, 85, 84, 85],
            "insight": "Strong exec presence; 3 cross-team conflicts need CTO-level decision this sprint.",
        },
        {
            "name": "Michael Park", "email": "michael.park@nexustech.com",
            "role": "VP Engineering", "team": "Engineering Leadership", "tier": "vp",
            "score": 69, "velocity": 65, "communication": 72, "collaboration": 68,
            "tickets_resolved": 2, "tickets_blocked": 1, "avg_close": 6,
            "pr_reviews": 5, "hours": 46, "risk": RiskLevel.AT_RISK,
            "risk_reason": "3 team conflicts unresolved 7+ days. Decision velocity dropping.",
            "trend": [76, 75, 74, 72, 71, 70, 69, 69],
            "insight": "Declining trend — conflict backlog growing faster than resolutions.",
        },
        {
            "name": "Alice Chen", "email": "alice.chen@nexustech.com",
            "role": "Backend Lead", "team": "Backend", "tier": "lead",
            "score": 73, "velocity": 78, "communication": 74, "collaboration": 70,
            "tickets_resolved": 6, "tickets_blocked": 1, "avg_close": 5,
            "pr_reviews": 8, "hours": 42, "risk": RiskLevel.HEALTHY,
            "trend": [70, 71, 73, 74, 73, 73, 73, 73],
            "insight": "Solid performer. CORE-078 Redis work blocked by Infra policy — not her fault.",
        },
        {
            "name": "David Kim", "email": "david.kim@nexustech.com",
            "role": "Senior Backend Engineer", "team": "Backend", "tier": "senior",
            "score": 77, "velocity": 80, "communication": 72, "collaboration": 78,
            "tickets_resolved": 5, "tickets_blocked": 1, "avg_close": 4,
            "pr_reviews": 6, "hours": 40, "risk": RiskLevel.HEALTHY,
            "trend": [74, 75, 76, 77, 77, 77, 77, 77],
            "insight": "PR #292 Redis migration scripts ready. Waiting on INFRA approval to deploy.",
        },
        {
            "name": "Jack Williams", "email": "jack.williams@nexustech.com",
            "role": "Frontend Lead", "team": "Frontend", "tier": "lead",
            "score": 41, "velocity": 55, "communication": 38, "collaboration": 35,
            "tickets_resolved": 4, "tickets_blocked": 2, "avg_close": 11,
            "pr_reviews": 2, "hours": 52, "risk": RiskLevel.AT_RISK,
            "risk_reason": "7-week score decline (72→41). Shadow work on SEC fix without disclosure. Comms score critical.",
            "has_shadow": True, "burnout_risk": False,
            "trend": [72, 68, 64, 60, 55, 50, 45, 41],
            "insight": "Shadow work on PR #294 (WEB-051) is an audit liability. Needs a direct conversation, not blame.",
        },
        {
            "name": "Sarah Chen", "email": "sarah.chen@nexustech.com",
            "role": "Senior Frontend Engineer", "team": "Frontend", "tier": "senior",
            "score": 82, "velocity": 88, "communication": 80, "collaboration": 82,
            "tickets_resolved": 9, "tickets_blocked": 0, "avg_close": 3,
            "pr_reviews": 7, "hours": 38, "risk": RiskLevel.HEALTHY,
            "trend": [75, 77, 78, 79, 80, 81, 82, 82],
            "insight": "Sprint MVP. 9 tickets, 3-day avg close, 7 PR reviews. Recognition opportunity at All-Hands.",
        },
        {
            "name": "Bob Martinez", "email": "bob.martinez@nexustech.com",
            "role": "DevOps Lead", "team": "DevOps", "tier": "lead",
            "score": 54, "velocity": 48, "communication": 58, "collaboration": 52,
            "tickets_resolved": 2, "tickets_blocked": 3, "avg_close": 12,
            "pr_reviews": 3, "hours": 43, "risk": RiskLevel.AT_RISK,
            "risk_reason": "Blocking Redis decision. 3 INFRA tickets deadlocked >14 days.",
            "trend": [62, 61, 60, 58, 57, 55, 54, 54],
            "insight": "Needs to make the Redis/Memcached call. Sitting on it is the problem.",
        },
        {
            "name": "Carlos Rodriguez", "email": "carlos.rodriguez@nexustech.com",
            "role": "Senior DevOps Engineer", "team": "DevOps", "tier": "senior",
            "score": 58, "velocity": 60, "communication": 55, "collaboration": 58,
            "tickets_resolved": 3, "tickets_blocked": 3, "avg_close": 14,
            "pr_reviews": 2, "hours": 56, "risk": RiskLevel.OVERLOADED,
            "risk_reason": "56h/week for 2 consecutive weeks. 3 blocked tickets. Carrying the INFRA deadlock.",
            "burnout_risk": True,
            "trend": [68, 66, 64, 62, 61, 60, 59, 58],
            "insight": "Burnout risk. Rachel Foster already reached out. Michael Park must unblock INFRA-024/025 this sprint.",
        },
        {
            "name": "Irene Garcia", "email": "irene.garcia@nexustech.com",
            "role": "Security Lead", "team": "Security", "tier": "lead",
            "score": 62, "velocity": 65, "communication": 70, "collaboration": 52,
            "tickets_resolved": 4, "tickets_blocked": 1, "avg_close": 7,
            "pr_reviews": 3, "hours": 43, "risk": RiskLevel.AT_RISK,
            "risk_reason": "SEC-007 open 17 days with no Frontend cooperation. Morale declining.",
            "trend": [70, 68, 67, 65, 64, 63, 62, 62],
            "insight": "Doing the right thing on SEC-007. Frustrated by lack of escalation support.",
        },
        {
            "name": "Marcus Thompson", "email": "marcus.thompson@nexustech.com",
            "role": "Security Engineer", "team": "Security", "tier": "senior",
            "score": 71, "velocity": 75, "communication": 70, "collaboration": 68,
            "tickets_resolved": 5, "tickets_blocked": 0, "avg_close": 5,
            "pr_reviews": 4, "hours": 40, "risk": RiskLevel.HEALTHY,
            "trend": [68, 69, 70, 71, 71, 71, 71, 71],
            "insight": "SEC-002 audit delivered all 3 violations on time. Solid work.",
        },
        {
            "name": "Leo Zhang", "email": "leo.zhang@nexustech.com",
            "role": "QA Lead", "team": "QA", "tier": "lead",
            "score": 79, "velocity": 80, "communication": 76, "collaboration": 80,
            "tickets_resolved": 7, "tickets_blocked": 0, "avg_close": 4,
            "pr_reviews": 5, "hours": 41, "risk": RiskLevel.HEALTHY,
            "trend": [76, 77, 78, 79, 79, 79, 79, 79],
            "insight": "QA-034 and QA-037 both delivered on time with actionable findings.",
        },
        {
            "name": "Emma Wilson", "email": "emma.wilson@nexustech.com",
            "role": "QA Engineer", "team": "QA", "tier": "engineer",
            "score": 76, "velocity": 78, "communication": 74, "collaboration": 76,
            "tickets_resolved": 6, "tickets_blocked": 0, "avg_close": 4,
            "pr_reviews": 4, "hours": 39, "risk": RiskLevel.HEALTHY,
            "trend": [73, 74, 74, 75, 76, 76, 76, 76],
            "insight": "QA-037 confirmed Basic Auth exploitable in <2 min. Great catch.",
        },
    ]

    for md in metrics_data:
        existing = db.query(EmployeeMetric).filter(
            EmployeeMetric.employee_email == md["email"],
            EmployeeMetric.sprint == 3,
        ).first()
        if existing:
            continue

        m = EmployeeMetric(
            employee_name=md["name"],
            employee_email=md["email"],
            role=md["role"],
            team_name=md["team"],
            tier=md["tier"],
            sprint=3,
            overall_score=md["score"],
            velocity_score=md["velocity"],
            communication_score=md["communication"],
            collaboration_score=md["collaboration"],
            tickets_resolved=md.get("tickets_resolved", 0),
            tickets_blocked=md.get("tickets_blocked", 0),
            avg_close_days=md.get("avg_close", 0),
            pr_reviews=md.get("pr_reviews", 0),
            hours_this_week=md.get("hours", 40),
            risk_level=md.get("risk", RiskLevel.HEALTHY),
            risk_reason=md.get("risk_reason"),
            score_trend=md.get("trend", []),
            has_shadow_work="Y" if md.get("has_shadow") else "N",
            is_burnout_risk="Y" if md.get("burnout_risk") else "N",
            insight=md.get("insight"),
        )
        db.add(m)

    db.commit()
    print(f"  ✓ {len(metrics_data)} employee metrics")


def seed_tickets(db):
    print("→ Seeding tickets...")
    tickets_data = [
        {
            "key": "SEC-007", "title": "Basic Auth Violation — 3 Production Endpoints",
            "description": "WEB-045/046/047 use Basic Auth in violation of SEC-STD-012. OAuth 2.0 required. Open 17 days.",
            "status": TicketStatus.TODO, "priority": TicketPriority.CRITICAL,
            "assignee_name": "Irene Garcia", "assignee_email": "irene.garcia@nexustech.com",
            "team": "Security", "days_open": 17, "blocked": False, "conflict": True,
        },
        {
            "key": "WEB-051", "title": "[DRAFT] Migrate User Endpoints to OAuth 2.0",
            "description": "Secret fix for SEC-007 violations. Draft PR #294 opened by Jack without notifying Security.",
            "status": TicketStatus.IN_PROGRESS, "priority": TicketPriority.CRITICAL,
            "assignee_name": "Jack Williams", "assignee_email": "jack.williams@nexustech.com",
            "team": "Frontend", "days_open": 5, "blocked": False, "shadow": True, "conflict": True,
        },
        {
            "key": "WEB-045", "title": "User Profile API — Basic Auth (PRODUCTION VIOLATION)",
            "description": "PR #267 merged 21 days ago. /api/user-profile uses Basic Auth. SEC-STD-012 violation.",
            "status": TicketStatus.TODO, "priority": TicketPriority.CRITICAL,
            "assignee_name": "Jack Williams", "assignee_email": "jack.williams@nexustech.com",
            "team": "Frontend", "days_open": 21, "conflict": True,
        },
        {
            "key": "WEB-046", "title": "Notifications API — Basic Auth (PRODUCTION VIOLATION)",
            "description": "/api/notifications using Basic Auth. QA-037 confirmed exploitable.",
            "status": TicketStatus.DONE, "priority": TicketPriority.HIGH,
            "assignee_name": "Sarah Chen", "assignee_email": "sarah.chen@nexustech.com",
            "team": "Frontend", "days_open": 18, "conflict": True,
            "closed_at": NOW - timedelta(days=2),
        },
        {
            "key": "WEB-047", "title": "Settings API — Basic Auth (PRODUCTION VIOLATION)",
            "description": "/api/settings using Basic Auth + no session timeout. Violation of SEC-STD-012.",
            "status": TicketStatus.TODO, "priority": TicketPriority.HIGH,
            "assignee_name": "Jack Williams", "assignee_email": "jack.williams@nexustech.com",
            "team": "Frontend", "days_open": 19, "conflict": True,
        },
        {
            "key": "CORE-078", "title": "Redis Transaction Query Caching Layer",
            "description": "Alice's Redis integration for transaction queries. 40% faster than Memcached per QA-034. Blocked on INFRA.",
            "status": TicketStatus.IN_PROGRESS, "priority": TicketPriority.HIGH,
            "assignee_name": "Alice Chen", "assignee_email": "alice.chen@nexustech.com",
            "team": "Backend", "days_open": 21, "blocked": True, "conflict": True,
        },
        {
            "key": "INFRA-024", "title": "Caching Standards Policy Update — INFRA-STD-001",
            "description": "Policy must be updated to approve Redis. Blocked by Bob Martinez decision. 14 days stalled.",
            "status": TicketStatus.BLOCKED, "priority": TicketPriority.HIGH,
            "assignee_name": "Carlos Rodriguez", "assignee_email": "carlos.rodriguez@nexustech.com",
            "team": "DevOps", "days_open": 14, "blocked": True, "conflict": True,
        },
        {
            "key": "INFRA-025", "title": "Provision Redis ElastiCache Cluster (Terraform)",
            "description": "Carlos cannot provision until INFRA-024 policy is approved. Blocked 14 days.",
            "status": TicketStatus.BLOCKED, "priority": TicketPriority.HIGH,
            "assignee_name": "Carlos Rodriguez", "assignee_email": "carlos.rodriguez@nexustech.com",
            "team": "DevOps", "days_open": 14, "blocked": True,
        },
        {
            "key": "QA-034", "title": "Cache Benchmark: Redis vs Memcached Performance Test",
            "description": "Results: Redis 40% faster (2.1ms vs 3.5ms avg). Eviction rate Redis 0.3% vs Memcached 4.1%.",
            "status": TicketStatus.DONE, "priority": TicketPriority.HIGH,
            "assignee_name": "Leo Zhang", "assignee_email": "leo.zhang@nexustech.com",
            "team": "QA", "days_open": 7, "closed_at": NOW - timedelta(days=2),
        },
        {
            "key": "QA-037", "title": "Auth Regression Test — Basic Auth Security Audit",
            "description": "All 3 Basic Auth endpoints confirmed exploitable in <2 min simulated network interception.",
            "status": TicketStatus.DONE, "priority": TicketPriority.CRITICAL,
            "assignee_name": "Emma Wilson", "assignee_email": "emma.wilson@nexustech.com",
            "team": "QA", "days_open": 5, "closed_at": NOW - timedelta(days=1),
        },
        {
            "key": "WEB-052", "title": "User Settings UI Refactor",
            "description": "PR #296 merged. 2 days ahead of schedule.",
            "status": TicketStatus.DONE, "priority": TicketPriority.MEDIUM,
            "assignee_name": "Sarah Chen", "assignee_email": "sarah.chen@nexustech.com",
            "team": "Frontend", "days_open": 4, "closed_at": NOW - timedelta(days=1),
        },
        {
            "key": "WEB-048", "title": "Mobile Breakpoint Fixes",
            "description": "Done, waiting on Jack's code review.",
            "status": TicketStatus.REVIEW, "priority": TicketPriority.MEDIUM,
            "assignee_name": "Sarah Chen", "assignee_email": "sarah.chen@nexustech.com",
            "team": "Frontend", "days_open": 3,
        },
        {
            "key": "CORE-079", "title": "Memcached → Redis Data Migration",
            "description": "PR #292 by David Kim ready. Zero-downtime dual-write strategy. Blocked on INFRA-025.",
            "status": TicketStatus.BLOCKED, "priority": TicketPriority.HIGH,
            "assignee_name": "David Kim", "assignee_email": "david.kim@nexustech.com",
            "team": "Backend", "days_open": 7, "blocked": True,
        },
        {
            "key": "SEC-002", "title": "Security Audit — Basic Auth Violations Scan",
            "description": "Marcus Thompson audit. Found WEB-045, WEB-046, WEB-047 + draft PR #294 shadow fix.",
            "status": TicketStatus.DONE, "priority": TicketPriority.HIGH,
            "assignee_name": "Marcus Thompson", "assignee_email": "marcus.thompson@nexustech.com",
            "team": "Security", "days_open": 3, "closed_at": NOW - timedelta(days=1),
        },
        {
            "key": "INFRA-023", "title": "Infrastructure Standards Documentation v2.1 Review",
            "description": "Quarterly review of INFRA-STD-001 and INFRA-STD-003. Blocked by caching debate.",
            "status": TicketStatus.IN_PROGRESS, "priority": TicketPriority.MEDIUM,
            "assignee_name": "Bob Martinez", "assignee_email": "bob.martinez@nexustech.com",
            "team": "DevOps", "days_open": 9,
        },
    ]

    count = 0
    for td in tickets_data:
        existing = db.query(Ticket).filter(Ticket.key == td["key"]).first()
        if existing:
            continue

        t = Ticket(
            key=td["key"],
            title=td["title"],
            description=td.get("description"),
            status=td["status"],
            priority=td["priority"],
            assignee_name=td.get("assignee_name"),
            assignee_email=td.get("assignee_email"),
            team_name=td.get("team"),
            sprint=3,
            days_open=td.get("days_open", 0),
            is_blocked="Y" if td.get("blocked") else "N",
            is_shadow="Y" if td.get("shadow") else "N",
            is_conflict_linked="Y" if td.get("conflict") else "N",
            closed_at=td.get("closed_at"),
            created_at=NOW - timedelta(days=td.get("days_open", 0)),
        )
        db.add(t)
        count += 1

    db.commit()
    print(f"  ✓ {count} tickets")


def seed_conflicts(db):
    print("→ Seeding conflicts...")
    conflicts_data = [
        {
            "type": ConflictType.CLAIM_CONFLICT,
            "severity": ConflictSeverity.CRITICAL,
            "status": ConflictStatus.OPEN,
            "description": "SEC-007: Jack Williams deployed Basic Auth (WEB-045/046/047) violating SEC-STD-012 (OAuth 2.0 mandatory). Irene Garcia raised formal violation. QA-037 confirmed all endpoints exploitable. Jack is secretly fixing via PR #294 without informing Security.",
            "entity_ids": ["jack.williams@nexustech.com", "irene.garcia@nexustech.com"],
            "evidence": [{"ticket": "SEC-007"}, {"ticket": "WEB-051"}, {"audit": "SEC-002"}, {"qa": "QA-037"}],
            "days_ago": 17,
        },
        {
            "type": ConflictType.DECISION_CONFLICT,
            "severity": ConflictSeverity.HIGH,
            "status": ConflictStatus.OPEN,
            "description": "Redis vs Memcached deadlock. Alice Chen (Backend) proposes Redis — backed by QA-034 data (40% faster). Bob Martinez (DevOps) blocks via INFRA-STD-001. Grace Liu gave directional approval but no formal policy override. Deadlock is now 14 days old.",
            "entity_ids": ["alice.chen@nexustech.com", "bob.martinez@nexustech.com"],
            "evidence": [{"ticket": "INFRA-024"}, {"benchmark": "QA-034"}, {"policy": "INFRA-STD-001"}],
            "days_ago": 14,
        },
        {
            "type": ConflictType.RESOURCE_CONFLICT,
            "severity": ConflictSeverity.HIGH,
            "status": ConflictStatus.OPEN,
            "description": "Carlos Rodriguez (DevOps) is overloaded carrying 3 blocked tickets (INFRA-024, INFRA-025, CORE-079) for 14 days while the Bob/Alice policy dispute remains unresolved. He is logging 56h/week. Burnout risk flagged by HR.",
            "entity_ids": ["carlos.rodriguez@nexustech.com", "bob.martinez@nexustech.com"],
            "evidence": [{"ticket": "INFRA-025"}, {"hours_logged": "56h/week"}, {"ticket": "CORE-079"}],
            "days_ago": 14,
        },
        {
            "type": ConflictType.CLAIM_CONFLICT,
            "severity": ConflictSeverity.MEDIUM,
            "status": ConflictStatus.OPEN,
            "description": "Jack Williams created draft PR #294 (WEB-051) to fix SEC-007 auth violations without disclosing it to Security Lead Irene Garcia or CTO Grace Liu. This constitutes shadow work on a critical security issue and creates audit liability.",
            "entity_ids": ["jack.williams@nexustech.com", "grace.liu@nexustech.com"],
            "evidence": [{"pr": "#294"}, {"ticket": "WEB-051"}],
            "days_ago": 5,
        },
        {
            "type": ConflictType.PRIORITY_CONFLICT,
            "severity": ConflictSeverity.MEDIUM,
            "status": ConflictStatus.OPEN,
            "description": "INFRA-STD-001 mandates Memcached as the approved caching solution, but QA-034 data proves Redis outperforms it by 40% under production load. The policy directly contradicts QA evidence, causing team-level paralysis.",
            "entity_ids": ["bob.martinez@nexustech.com", "leo.zhang@nexustech.com"],
            "evidence": [{"policy": "INFRA-STD-001"}, {"qa_report": "QA-034"}],
            "days_ago": 7,
        },
        {
            "type": ConflictType.TIMELINE_CONFLICT,
            "severity": ConflictSeverity.LOW,
            "status": ConflictStatus.OPEN,
            "description": "Sprint 3 committed to shipping CORE-078 Redis caching. INFRA approval (INFRA-024) is required first but has been blocked 14 days. Sprint will end without delivery unless Bob Martinez approves today.",
            "entity_ids": ["alice.chen@nexustech.com", "carlos.rodriguez@nexustech.com"],
            "evidence": [{"ticket": "CORE-078"}, {"ticket": "INFRA-024"}],
            "days_ago": 3,
        },
    ]

    def get_person_id(email: str):
        """Look up a person's UUID by email, or generate a stable one."""
        p = db.query(Person).filter(Person.email == email).first()
        return p.id if p else uuid.uuid5(uuid.NAMESPACE_DNS, email)

    count = 0
    for cd in conflicts_data:
        entities = cd.get("entity_ids", [])
        a_id = get_person_id(entities[0]) if entities else uuid.uuid4()
        b_id = get_person_id(entities[1]) if len(entities) > 1 else uuid.uuid4()

        c = Conflict(
            conflict_type=cd["type"],
            severity=cd["severity"],
            status=cd["status"],
            description=cd["description"],
            entity_a_type="person",
            entity_a_id=a_id,
            entity_b_type="person",
            entity_b_id=b_id,
            evidence=cd.get("evidence", []),
            extra_data={"entities": entities},
            created_at=NOW - timedelta(days=cd.get("days_ago", 0)),
        )
        db.add(c)
        count += 1

    db.commit()
    print(f"  ✓ {count} conflicts")


def seed_events(db):
    print("→ Seeding events (org emails/communications)...")
    events_data = [
        {
            "source": "email", "subject": "ESCALATION: SEC-007 — 17 Days Open, Action Required",
            "sender": "irene.garcia@nexustech.com",
            "recipients": ["grace.liu@nexustech.com"],
            "body": "Grace, SEC-007 has been open 17 days. Jack is doing shadow work on PR #294 without notifying Security. I need a mandatory meeting and a production freeze on Basic Auth deployments.",
            "days_ago": 1,
        },
        {
            "source": "email", "subject": "Redis vs Memcached — You Need to Call It Today",
            "sender": "michael.park@nexustech.com",
            "recipients": ["bob.martinez@nexustech.com"],
            "body": "Bob, INFRA-024 and INFRA-025 have been blocked for 14+ days. Carlos is working 56 hours a week. Need a policy decision today.",
            "days_ago": 0,
        },
        {
            "source": "email", "subject": "SEC-002 Audit Complete — 3 Basic Auth Violations Confirmed",
            "sender": "marcus.thompson@nexustech.com",
            "recipients": ["irene.garcia@nexustech.com"],
            "body": "Confirmed: WEB-045, WEB-046, WEB-047 in production using Basic Auth. Also found draft PR #294 by Jack Williams — OAuth fix but not disclosed to Security.",
            "days_ago": 4,
        },
        {
            "source": "email", "subject": "QA-034 Benchmark: Redis 40% Faster Than Memcached",
            "sender": "leo.zhang@nexustech.com",
            "recipients": ["alice.chen@nexustech.com", "bob.martinez@nexustech.com", "michael.park@nexustech.com"],
            "body": "Redis: 2.1ms avg, 0.3% eviction. Memcached: 3.5ms avg, 4.1% eviction. Data strongly favors Redis.",
            "days_ago": 5,
        },
        {
            "source": "email", "subject": "QA-037: Basic Auth Confirmed Exploitable — Critical",
            "sender": "emma.wilson@nexustech.com",
            "recipients": ["leo.zhang@nexustech.com"],
            "body": "All 3 endpoints failed auth security checks. Credentials captured in <2 minutes via simulated network interception. Marked CRITICAL. Linked to SEC-007.",
            "days_ago": 4,
        },
        {
            "source": "email", "subject": "INFRA-024 Still Blocked — Week 2",
            "sender": "carlos.rodriguez@nexustech.com",
            "recipients": ["bob.martinez@nexustech.com"],
            "body": "Bob, I am logging 56 hours a week carrying 3 blocked tickets in limbo. I need this unblocked. Can we do a temporary exception?",
            "days_ago": 2,
        },
        {
            "source": "email", "subject": "RE: API Auth — Can We Discuss Before You Publish?",
            "sender": "jack.williams@nexustech.com",
            "recipients": ["marcus.thompson@nexustech.com"],
            "body": "Marcus, I am already working on a fix — PR #294. Can we discuss this before it goes to Irene? I want to fix it quietly and avoid the politics.",
            "days_ago": 4,
        },
        {
            "source": "email", "subject": "Sprint 3 — Things I Want to Discuss",
            "sender": "grace.liu@nexustech.com",
            "recipients": ["michael.park@nexustech.com"],
            "body": "Infrastructure team is at 56/100, lowest in company. Redis vs Memcached needs to be decided this sprint. I want to hear about SEC-007. Sarah Chen is doing exceptional work.",
            "days_ago": 0,
        },
        {
            "source": "slack", "subject": "Checking In — How Are You Doing?",
            "sender": "rachel.foster@nexustech.com",
            "recipients": ["carlos.rodriguez@nexustech.com"],
            "body": "Carlos, I have seen your hours this week (56h). You are allowed to flag this. Please take your lunch breaks.",
            "days_ago": 2,
        },
        {
            "source": "email", "subject": "Proposal: Redis for Transaction Caching Layer",
            "sender": "alice.chen@nexustech.com",
            "recipients": ["michael.park@nexustech.com", "bob.martinez@nexustech.com"],
            "body": "Redis delivers 40% performance improvement over Memcached. Persistence, pub/sub, per-key TTL. QA-034 confirms it. Requesting INFRA-025 ElastiCache approval.",
            "days_ago": 14,
        },
    ]

    import hashlib
    from sqlalchemy import text as sa_text

    count = 0
    for ed in events_data:
        body_text = ed.get("body", "")
        content_hash = hashlib.sha256(
            f"{ed.get('sender', '')}{ed.get('subject', '')}{body_text}".encode()
        ).hexdigest()

        existing = db.execute(sa_text("SELECT id FROM events WHERE content_hash = :h"),
                              {"h": content_hash}).fetchone()
        if existing:
            continue

        ts = NOW - timedelta(days=ed.get("days_ago", 0))
        e = Event(
            source=ed.get("source", "email"),
            channel=ed.get("source", "email"),
            timestamp=ts,
            sender=ed.get("sender", "system@nexustech.com"),
            recipients=ed.get("recipients", []),
            subject=ed.get("subject"),
            body_text=body_text,
            content_hash=content_hash,
            extraction_status="completed",
            created_at=ts,
        )
        db.add(e)
        count += 1

    db.commit()
    print(f"  ✓ {count} events")


def seed_topics(db):
    print("→ Seeding topics...")
    topics_data = [
        {
            "name": "Authentication Standards",
            "description": "OAuth 2.0 vs Basic Auth debate. SEC-STD-012 mandates OAuth 2.0. Frontend violated this in WEB-045/046/047. Active conflict SEC-007.",
        },
        {
            "name": "Caching Infrastructure",
            "description": "Redis vs Memcached policy conflict. Alice proposes Redis (40% faster per QA-034). Bob blocks via INFRA-STD-001. Carlos overloaded carrying the deadlock.",
        },
        {
            "name": "Sprint 3 Delivery",
            "description": "Sprint 3 at risk. CORE-078 Redis implementation blocked. SEC-007 unresolved. Carlos burnout risk. Sarah Chen is MVP.",
        },
    ]
    count = 0
    for td in topics_data:
        existing = db.query(Topic).filter(Topic.name == td["name"]).first()
        if not existing:
            t = Topic(name=td["name"], description=td["description"])
            db.add(t)
            count += 1
    db.commit()
    print(f"  ✓ {count} topics")


def main():
    print("\n🌱 Seeding Nexus Technologies org data into PostgreSQL...\n")
    db = SessionLocal()
    try:
        seed_teams(db)
        seed_people(db)
        seed_employee_metrics(db)
        seed_tickets(db)
        seed_conflicts(db)
        seed_events(db)
        seed_topics(db)
        print("\n✅ Seed complete! Backend is ready.\n")
        print("  API:     http://localhost:8000")
        print("  Docs:    http://localhost:8000/docs")
        print("  Health:  http://localhost:8000/api/v1/org-health")
        print("  Briefs:  http://localhost:8000/api/v1/briefs/morning")
    except Exception as e:
        print(f"\n❌ Seed failed: {e}")
        import traceback; traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
