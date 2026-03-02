"""
WebSocket manager for real-time notifications.
Handles WebSocket connections, broadcasting, and delivery tracking.
"""

import logging
import json
from typing import Dict, Set
from fastapi import WebSocket
from datetime import datetime

logger = logging.getLogger(__name__)


class WebSocketManager:
    """
    Manages WebSocket connections for real-time notifications.

    Maintains active connections per user and handles broadcasting.
    """

    def __init__(self):
        """Initialize WebSocket manager."""
        # Map of user_email -> Set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_email: str):
        """
        Accept a WebSocket connection.

        Args:
            websocket: WebSocket connection
            user_email: User email identifier
        """
        await websocket.accept()

        if user_email not in self.active_connections:
            self.active_connections[user_email] = set()

        self.active_connections[user_email].add(websocket)
        logger.info(f"[WebSocket] User {user_email} connected. Total connections: {len(self.active_connections[user_email])}")

        # Send welcome message
        await self.send_personal_message(
            message={"type": "connection", "status": "connected", "timestamp": datetime.utcnow().isoformat()},
            user_email=user_email
        )

    def disconnect(self, websocket: WebSocket, user_email: str):
        """
        Remove a WebSocket connection.

        Args:
            websocket: WebSocket connection
            user_email: User email identifier
        """
        if user_email in self.active_connections:
            self.active_connections[user_email].discard(websocket)

            if not self.active_connections[user_email]:
                del self.active_connections[user_email]

            logger.info(f"[WebSocket] User {user_email} disconnected. Remaining connections: {len(self.active_connections.get(user_email, []))}")

    async def send_personal_message(self, message: dict, user_email: str):
        """
        Send message to all connections for a specific user.

        Args:
            message: Message dictionary to send
            user_email: User email identifier
        """
        if user_email not in self.active_connections:
            logger.debug(f"[WebSocket] No active connections for {user_email}")
            return

        connections = list(self.active_connections[user_email])
        disconnected = []

        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"[WebSocket] Error sending to {user_email}: {e}")
                disconnected.append(connection)

        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection, user_email)

    async def broadcast_notification(self, notification_dict: dict, user_email: str):
        """
        Broadcast notification to user.

        Args:
            notification_dict: Notification data
            user_email: Recipient email
        """
        message = {
            "type": "notification",
            "data": notification_dict,
            "timestamp": datetime.utcnow().isoformat()
        }

        await self.send_personal_message(message, user_email)
        logger.info(f"[WebSocket] Broadcasted notification {notification_dict.get('id')} to {user_email}")

    async def broadcast_update(self, update_type: str, data: dict, user_email: str):
        """
        Broadcast general update to user.

        Args:
            update_type: Type of update (extraction_complete, conflict_detected, etc.)
            data: Update data
            user_email: Recipient email
        """
        message = {
            "type": update_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }

        await self.send_personal_message(message, user_email)

    def get_connection_count(self) -> int:
        """
        Get total number of active connections.

        Returns:
            Total connection count
        """
        return sum(len(connections) for connections in self.active_connections.values())

    def get_user_connection_count(self, user_email: str) -> int:
        """
        Get number of active connections for a user.

        Args:
            user_email: User email

        Returns:
            Connection count for user
        """
        return len(self.active_connections.get(user_email, set()))

    def get_connected_users(self) -> list:
        """
        Get list of users with active connections.

        Returns:
            List of user emails
        """
        return list(self.active_connections.keys())


# Global WebSocket manager instance
websocket_manager = WebSocketManager()
