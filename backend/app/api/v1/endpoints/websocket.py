"""
WebSocket endpoint for real-time notifications.
"""

import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.websocket import websocket_manager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    user_email: str = Query(..., description="User email for authentication")
):
    """
    WebSocket endpoint for real-time notifications.

    Args:
        websocket: WebSocket connection
        user_email: User email (passed as query parameter)

    Example client connection:
        ws://localhost:8000/api/v1/ws?user_email=user@example.com
    """
    await websocket_manager.connect(websocket, user_email)

    try:
        # Keep connection alive and listen for client messages
        while True:
            # Receive messages from client (ping/pong, acknowledgments, etc.)
            data = await websocket.receive_text()

            # Handle client messages
            if data == "ping":
                await websocket.send_text("pong")
            else:
                logger.debug(f"[WebSocket] Received from {user_email}: {data}")

    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, user_email)
        logger.info(f"[WebSocket] User {user_email} disconnected normally")
    except Exception as e:
        logger.error(f"[WebSocket] Error for {user_email}: {e}")
        websocket_manager.disconnect(websocket, user_email)


@router.get("/ws/stats")
async def websocket_stats():
    """
    Get WebSocket connection statistics.

    Returns:
        Connection statistics
    """
    return {
        "total_connections": websocket_manager.get_connection_count(),
        "connected_users": websocket_manager.get_connected_users(),
        "user_count": len(websocket_manager.get_connected_users())
    }
