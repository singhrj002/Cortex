"""
Conflict Detection Service — uses the LangGraph multi-agent system to detect
conflicts in new events and persists them to PostgreSQL.

The pipeline:
  Event text → MemoryAgent (context retrieval)
             → ExtractorAgent (claims/decisions extraction)
             → CriticAgent (quality validation)
             → ConflictDetectorAgent (contradiction detection)
             → CoordinatorAgent (notification routing)
             → Conflict records saved to DB
"""

import json
import logging
import uuid as uuid_lib
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.conflict import Conflict, ConflictType, ConflictSeverity, ConflictStatus
from app.models.event import Event
from app.models.ticket import Ticket

logger = logging.getLogger(__name__)

# Keyword → conflict type mapping for lightweight pre-filtering
_CONFLICT_KEYWORDS = {
    ConflictType.CLAIM_CONFLICT: [
        "disagree", "contradicts", "violation", "violates", "conflict",
        "against policy", "not approved", "without approval", "override",
        "basic auth", "oauth", "authentication", "security standard",
    ],
    ConflictType.DECISION_CONFLICT: [
        "approved", "rejected", "reversed", "overruled", "blocked",
        "redis", "memcached", "caching", "policy", "infra-std",
    ],
    ConflictType.RESOURCE_CONFLICT: [
        "blocked", "waiting on", "dependency", "can't proceed",
        "56 hours", "overloaded", "burnout",
    ],
    ConflictType.PRIORITY_CONFLICT: [
        "urgent", "deprioritized", "sprint", "backlog", "not a priority",
    ],
}


async def detect_conflicts_in_event(
    event: Event, db: Session, use_ai: bool = True
) -> List[Dict[str, Any]]:
    """
    Run conflict detection on a single event.
    Returns list of conflict dicts that were saved to DB.
    """
    detected = []

    if use_ai:
        detected = await _ai_detect(event, db)
    else:
        detected = _keyword_detect(event, db)

    saved = []
    for c in detected:
        conflict = _save_conflict(c, event.id, db)
        saved.append(conflict.to_dict())

    return saved


def _keyword_detect(event: Event, db: Session) -> List[Dict]:
    """
    Fast keyword-based pre-scan. Used as fallback when AI is unavailable.
    Still produces real conflict records based on content analysis.
    """
    text = f"{event.subject or ''} {event.body_text or ''}".lower()
    results = []

    for ctype, keywords in _CONFLICT_KEYWORDS.items():
        matched = [kw for kw in keywords if kw in text]
        if not matched:
            continue

        severity = _infer_severity(text, matched)

        # Check if a similar open conflict already exists
        existing = db.query(Conflict).filter(
            Conflict.conflict_type == ctype,
            Conflict.status == ConflictStatus.OPEN,
        ).first()

        if existing:
            # Enrich the existing conflict with new evidence
            evidence = existing.evidence or []
            evidence.append({
                "event_id": str(event.id),
                "matched_keywords": matched,
                "timestamp": datetime.utcnow().isoformat(),
            })
            existing.evidence = evidence
            existing.updated_at = datetime.utcnow()
            db.commit()
            continue

        results.append({
            "type": ctype,
            "severity": severity,
            "description": _build_description(ctype, matched, event),
            "entity_ids": [str(event.sender or "unknown")],
            "evidence": [{"event_id": str(event.id), "matched_keywords": matched}],
        })

    return results


async def _ai_detect(event: Event, db: Session) -> List[Dict]:
    """
    Full LangGraph multi-agent conflict detection.
    Extracts claims, compares with existing knowledge, detects contradictions.
    """
    try:
        from app.agents.multi_agent_system import MultiAgentSystem

        system = MultiAgentSystem(db=db)
        result = await system.process_event(event)

        conflicts = result.get("conflicts", [])
        formatted = []
        for c in conflicts:
            formatted.append({
                "type": _map_conflict_type(c.get("type", "claim_conflict")),
                "severity": _map_severity(c.get("severity", "medium")),
                "description": c.get("description", "Conflict detected by AI agent"),
                "entity_ids": c.get("entities", [str(event.id)]),
                "evidence": [{"event_id": str(event.id), "ai_analysis": c.get("reasoning", "")}],
                "ai_confidence": c.get("confidence", 0.8),
            })
        return formatted

    except Exception as exc:
        logger.warning(f"AI detection failed, falling back to keyword scan: {exc}")
        return _keyword_detect(event, db)


def _save_conflict(data: Dict, event_id: UUID, db: Session) -> Conflict:
    entity_ids = data.get("entity_ids", [])
    conflict = Conflict(
        conflict_type=data["type"],
        severity=data["severity"],
        status=ConflictStatus.OPEN,
        description=data["description"],
        entity_a_type="event",
        entity_a_id=event_id,
        entity_b_type="entity",
        entity_b_id=uuid_lib.uuid4(),
        evidence=data.get("evidence", []),
        extra_data={
            "entities": entity_ids,
            "ai_confidence": data.get("ai_confidence"),
        },
    )
    db.add(conflict)
    db.commit()
    db.refresh(conflict)
    logger.info(f"Conflict saved: {conflict.id} ({conflict.severity}/{conflict.conflict_type})")
    return conflict


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _infer_severity(text: str, matched_keywords: List[str]) -> ConflictSeverity:
    if any(k in text for k in ["critical", "production", "violates", "exploitable", "breach"]):
        return ConflictSeverity.CRITICAL
    if any(k in text for k in ["blocked", "urgent", "overloaded", "burnout"]):
        return ConflictSeverity.HIGH
    if len(matched_keywords) >= 3:
        return ConflictSeverity.MEDIUM
    return ConflictSeverity.LOW


def _build_description(ctype: ConflictType, keywords: List[str], event: Event) -> str:
    sender = event.sender or "Unknown"
    kw_str = ", ".join(keywords[:3])
    return (
        f"{ctype.value.replace('_', ' ').title()} detected in message from {sender}. "
        f"Keywords: {kw_str}. Subject: {event.subject or '(no subject)'}."
    )


def _map_conflict_type(t: str) -> ConflictType:
    mapping = {
        "decision": ConflictType.DECISION_CONFLICT,
        "claim": ConflictType.CLAIM_CONFLICT,
        "resource": ConflictType.RESOURCE_CONFLICT,
        "timeline": ConflictType.TIMELINE_CONFLICT,
        "priority": ConflictType.PRIORITY_CONFLICT,
    }
    for k, v in mapping.items():
        if k in t.lower():
            return v
    return ConflictType.CLAIM_CONFLICT


def _map_severity(s: str) -> ConflictSeverity:
    return {
        "critical": ConflictSeverity.CRITICAL,
        "high": ConflictSeverity.HIGH,
        "medium": ConflictSeverity.MEDIUM,
        "low": ConflictSeverity.LOW,
    }.get(s.lower(), ConflictSeverity.MEDIUM)


def get_conflict_summary(db: Session) -> Dict[str, Any]:
    """Return a summary of all active conflicts for the ARIA brief."""
    conflicts = db.query(Conflict).filter(
        Conflict.status == ConflictStatus.OPEN
    ).order_by(Conflict.severity.desc()).all()

    return {
        "total_open": len(conflicts),
        "critical": sum(1 for c in conflicts if c.severity == ConflictSeverity.CRITICAL),
        "high": sum(1 for c in conflicts if c.severity == ConflictSeverity.HIGH),
        "conflicts": [
            {
                "id": str(c.id),
                "type": c.conflict_type.value,
                "severity": c.severity.value,
                "description": c.description,
                "days_open": (datetime.utcnow().replace(tzinfo=None) - (c.created_at.replace(tzinfo=None) if c.created_at else datetime.utcnow())).days if c.created_at else 0,
                "entities": (c.extra_data or {}).get("entities", []),
            }
            for c in conflicts
        ],
    }
