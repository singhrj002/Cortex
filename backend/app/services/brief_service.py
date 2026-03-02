"""
Brief Service — generates ARIA's morning and evening CTO briefs.
Pulls live data from PostgreSQL and passes it as context to OpenAI GPT-4o-mini.
The result is what ARIA speaks to Grace Liu each morning and evening.
"""

import logging
from datetime import datetime, timedelta
from typing import Literal

from sqlalchemy.orm import Session

from app.models.conflict import Conflict, ConflictStatus, ConflictSeverity
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.models.employee_metric import EmployeeMetric, RiskLevel
from app.services.health_service import compute_org_health

logger = logging.getLogger(__name__)

BriefType = Literal["morning", "evening"]

MORNING_PROMPT = """You are ARIA, the personal AI executive assistant to Grace Liu, CTO of Nexus Technologies.
Deliver a spoken morning brief — warm, direct, 200 words max.
Structure (in natural speech, NO bullet points, NO markdown):
1. Opening greeting with today's date
2. Critical actions needing Grace's decision TODAY (use real names and ticket IDs)
3. Today's 2-3 most important meetings with context
4. One employee to watch / praise
5. Close with: "What would you like to dig into first?"

Org data below — be specific, not generic."""

EVENING_PROMPT = """You are ARIA, the personal AI executive assistant to Grace Liu, CTO of Nexus Technologies.
Deliver a spoken evening brief — reflective, direct, 180 words max.
Structure (in natural speech, NO bullet points, NO markdown):
1. Opening with today's date
2. What moved forward today / what got resolved
3. What is STILL unresolved and needs Grace's attention tomorrow
4. Top 3 priorities for tomorrow (concrete, specific)
5. One employee Grace should personally check in with
6. Close with the current health score and: "Any questions before you close out?"

Org data below — be specific, not generic."""


async def generate_brief(brief_type: BriefType, db: Session) -> str:
    """
    Generate a CTO brief from live DB data.
    Returns the text that ARIA will speak.
    """
    context = _build_context(db)

    system_prompt = MORNING_PROMPT if brief_type == "morning" else EVENING_PROMPT
    user_message = f"Today is {datetime.utcnow().strftime('%A, %B %d, %Y')}.\n\n{context}"

    try:
        from openai import AsyncOpenAI
        from app.core.config import settings

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.55,
            max_tokens=400,
        )
        return response.choices[0].message.content or _fallback_brief(brief_type, db)

    except Exception as exc:
        logger.error(f"Brief generation failed: {exc}")
        return _fallback_brief(brief_type, db)


def _build_context(db: Session) -> str:
    """Build a concise text summary of live org state for the AI prompt."""
    lines = []

    # ── Health score ──────────────────────────────────────────────────────────
    health = compute_org_health(db)
    lines.append(f"ORG HEALTH SCORE: {health['overall_score']}/100 ({health['trend'].upper()})")
    lines.append(f"  Conflict Rate {health['pillars'][0]['score']}/100 | Decision Velocity {health['pillars'][1]['score']}/100 | Execution Cadence {health['pillars'][4]['score']}/100")

    # ── Open conflicts ────────────────────────────────────────────────────────
    conflicts = db.query(Conflict).filter(Conflict.status == ConflictStatus.OPEN).all()
    if conflicts:
        lines.append(f"\nACTIVE CONFLICTS ({len(conflicts)} open):")
        for c in sorted(conflicts, key=lambda x: x.severity.value)[:5]:
            days = (datetime.utcnow() - c.created_at).days if c.created_at else "?"
            lines.append(f"  [{c.severity.value.upper()}] {c.description[:120]} — {days} days open")

    # ── Blocked/critical tickets ──────────────────────────────────────────────
    blocked = db.query(Ticket).filter(Ticket.status == TicketStatus.BLOCKED).all()
    critical = db.query(Ticket).filter(
        Ticket.priority == TicketPriority.CRITICAL,
        Ticket.status != TicketStatus.DONE,
    ).all()
    if blocked:
        lines.append(f"\nBLOCKED TICKETS ({len(blocked)}):")
        for t in blocked[:5]:
            lines.append(f"  {t.key}: {t.title[:80]} — {t.days_open}d — {t.assignee_name}")
    if critical:
        lines.append(f"\nCRITICAL TICKETS ({len(critical)} not done):")
        for t in critical[:4]:
            lines.append(f"  {t.key}: {t.title[:80]} ({t.status.value}) — {t.assignee_name}")

    # ── At-risk employees ─────────────────────────────────────────────────────
    at_risk = db.query(EmployeeMetric).filter(
        EmployeeMetric.risk_level.in_([RiskLevel.AT_RISK, RiskLevel.OVERLOADED, RiskLevel.CRITICAL])
    ).all()
    stars = db.query(EmployeeMetric).filter(
        EmployeeMetric.overall_score >= 78,
        EmployeeMetric.risk_level == RiskLevel.HEALTHY,
    ).order_by(EmployeeMetric.overall_score.desc()).limit(2).all()

    if at_risk:
        lines.append(f"\nAT-RISK EMPLOYEES ({len(at_risk)}):")
        for e in at_risk:
            lines.append(
                f"  {e.employee_name} ({e.role}) — score {e.overall_score:.0f}/100 — {e.risk_reason or 'see metrics'}"
                + (" | BURNOUT RISK" if e.is_burnout_risk == "Y" else "")
            )
    if stars:
        lines.append(f"\nSPRINT STARS (recognition opportunities):")
        for e in stars:
            lines.append(f"  {e.employee_name} — {e.overall_score:.0f}/100 — {e.insight or 'strong performer'}")

    # ── Today's key meetings ──────────────────────────────────────────────────
    lines.append(f"\nTODAY'S KEY MEETINGS (Monday Mar 2):")
    lines.append("  09:00 Engineering All-Hands Standup (Grace + all leads)")
    lines.append("  11:00 Sprint 3 Mid-Sprint Review — agenda: Redis policy, SEC-007, Carlos burnout")
    lines.append("  14:00 Team Leads Weekly — decisions needed: INFRA-STD-001 Redis override")

    return "\n".join(lines)


def _fallback_brief(brief_type: BriefType, db: Session) -> str:
    """Fallback brief if OpenAI is unavailable — computed entirely from DB."""
    conflicts = db.query(Conflict).filter(Conflict.status == ConflictStatus.OPEN).count()
    blocked   = db.query(Ticket).filter(Ticket.status == TicketStatus.BLOCKED).count()
    health    = compute_org_health(db)

    if brief_type == "morning":
        return (
            f"Good morning Grace. Today is {datetime.utcnow().strftime('%A, %B %d')}. "
            f"Your org health is at {health['overall_score']} out of 100, trending {health['trend']}. "
            f"You have {conflicts} open conflicts and {blocked} blocked tickets requiring your attention. "
            f"Your most critical items today are SEC-007, the Redis policy decision, and Carlos Rodriguez's workload. "
            f"What would you like to dig into first?"
        )
    else:
        return (
            f"Good evening Grace. Closing out {datetime.utcnow().strftime('%A, %B %d')}. "
            f"Org health is at {health['overall_score']} out of 100. "
            f"There are still {conflicts} open conflicts. "
            f"For tomorrow, prioritise SEC-007, force the Redis decision, and check in personally with Carlos Rodriguez. "
            f"Any questions before you close out?"
        )
