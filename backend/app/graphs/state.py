"""
State management for LangGraph multi-agent workflow.
Defines the shared state structure passed between agents.
"""

from typing import TypedDict, List, Dict, Optional, Any


class ExtractionState(TypedDict, total=False):
    """
    Shared state for the extraction workflow.

    This state is passed between agents and updated by each one.
    TypedDict with total=False allows optional fields.
    """

    # Input data
    event_id: str
    event_data: Dict[str, Any]  # Event details (sender, subject, body, etc.)

    # Context from Memory Agent
    context: Dict[str, Any]  # Relevant history, related entities, past decisions

    # Extractions from Extractor Agent
    extractions: Dict[str, List[Dict]]  # decisions, tasks, claims, topics

    # Quality assessment from Critic Agent
    critique: Dict[str, Any]  # validation results, confidence adjustments, issues found

    # Conflicts from Conflict Detector Agent
    conflicts: List[Dict]  # Detected conflicts with details

    # Routing decisions from Coordinator Agent
    routing: Dict[str, Any]  # Who to notify, priority levels, reasoning

    # Agent outputs and intermediate results
    agent_outputs: Dict[str, Any]  # Detailed outputs from each agent

    # Processing metadata
    processing_status: str  # pending, in_progress, completed, failed
    errors: List[str]  # Any errors encountered
    warnings: List[str]  # Any warnings generated


class AgentOutput(TypedDict, total=False):
    """Output structure from an individual agent."""
    agent_name: str
    status: str  # success, warning, error
    data: Dict[str, Any]
    reasoning: str  # Explanation of what the agent did
    confidence: float  # 0.0 to 1.0
    issues: List[str]  # Any issues encountered


def create_initial_state(event_id: str, event_data: Dict) -> ExtractionState:
    """
    Create initial state for extraction workflow.

    Args:
        event_id: Event UUID
        event_data: Event details

    Returns:
        Initial state dictionary
    """
    return ExtractionState(
        event_id=event_id,
        event_data=event_data,
        context={},
        extractions={"decisions": [], "tasks": [], "claims": [], "topics": []},
        critique={},
        conflicts=[],
        routing={},
        agent_outputs={},
        processing_status="pending",
        errors=[],
        warnings=[]
    )
