"""
Employees endpoint — returns computed employee metrics from PostgreSQL.
GET /api/v1/employees
GET /api/v1/employees/{email}
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.employee_metric import EmployeeMetric, RiskLevel

router = APIRouter()


@router.get("/")
def list_employees(
    risk: Optional[str] = Query(None, description="Filter by risk level: healthy|at_risk|overloaded|critical"),
    team: Optional[str] = Query(None, description="Filter by team name"),
    sprint: int = Query(3, description="Sprint number"),
    db: Session = Depends(get_db),
):
    """Return all employee metrics for the given sprint."""
    q = db.query(EmployeeMetric).filter(EmployeeMetric.sprint == sprint)

    if risk:
        try:
            q = q.filter(EmployeeMetric.risk_level == RiskLevel(risk))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid risk level: {risk}")

    if team:
        q = q.filter(EmployeeMetric.team_name.ilike(f"%{team}%"))

    employees = q.order_by(EmployeeMetric.overall_score.desc()).all()
    return {
        "sprint": sprint,
        "count": len(employees),
        "employees": [e.to_dict() for e in employees],
    }


@router.get("/at-risk")
def get_at_risk_employees(sprint: int = 3, db: Session = Depends(get_db)):
    """Return only employees flagged as at-risk, overloaded, or critical."""
    employees = db.query(EmployeeMetric).filter(
        EmployeeMetric.sprint == sprint,
        EmployeeMetric.risk_level.in_([RiskLevel.AT_RISK, RiskLevel.OVERLOADED, RiskLevel.CRITICAL]),
    ).order_by(EmployeeMetric.overall_score.asc()).all()

    return {"count": len(employees), "employees": [e.to_dict() for e in employees]}


@router.get("/{email:path}")
def get_employee(email: str, sprint: int = 3, db: Session = Depends(get_db)):
    """Return metrics for a specific employee by email."""
    emp = db.query(EmployeeMetric).filter(
        EmployeeMetric.employee_email == email,
        EmployeeMetric.sprint == sprint,
    ).first()

    if not emp:
        raise HTTPException(status_code=404, detail=f"Employee '{email}' not found for sprint {sprint}")

    return emp.to_dict()
