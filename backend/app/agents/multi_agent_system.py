"""
Complete multi-agent system for knowledge extraction.
Includes Archivist, Analyst, Auditor, Inspector, Director, and Briefer agents.
"""

import json
import logging
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.agents.base_agent import BaseAgent
from app.models.extraction import Decision, Task, Claim
from app.models.person import Person
from app.models.topic import Topic
from app.prompts.extraction_prompts import get_extraction_messages

logger = logging.getLogger(__name__)


class ArchivistAgent(BaseAgent):
    """Retrieves relevant context from database and graph."""

    def __init__(self, db: Session):
        super().__init__(
            name="Archivist",
            role="organizational knowledge and context retrieval specialist",
            temperature=0.0
        )
        self.db = db

    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Retrieve relevant context for the event."""
        self.log("Retrieving context...")

        event_data = state.get("event_data", {})
        sender = event_data.get("sender", "")

        context = {
            "sender_history": self._get_person_history(sender),
            "recent_decisions": self._get_recent_decisions(limit=5),
            "recent_topics": self._get_recent_topics(limit=10),
        }

        state["context"] = context
        state["agent_outputs"]["archivist"] = {
            "agent_name": "Archivist",
            "status": "success",
            "data": context,
            "reasoning": f"Retrieved context for sender {sender}",
            "confidence": 1.0
        }

        self.log(f"Context retrieved: {len(context.get('recent_decisions', []))} decisions, {len(context.get('recent_topics', []))} topics")
        return state

    def _get_person_history(self, email: str) -> Dict:
        """Get person's past activity."""
        person = self.db.query(Person).filter(Person.email == email).first()
        if not person:
            return {}

        return {
            "email": person.email,
            "name": person.name,
            "event_count": person.event_count,
            "first_seen": person.first_seen.isoformat() if person.first_seen else None,
        }

    def _get_recent_decisions(self, limit: int = 5) -> list:
        """Get recent decisions for context."""
        decisions = self.db.query(Decision).order_by(Decision.created_at.desc()).limit(limit).all()
        return [{"key": d.decision_key, "title": d.title, "status": d.status.value} for d in decisions]

    def _get_recent_topics(self, limit: int = 10) -> list:
        """Get trending topics."""
        topics = self.db.query(Topic).order_by(Topic.mention_count.desc()).limit(limit).all()
        return [{"name": t.name, "mention_count": t.mention_count} for t in topics]


class AnalystAgent(BaseAgent):
    """Enhanced extraction with context awareness."""

    def __init__(self):
        super().__init__(
            name="Analyst",
            role="intelligence extraction and knowledge structuring specialist",
            temperature=0.1
        )

    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Extract knowledge using context from Archivist."""
        self.log("Extracting knowledge with context...")

        event_data = state.get("event_data", {})
        context = state.get("context", {})

        # Build enhanced prompt with context
        messages = self._build_extraction_messages(event_data, context)

        # Call LLM
        response = self.call_llm(messages, response_format={"type": "json_object"})
        extraction_result = json.loads(response)

        state["extractions"] = extraction_result
        state["agent_outputs"]["analyst"] = {
            "agent_name": "Analyst",
            "status": "success",
            "data": extraction_result,
            "reasoning": "Extracted knowledge with contextual awareness",
            "confidence": self._calculate_avg_confidence(extraction_result)
        }

        self.log(f"Extracted: {len(extraction_result.get('decisions', []))} decisions, "
                f"{len(extraction_result.get('tasks', []))} tasks, "
                f"{len(extraction_result.get('claims', []))} claims")
        return state

    def _build_extraction_messages(self, event_data: Dict, context: Dict) -> list:
        """Build messages with context."""
        base_messages = get_extraction_messages(
            sender=event_data.get("sender", ""),
            recipients=event_data.get("recipients", []),
            subject=event_data.get("subject", ""),
            timestamp=event_data.get("timestamp", ""),
            body=event_data.get("body", "")
        )

        # Enhance system prompt with context
        context_addition = f"\n\nContext: Recent topics: {context.get('recent_topics', [])}. Use this to better categorize content."
        base_messages[0]["content"] += context_addition

        return base_messages

    def _calculate_avg_confidence(self, result: Dict) -> float:
        """Calculate average confidence across all extractions."""
        confidences = []
        for category in ["decisions", "tasks", "claims"]:
            for item in result.get(category, []):
                confidences.append(item.get("confidence", 0.5))
        return sum(confidences) / len(confidences) if confidences else 0.5


class AuditorAgent(BaseAgent):
    """Validates extraction quality and adjusts confidence scores."""

    def __init__(self):
        super().__init__(
            name="Auditor",
            role="quality assurance and compliance specialist for knowledge extraction",
            temperature=0.0
        )

    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Review and validate extractions."""
        self.log("Validating extraction quality...")

        extractions = state.get("extractions", {})

        critique = {
            "overall_quality": "good",
            "issues": [],
            "adjustments": [],
            "validated_count": 0,
            "flagged_count": 0
        }

        # Validate decisions
        for decision in extractions.get("decisions", []):
            if decision.get("confidence", 0) < 0.4:
                critique["issues"].append(f"Low confidence decision: {decision.get('title')}")
                critique["flagged_count"] += 1
            else:
                critique["validated_count"] += 1

        # Validate tasks
        for task in extractions.get("tasks", []):
            if not task.get("assignee_email"):
                critique["issues"].append(f"Task missing assignee: {task.get('title')}")
                critique["flagged_count"] += 1
            else:
                critique["validated_count"] += 1

        critique["overall_quality"] = "good" if critique["flagged_count"] < 2 else "needs_review"

        state["critique"] = critique
        state["agent_outputs"]["auditor"] = {
            "agent_name": "Auditor",
            "status": "success",
            "data": critique,
            "reasoning": f"Validated {critique['validated_count']} items, flagged {critique['flagged_count']}",
            "confidence": 1.0 - (critique["flagged_count"] * 0.1)
        }

        self.log(f"Audit complete: {critique['overall_quality']}, {len(critique['issues'])} issues")
        return state


class InspectorAgent(BaseAgent):
    """Detects contradictions and conflicts in knowledge."""

    def __init__(self, db: Session):
        super().__init__(
            name="Inspector",
            role="contradiction, conflict, and compliance violation detection specialist",
            temperature=0.0
        )
        self.db = db

    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Detect conflicts in extracted knowledge."""
        self.log("Detecting conflicts...")

        extractions = state.get("extractions", {})
        conflicts = []

        # Check for contradicting claims
        new_claims = extractions.get("claims", [])
        existing_claims = self.db.query(Claim).limit(50).all()

        for new_claim in new_claims:
            for existing_claim in existing_claims:
                if self._are_contradictory(new_claim["text"], existing_claim.text):
                    conflicts.append({
                        "type": "claim_conflict",
                        "severity": "medium",
                        "description": f"New claim contradicts existing: {existing_claim.text[:100]}",
                        "evidence": {
                            "new": new_claim["text"],
                            "existing": existing_claim.text
                        }
                    })

        state["conflicts"] = conflicts
        state["agent_outputs"]["inspector"] = {
            "agent_name": "Inspector",
            "status": "success",
            "data": {"conflicts_found": len(conflicts)},
            "reasoning": f"Detected {len(conflicts)} potential conflicts",
            "confidence": 0.8 if conflicts else 1.0
        }

        self.log(f"Detected {len(conflicts)} conflicts")
        return state

    def _are_contradictory(self, text1: str, text2: str) -> bool:
        """Simple contradiction detection (can be enhanced with LLM)."""
        # Basic heuristic: check for negation patterns
        negation_words = ["not", "no", "never", "neither", "n't"]
        text1_lower = text1.lower()
        text2_lower = text2.lower()

        # If texts are very similar but one has negation, might be contradiction
        similarity = len(set(text1_lower.split()) & set(text2_lower.split())) / max(len(text1_lower.split()), 1)

        has_negation_diff = (
            any(neg in text1_lower for neg in negation_words) !=
            any(neg in text2_lower for neg in negation_words)
        )

        return similarity > 0.5 and has_negation_diff


class DirectorAgent(BaseAgent):
    """Orchestrates workflow and determines routing."""

    def __init__(self):
        super().__init__(
            name="Director",
            role="workflow orchestration, stakeholder routing, and escalation specialist",
            temperature=0.0
        )

    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate workflow and determine routing."""
        self.log("Coordinating workflow and routing...")

        extractions = state.get("extractions", {})
        conflicts = state.get("conflicts", [])
        critique = state.get("critique", {})

        # Determine who needs to be notified
        notify_list = []

        # Notify decision owners
        for decision in extractions.get("decisions", []):
            if decision.get("owner_email"):
                notify_list.append({
                    "email": decision["owner_email"],
                    "reason": f"Decision created: {decision['title']}",
                    "priority": "high" if decision.get("confidence", 0) > 0.8 else "normal"
                })

        # Notify task assignees
        for task in extractions.get("tasks", []):
            if task.get("assignee_email"):
                notify_list.append({
                    "email": task["assignee_email"],
                    "reason": f"Task assigned: {task['title']}",
                    "priority": task.get("priority", "normal")
                })

        # Escalate conflicts
        for conflict in conflicts:
            if conflict.get("severity") == "high":
                notify_list.append({
                    "email": "admin@company.com",  # Would be configurable
                    "reason": f"High-severity conflict detected",
                    "priority": "urgent"
                })

        routing = {
            "notify": notify_list,
            "escalate": len([c for c in conflicts if c.get("severity") == "high"]) > 0,
            "requires_review": critique.get("overall_quality") == "needs_review"
        }

        state["routing"] = routing
        state["agent_outputs"]["director"] = {
            "agent_name": "Director",
            "status": "success",
            "data": routing,
            "reasoning": f"Determined routing for {len(notify_list)} recipients",
            "confidence": 1.0
        }

        self.log(f"Routing determined: {len(notify_list)} notifications")
        return state


class BrieferAgent(BaseAgent):
    """Generates summaries for notifications and reports."""

    def __init__(self):
        super().__init__(
            name="Briefer",
            role="executive summary and briefing generation specialist",
            temperature=0.3
        )

    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Generate summaries of extractions."""
        self.log("Generating executive brief...")

        extractions = state.get("extractions", {})

        summary = {
            "headline": self._generate_headline(extractions),
            "key_points": self._generate_key_points(extractions),
            "action_items": self._generate_action_items(extractions)
        }

        state["agent_outputs"]["briefer"] = {
            "agent_name": "Briefer",
            "status": "success",
            "data": summary,
            "reasoning": "Generated executive brief",
            "confidence": 1.0
        }

        self.log("Executive brief generated")
        return state

    def _generate_headline(self, extractions: Dict) -> str:
        """Generate headline summary."""
        decision_count = len(extractions.get("decisions", []))
        task_count = len(extractions.get("tasks", []))

        if decision_count > 0:
            return f"{decision_count} decision(s) and {task_count} task(s) identified"
        elif task_count > 0:
            return f"{task_count} task(s) identified"
        else:
            return "Communication processed, no major decisions or tasks"

    def _generate_key_points(self, extractions: Dict) -> list:
        """Generate key points."""
        points = []

        for decision in extractions.get("decisions", []):
            points.append(f"Decision: {decision.get('title')}")

        for task in extractions.get("tasks", [])[:3]:  # Top 3 tasks
            points.append(f"Task: {task.get('title')}")

        return points[:5]  # Max 5 key points

    def _generate_action_items(self, extractions: Dict) -> list:
        """Generate action items."""
        return [
            f"{task.get('assignee_email', 'Unassigned')}: {task.get('title')}"
            for task in extractions.get("tasks", [])
        ]


# Backwards-compatible aliases (used by existing imports)
MemoryAgent = ArchivistAgent
ExtractorAgent = AnalystAgent
CriticAgent = AuditorAgent
ConflictDetectorAgent = InspectorAgent
CoordinatorAgent = DirectorAgent
SummarizerAgent = BrieferAgent
