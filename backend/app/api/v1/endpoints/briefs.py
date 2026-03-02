"""
Briefs endpoint — AI-generated morning/evening CTO briefs from live DB data.
GET /api/v1/briefs/morning
GET /api/v1/briefs/evening
GET /api/v1/briefs/context   — raw org context used to generate briefs (debug)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.brief_service import generate_brief, _build_context

router = APIRouter()


@router.get("/morning")
async def morning_brief(db: Session = Depends(get_db)):
    """
    Generate ARIA's morning brief for Grace Liu.
    Pulls live conflicts, blocked tickets, employee risks, and meetings from DB.
    """
    text = await generate_brief("morning", db)
    return {
        "type": "morning",
        "brief": text,
        "generated_at": __import__("datetime").datetime.utcnow().isoformat(),
    }


@router.get("/evening")
async def evening_brief(db: Session = Depends(get_db)):
    """
    Generate ARIA's evening summary brief for Grace Liu.
    """
    text = await generate_brief("evening", db)
    return {
        "type": "evening",
        "brief": text,
        "generated_at": __import__("datetime").datetime.utcnow().isoformat(),
    }


@router.get("/context")
def brief_context(db: Session = Depends(get_db)):
    """Return the raw org context used to build briefs — useful for debugging."""
    return {"context": _build_context(db)}
