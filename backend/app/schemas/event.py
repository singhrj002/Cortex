from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from uuid import UUID, uuid4

class PersonInfo(BaseModel):
    name: str
    email: EmailStr

class EventBase(BaseModel):
    source: str = Field(..., description="Source of the event (e.g., enron, upload, slack)")
    channel: str = Field(..., description="Channel type (email, doc, meeting, chat)")
    thread_id: Optional[str] = Field(None, description="Optional thread identifier for threaded communications")
    timestamp: datetime = Field(..., description="When the event occurred")
    actor: PersonInfo = Field(..., description="The person who initiated the event")
    audience: List[PersonInfo] = Field(..., description="Recipients of the communication")
    subject: Optional[str] = Field(None, description="Subject or title of the communication")
    content: str = Field(..., description="Raw text content of the communication")
    attachments: List[str] = Field(default=[], description="List of attachment references or IDs")
    metadata: Dict[str, Any] = Field(default={}, description="Additional metadata like cc, bcc, labels")

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: UUID = Field(default_factory=uuid4)
    content_hash: str = Field(..., description="Unique hash of the content to prevent duplicates")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        orm_mode = True