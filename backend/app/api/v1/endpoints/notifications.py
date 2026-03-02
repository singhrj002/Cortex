"""
Notification API endpoints.
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.services.notification_service import NotificationService
from app.models.notification import Notification

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[dict])
async def get_notifications(
    user_email: str = Query(..., description="User email"),
    unread_only: bool = Query(False, description="Only return unread notifications"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of notifications"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db)
):
    """
    Get notifications for a user.

    Args:
        user_email: User email
        unread_only: Only return unread notifications
        limit: Maximum number of notifications (1-100)
        offset: Pagination offset
        db: Database session

    Returns:
        List of notifications
    """
    notification_service = NotificationService(db)

    notifications = await notification_service.get_user_notifications(
        user_email=user_email,
        unread_only=unread_only,
        limit=limit,
        offset=offset
    )

    return [n.to_dict() for n in notifications]


@router.get("/unread-count")
async def get_unread_count(
    user_email: str = Query(..., description="User email"),
    db: Session = Depends(get_db)
):
    """
    Get count of unread notifications for a user.

    Args:
        user_email: User email
        db: Database session

    Returns:
        Unread notification count
    """
    notification_service = NotificationService(db)

    count = await notification_service.get_unread_count(user_email=user_email)

    return {"user_email": user_email, "unread_count": count}


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: UUID,
    user_email: str = Query(..., description="User email for verification"),
    db: Session = Depends(get_db)
):
    """
    Mark a notification as read.

    Args:
        notification_id: Notification UUID
        user_email: User email (for verification)
        db: Database session

    Returns:
        Updated notification
    """
    notification_service = NotificationService(db)

    notification = await notification_service.mark_as_read(
        notification_id=notification_id,
        user_email=user_email
    )

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found or not owned by user")

    return notification.to_dict()


@router.post("/mark-all-read")
async def mark_all_notifications_read(
    user_email: str = Query(..., description="User email"),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read for a user.

    Args:
        user_email: User email
        db: Database session

    Returns:
        Number of notifications marked as read
    """
    from datetime import datetime

    # Get all unread notifications
    notifications = db.query(Notification).filter(
        Notification.recipient_email == user_email,
        Notification.is_read == False,
        Notification.is_dismissed == False
    ).all()

    count = len(notifications)

    # Mark all as read
    for notification in notifications:
        notification.is_read = True
        notification.read_at = datetime.utcnow()

    db.commit()

    logger.info(f"[Notifications] Marked {count} notifications as read for {user_email}")

    return {"user_email": user_email, "marked_read": count}


@router.delete("/{notification_id}")
async def dismiss_notification(
    notification_id: UUID,
    user_email: str = Query(..., description="User email for verification"),
    db: Session = Depends(get_db)
):
    """
    Dismiss a notification.

    Args:
        notification_id: Notification UUID
        user_email: User email (for verification)
        db: Database session

    Returns:
        Success status
    """
    notification_service = NotificationService(db)

    success = await notification_service.dismiss_notification(
        notification_id=notification_id,
        user_email=user_email
    )

    if not success:
        raise HTTPException(status_code=404, detail="Notification not found or not owned by user")

    return {"status": "dismissed", "notification_id": str(notification_id)}


@router.get("/{notification_id}")
async def get_notification(
    notification_id: UUID,
    user_email: str = Query(..., description="User email for verification"),
    db: Session = Depends(get_db)
):
    """
    Get a specific notification.

    Args:
        notification_id: Notification UUID
        user_email: User email (for verification)
        db: Database session

    Returns:
        Notification details
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.recipient_email == user_email
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found or not owned by user")

    return notification.to_dict()


@router.get("/by-type/{notification_type}")
async def get_notifications_by_type(
    notification_type: str,
    user_email: str = Query(..., description="User email"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get notifications of a specific type for a user.

    Args:
        notification_type: Notification type (decision, task, claim, conflict)
        user_email: User email
        limit: Maximum number of notifications
        db: Database session

    Returns:
        List of notifications of specified type
    """
    notifications = db.query(Notification).filter(
        Notification.recipient_email == user_email,
        Notification.notification_type == notification_type,
        Notification.is_dismissed == False
    ).order_by(Notification.created_at.desc()).limit(limit).all()

    return [n.to_dict() for n in notifications]
