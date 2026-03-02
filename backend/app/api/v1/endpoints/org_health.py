"""
Org Health endpoint — returns dynamically computed health score from live DB.
GET /api/v1/org-health
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.health_service import compute_org_health

router = APIRouter()


@router.get("/")
def get_org_health(db: Session = Depends(get_db)):
    """
    Compute and return the live org health score.
    All numbers are derived from real PostgreSQL data — conflicts, tickets, employees.
    """
    return compute_org_health(db)
