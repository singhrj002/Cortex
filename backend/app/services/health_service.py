"""
Health Service — computes real org health score from live database data.

The score is a weighted composite of 5 pillars:
  - Conflict Rate      30%  (open/critical conflicts in DB)
  - Decision Velocity  20%  (age of unresolved decisions)
  - Communication      15%  (event activity in last 7 days)
  - Knowledge Density  15%  (documented topics ratio)
  - Execution Cadence  20%  (tickets closed per sprint)
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.conflict import Conflict, ConflictSeverity, ConflictStatus
from app.models.ticket import Ticket, TicketStatus
from app.models.employee_metric import EmployeeMetric, RiskLevel
from app.models.event import Event


# ─── Weight constants ─────────────────────────────────────────────────────────
WEIGHT_CONFLICT    = 0.30
WEIGHT_DECISION    = 0.20
WEIGHT_COMMS       = 0.15
WEIGHT_KNOWLEDGE   = 0.15
WEIGHT_EXECUTION   = 0.20


def _conflict_rate_score(db: Session) -> tuple[float, dict]:
    """Lower open/critical conflicts → higher score."""
    open_count    = db.query(Conflict).filter(Conflict.status == ConflictStatus.OPEN).count()
    critical_count = db.query(Conflict).filter(
        Conflict.severity == ConflictSeverity.CRITICAL,
        Conflict.status == ConflictStatus.OPEN,
    ).count()
    high_count = db.query(Conflict).filter(
        Conflict.severity == ConflictSeverity.HIGH,
        Conflict.status == ConflictStatus.OPEN,
    ).count()

    # Each open conflict costs 8 pts; critical costs extra 10 pts; high extra 5 pts
    penalty = (open_count * 8) + (critical_count * 10) + (high_count * 5)
    score = max(0.0, 100.0 - penalty)
    return score, {
        "open_conflicts": open_count,
        "critical_conflicts": critical_count,
        "high_conflicts": high_count,
        "penalty": penalty,
    }


def _decision_velocity_score(db: Session) -> tuple[float, dict]:
    """
    Measures how fast blocked tickets get resolved.
    Old blocked tickets → lower score.
    """
    blocked = db.query(Ticket).filter(Ticket.status == TicketStatus.BLOCKED).all()
    if not blocked:
        return 85.0, {"blocked_tickets": 0, "avg_days_blocked": 0}

    avg_days = sum(t.days_open for t in blocked) / len(blocked)
    # 5 days avg → 75 pts;  14 days → ~35 pts;  21+ days → ~0 pts
    score = max(0.0, 100.0 - (avg_days * 4.5))
    return score, {
        "blocked_tickets": len(blocked),
        "avg_days_blocked": round(avg_days, 1),
    }


def _communication_score(db: Session) -> tuple[float, dict]:
    """Events logged in the last 7 days → higher communication score."""
    cutoff = datetime.utcnow() - timedelta(days=7)
    recent = db.query(Event).filter(Event.created_at >= cutoff).count()
    total  = db.query(Event).count()

    # 30+ events in a week → healthy; fewer → declining
    score = min(100.0, recent * 3.5)
    return score, {
        "events_last_7_days": recent,
        "total_events": total,
    }


def _knowledge_density_score(db: Session) -> tuple[float, dict]:
    """
    Ratio of blocked/shadow tickets to total tickets.
    High shadow work + undocumented decisions → lower score.
    """
    total_tickets  = db.query(Ticket).count()
    shadow_tickets = db.query(Ticket).filter(Ticket.is_shadow == "Y").count()
    blocked_pct = db.query(Ticket).filter(Ticket.is_blocked == "Y").count()

    if total_tickets == 0:
        return 50.0, {"total_tickets": 0, "shadow_tickets": 0}

    shadow_ratio  = shadow_tickets / total_tickets
    blocked_ratio = blocked_pct / total_tickets
    score = max(0.0, 100.0 - (shadow_ratio * 80) - (blocked_ratio * 60))
    return score, {
        "total_tickets": total_tickets,
        "shadow_tickets": shadow_tickets,
        "shadow_ratio": round(shadow_ratio, 2),
        "blocked_ratio": round(blocked_ratio, 2),
    }


def _execution_cadence_score(db: Session) -> tuple[float, dict]:
    """Tickets closed in last 14 days → higher execution score."""
    cutoff = datetime.utcnow() - timedelta(days=14)
    closed = db.query(Ticket).filter(
        Ticket.status == TicketStatus.DONE,
        Ticket.closed_at >= cutoff,
    ).count()
    in_progress = db.query(Ticket).filter(Ticket.status == TicketStatus.IN_PROGRESS).count()

    # 15 closed in a sprint → healthy
    score = min(100.0, closed * 6.5)
    return score, {
        "tickets_closed_14d": closed,
        "tickets_in_progress": in_progress,
    }


def compute_org_health(db: Session) -> Dict[str, Any]:
    """
    Main entry point — computes full org health from live DB data.
    Returns a rich payload consumed by the frontend dashboard and ARIA briefs.
    """
    conflict_score,  conflict_meta  = _conflict_rate_score(db)
    decision_score,  decision_meta  = _decision_velocity_score(db)
    comms_score,     comms_meta     = _communication_score(db)
    knowledge_score, knowledge_meta = _knowledge_density_score(db)
    execution_score, execution_meta = _execution_cadence_score(db)

    overall = round(
        conflict_score  * WEIGHT_CONFLICT  +
        decision_score  * WEIGHT_DECISION  +
        comms_score     * WEIGHT_COMMS     +
        knowledge_score * WEIGHT_KNOWLEDGE +
        execution_score * WEIGHT_EXECUTION
    )

    # Determine trend direction based on employee risk distribution
    at_risk = db.query(EmployeeMetric).filter(
        EmployeeMetric.risk_level.in_([RiskLevel.AT_RISK, RiskLevel.CRITICAL])
    ).count()
    total_employees = db.query(EmployeeMetric).count()
    risk_ratio = at_risk / max(total_employees, 1)
    trend = "declining" if risk_ratio > 0.3 else ("stable" if risk_ratio > 0.15 else "improving")

    # Team-level health
    team_scores = _team_health(db)

    pillars = [
        {
            "name": "Conflict Rate",
            "score": round(conflict_score),
            "weight": WEIGHT_CONFLICT,
            "status": _status(conflict_score),
            "detail": conflict_meta,
        },
        {
            "name": "Decision Velocity",
            "score": round(decision_score),
            "weight": WEIGHT_DECISION,
            "status": _status(decision_score),
            "detail": decision_meta,
        },
        {
            "name": "Communication",
            "score": round(comms_score),
            "weight": WEIGHT_COMMS,
            "status": _status(comms_score),
            "detail": comms_meta,
        },
        {
            "name": "Knowledge Density",
            "score": round(knowledge_score),
            "weight": WEIGHT_KNOWLEDGE,
            "status": _status(knowledge_score),
            "detail": knowledge_meta,
        },
        {
            "name": "Execution Cadence",
            "score": round(execution_score),
            "weight": WEIGHT_EXECUTION,
            "status": _status(execution_score),
            "detail": execution_meta,
        },
    ]

    return {
        "overall_score": overall,
        "trend": trend,
        "computed_at": datetime.utcnow().isoformat(),
        "pillars": pillars,
        "team_scores": team_scores,
        "summary": {
            "open_conflicts": conflict_meta["open_conflicts"],
            "blocked_tickets": decision_meta["blocked_tickets"],
            "at_risk_employees": at_risk,
            "total_employees": total_employees,
        },
    }


def _status(score: float) -> str:
    if score >= 70: return "healthy"
    if score >= 50: return "moderate"
    if score >= 30: return "at_risk"
    return "critical"


def _team_health(db: Session) -> List[Dict[str, Any]]:
    """Compute per-team health from employee metrics."""
    rows = db.query(
        EmployeeMetric.team_name,
        func.avg(EmployeeMetric.overall_score).label("avg_score"),
        func.count(EmployeeMetric.id).label("headcount"),
    ).group_by(EmployeeMetric.team_name).all()

    result = []
    for row in rows:
        result.append({
            "team": row.team_name,
            "score": round(row.avg_score or 50),
            "headcount": row.headcount,
            "status": _status(row.avg_score or 50),
        })
    return sorted(result, key=lambda x: x["score"])
