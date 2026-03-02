"""
EmployeeMetric model — computed performance metrics per sprint per person.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, JSON, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

from app.db.session import Base


class RiskLevel(str, enum.Enum):
    HEALTHY = "healthy"
    AT_RISK = "at_risk"
    OVERLOADED = "overloaded"
    CRITICAL = "critical"


class EmployeeMetric(Base):
    """
    Per-sprint performance metrics for each employee.
    Computed by health_service from real ticket/event data.
    """

    __tablename__ = "employee_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Identity
    employee_name = Column(String(100), nullable=False, index=True)
    employee_email = Column(String(200), nullable=False, index=True)
    role = Column(String(100))
    team_name = Column(String(100))
    tier = Column(String(50))   # executive / vp / lead / senior / engineer

    # Sprint context
    sprint = Column(Integer, default=3)

    # Computed scores (0-100)
    overall_score = Column(Float, default=50.0)
    velocity_score = Column(Float, default=50.0)       # tickets closed per sprint vs avg
    communication_score = Column(Float, default=50.0)  # event activity, response time
    collaboration_score = Column(Float, default=50.0)  # PR reviews, cross-team touches

    # Raw metrics
    tickets_resolved = Column(Integer, default=0)
    tickets_in_progress = Column(Integer, default=0)
    tickets_blocked = Column(Integer, default=0)
    avg_close_days = Column(Float, default=0.0)
    pr_reviews = Column(Integer, default=0)
    hours_this_week = Column(Float, default=40.0)

    # Risk
    risk_level = Column(SQLEnum(RiskLevel), default=RiskLevel.HEALTHY)
    risk_reason = Column(Text)

    # Trend (JSON list of last 8 weekly scores)
    score_trend = Column(JSON, default=list)

    # Flags
    has_shadow_work = Column(String(1), default="N")
    is_burnout_risk = Column(String(1), default="N")

    # Insight (1-line AI-generated insight)
    insight = Column(Text)

    computed_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_emp_metric_sprint", "sprint", "employee_email"),
    )

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.employee_name,
            "email": self.employee_email,
            "role": self.role,
            "team": self.team_name,
            "tier": self.tier,
            "sprint": self.sprint,
            "score": round(self.overall_score or 50),
            "velocityScore": round(self.velocity_score or 50),
            "communicationScore": round(self.communication_score or 50),
            "collaborationScore": round(self.collaboration_score or 50),
            "ticketsResolved": self.tickets_resolved or 0,
            "ticketsBlocked": self.tickets_blocked or 0,
            "avgCloseTimeDays": round(self.avg_close_days or 0, 1),
            "prReviews": self.pr_reviews or 0,
            "hoursThisWeek": round(self.hours_this_week or 40, 1),
            "riskLevel": self.risk_level.value if self.risk_level else "healthy",
            "riskReason": self.risk_reason,
            "trend": self.score_trend or [],
            "hasShadowWork": self.has_shadow_work == "Y",
            "isBurnoutRisk": self.is_burnout_risk == "Y",
            "insight": self.insight,
            "computedAt": self.computed_at.isoformat() if self.computed_at else None,
        }
