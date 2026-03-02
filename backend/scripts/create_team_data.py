#!/usr/bin/env python
"""
Create demo team data for the graph visualization.

This script creates:
1. Three teams: Backend Team, Infra Team, Product Team
2. Three people: Alice, Bob, Carol
3. Assigns each person to a team (member_of relationship)

Run this script to populate the database with sample team structure.
"""

import sys
import os
from datetime import datetime
import uuid
from sqlalchemy import select

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import SessionLocal
from app.models.person import Person, Team
from app.services.graph_service import GraphService
from app.models.graph_schema import NodeType, RelationshipType


def create_teams_and_members():
    """Create teams and members with relationships."""
    db = SessionLocal()
    graph_service = GraphService()
    
    try:
        # Create Teams
        teams = {
            "backend": Team(
                id=uuid.uuid4(),
                name="Backend Team",
                description="Handles server-side development and APIs"
            ),
            "infra": Team(
                id=uuid.uuid4(),
                name="Infra Team",
                description="Manages infrastructure and DevOps"
            ),
            "product": Team(
                id=uuid.uuid4(),
                name="Product Team",
                description="Handles product design and management"
            )
        }
        
        # Add teams to db
        for team in teams.values():
            existing = db.query(Team).filter(Team.name == team.name).first()
            if not existing:
                db.add(team)
                print(f"Added team: {team.name}")
            else:
                print(f"Team {team.name} already exists")
                teams[team.name.lower().split()[0]] = existing
        
        db.commit()
        
        # Create People
        now = datetime.utcnow()
        people = {
            "alice": Person(
                id=uuid.uuid4(),
                email="alice@example.com",
                name="Alice Chen",
                team_id=teams["backend"].id,
                first_seen=now,
                last_seen=now
            ),
            "bob": Person(
                id=uuid.uuid4(),
                email="bob@example.com",
                name="Bob Smith", 
                team_id=teams["infra"].id,
                first_seen=now,
                last_seen=now
            ),
            "carol": Person(
                id=uuid.uuid4(),
                email="carol@example.com",
                name="Carol Jones",
                team_id=teams["product"].id,
                first_seen=now,
                last_seen=now
            )
        }
        
        # Add people to db
        for person in people.values():
            existing = db.query(Person).filter(Person.email == person.email).first()
            if not existing:
                db.add(person)
                print(f"Added person: {person.name}")
            else:
                print(f"Person {person.name} already exists")
                # Update team if needed
                if existing.team_id != person.team_id:
                    existing.team_id = person.team_id
                    db.add(existing)
                    print(f"Updated {existing.name}'s team")
                people[person.name.lower().split()[0]] = existing
        
        db.commit()
        
        # Also create explicit Neo4j relationships for the graph visualization
        # This ensures the graph shows relationships even if the simple_graph endpoint isn't used
        for person_key, team_name in [
            ("alice", "backend"), 
            ("bob", "infra"), 
            ("carol", "product")
        ]:
            person = people[person_key]
            team = teams[team_name]
            
            # Create person node in Neo4j
            person_node = graph_service.create_node(
                NodeType.PERSON,
                {
                    "id": str(person.id),
                    "name": person.name,
                    "email": person.email
                }
            )
            
            # Create team node in Neo4j
            team_node = graph_service.create_node(
                NodeType.TEAM,
                {
                    "id": str(team.id),
                    "name": team.name,
                    "description": team.description
                }
            )
            
            # Create MEMBER_OF relationship
            if person_node and team_node:
                graph_service.create_relationship(
                    str(person.id),
                    str(team.id),
                    RelationshipType.MEMBER_OF
                )
                print(f"Created relationship: {person.name} MEMBER_OF {team.name}")
                
        print("Team data creation completed!")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating team data: {e}")
        raise
    
    finally:
        db.close()


if __name__ == "__main__":
    create_teams_and_members()