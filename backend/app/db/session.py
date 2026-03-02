from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# Import configurations
from app.core.config import settings

# Create SQLAlchemy engine
engine = create_engine(str(settings.DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """
    Dependency for getting DB session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import all models here to ensure they're registered with SQLAlchemy
# This must be done after Base is defined
from app.models import (  # noqa: E402, F401
    Event,
    Person,
    Team,
    Decision,
    Task,
    Claim,
    Conflict,
    Topic,
    TopicAssociation,
)
# New models — must be imported here so Base.metadata creates their tables
from app.models.ticket import Ticket  # noqa: F401
from app.models.employee_metric import EmployeeMetric  # noqa: F401