from fastapi import APIRouter

from app.api.v1.endpoints import (
    events,
    topics,
    decisions,
    graph,
    simple_graph,
    notifications,
    websocket,
    org_health,
    employees,
    conflicts_api,
    tickets_api,
    briefs,
)

api_router = APIRouter()

# ── Existing endpoints ────────────────────────────────────────────────────────
api_router.include_router(events.router,       prefix="/events",       tags=["events"])
api_router.include_router(topics.router,       prefix="/topics",       tags=["topics"])
api_router.include_router(decisions.router,    prefix="/decisions",    tags=["decisions"])
api_router.include_router(graph.router,        prefix="/graph",        tags=["graph"])
api_router.include_router(simple_graph.router, prefix="/simple-graph", tags=["simple-graph"])
api_router.include_router(notifications.router,prefix="/notifications",tags=["notifications"])
api_router.include_router(websocket.router,    tags=["websocket"])

# ── New intelligence endpoints ────────────────────────────────────────────────
api_router.include_router(org_health.router,   prefix="/org-health",   tags=["org-health"])
api_router.include_router(employees.router,    prefix="/employees",    tags=["employees"])
api_router.include_router(conflicts_api.router,prefix="/conflicts",    tags=["conflicts"])
api_router.include_router(tickets_api.router,  prefix="/tickets",      tags=["tickets"])
api_router.include_router(briefs.router,       prefix="/briefs",       tags=["briefs"])
