"""
Simple graph API that builds graph from PostgreSQL data.
No Neo4j required - just queries the relational database.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.extraction import Decision, Task, Claim
from app.models.person import Person, Team
from app.models.event import Event

router = APIRouter()


@router.get("/from-db")
async def get_graph_from_db(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Build graph from PostgreSQL data.
    Returns nodes and edges for visualization.

    Returns:
        {
            "nodes": [{"id": "...", "type": "...", "label": "...", "properties": {...}}],
            "edges": [{"source": "...", "target": "...", "relationship": "..."}]
        }
    """
    try:
        nodes = []
        edges = []

        # Fetch all teams
        teams = db.query(Team).limit(limit).all()
        for team in teams:
            nodes.append({
                "id": f"team_{team.id}",
                "type": "Team",
                "label": team.name,
                "properties": {
                    "name": team.name,
                    "description": team.description
                }
            })
            
        # Fetch all persons
        persons = db.query(Person).limit(limit).all()
        for person in persons:
            nodes.append({
                "id": f"person_{person.id}",
                "type": "Person",
                "label": person.name or person.email,
                "properties": {
                    "email": person.email,
                    "name": person.name,
                    "event_count": person.event_count
                }
            })
            
            # Create edge: Person -> Team (membership)
            if person.team_id:
                edges.append({
                    "source": f"person_{person.id}",
                    "target": f"team_{person.team_id}",
                    "relationship": "MEMBER_OF"
                })

        # Fetch all decisions
        decisions = db.query(Decision).limit(limit).all()
        for decision in decisions:
            nodes.append({
                "id": f"decision_{decision.id}",
                "type": "Decision",
                "label": decision.title,
                "properties": {
                    "title": decision.title,
                    "status": decision.status.value if decision.status else "proposed",
                    "confidence": decision.confidence
                }
            })

            # Create edge: Person -> Decision (ownership)
            if decision.owner_id:
                edges.append({
                    "source": f"person_{decision.owner_id}",
                    "target": f"decision_{decision.id}",
                    "relationship": "owns"
                })

        # Fetch all tasks
        tasks = db.query(Task).limit(limit).all()
        for task in tasks:
            nodes.append({
                "id": f"task_{task.id}",
                "type": "Task",
                "label": task.title,
                "properties": {
                    "title": task.title,
                    "status": task.status or "open",
                    "priority": task.priority or "normal"
                }
            })

            # Create edge: Person -> Task (assignment)
            if task.assignee_id:
                edges.append({
                    "source": f"person_{task.assignee_id}",
                    "target": f"task_{task.id}",
                    "relationship": "assigned to"
                })

        # Fetch all claims
        claims = db.query(Claim).limit(limit).all()
        for claim in claims:
            # Truncate claim text for label
            label = claim.text[:50] + "..." if len(claim.text) > 50 else claim.text

            nodes.append({
                "id": f"claim_{claim.id}",
                "type": "Claim",
                "label": label,
                "properties": {
                    "text": claim.text,
                    "polarity": claim.polarity or "neutral",
                    "confidence": claim.confidence
                }
            })

            # Create edge: Person -> Claim (claimant)
            if claim.claimant_id:
                edges.append({
                    "source": f"person_{claim.claimant_id}",
                    "target": f"claim_{claim.id}",
                    "relationship": "claims"
                })

        return {
            "nodes": nodes,
            "edges": edges,
            "stats": {
                "total_nodes": len(nodes),
                "total_edges": len(edges),
                "persons": len(persons),
                "teams": len(teams),
                "decisions": len(decisions),
                "tasks": len(tasks),
                "claims": len(claims)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build graph: {str(e)}")
