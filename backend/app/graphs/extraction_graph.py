"""
LangGraph workflow for multi-agent extraction.
Orchestrates Archivist → Analyst → Auditor → Inspector → Director → Briefer.
"""

import logging
from typing import Dict, Any
from langgraph.graph import StateGraph, END
from sqlalchemy.orm import Session

from app.graphs.state import ExtractionState, create_initial_state
from app.agents.multi_agent_system import (
    ArchivistAgent,
    AnalystAgent,
    AuditorAgent,
    InspectorAgent,
    DirectorAgent,
    BrieferAgent,
)

logger = logging.getLogger(__name__)


class ExtractionWorkflow:
    """
    Multi-agent extraction workflow using LangGraph.

    Flow:
    START → Archivist → Analyst → Auditor → Inspector → Director → Briefer → END
    """

    def __init__(self, db: Session):
        self.db = db
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph state graph."""

        workflow = StateGraph(ExtractionState)

        # Initialize agents
        archivist = ArchivistAgent(self.db)
        analyst = AnalystAgent()
        auditor = AuditorAgent()
        inspector = InspectorAgent(self.db)
        director = DirectorAgent()
        briefer = BrieferAgent()

        # Define node functions
        async def archivist_node(state: ExtractionState) -> ExtractionState:
            logger.info("[Workflow] Archivist — retrieving org context...")
            return await archivist.process(state)

        async def analyst_node(state: ExtractionState) -> ExtractionState:
            logger.info("[Workflow] Analyst — extracting structured intelligence...")
            return await analyst.process(state)

        async def auditor_node(state: ExtractionState) -> ExtractionState:
            logger.info("[Workflow] Auditor — validating extraction quality...")
            return await auditor.process(state)

        async def inspector_node(state: ExtractionState) -> ExtractionState:
            logger.info("[Workflow] Inspector — detecting conflicts & contradictions...")
            return await inspector.process(state)

        async def director_node(state: ExtractionState) -> ExtractionState:
            logger.info("[Workflow] Director — orchestrating routing & escalation...")
            return await director.process(state)

        async def briefer_node(state: ExtractionState) -> ExtractionState:
            logger.info("[Workflow] Briefer — generating executive brief...")
            state["processing_status"] = "completed"
            return await briefer.process(state)

        # Add nodes
        workflow.add_node("archivist", archivist_node)
        workflow.add_node("analyst", analyst_node)
        workflow.add_node("auditor", auditor_node)
        workflow.add_node("inspector", inspector_node)
        workflow.add_node("director", director_node)
        workflow.add_node("briefer", briefer_node)

        # Define edges
        workflow.set_entry_point("archivist")
        workflow.add_edge("archivist", "analyst")
        workflow.add_edge("analyst", "auditor")
        workflow.add_edge("auditor", "inspector")
        workflow.add_edge("inspector", "director")
        workflow.add_edge("director", "briefer")
        workflow.add_edge("briefer", END)

        return workflow.compile()

    async def run(self, event_id: str, event_data: Dict[str, Any]) -> ExtractionState:
        """
        Run the complete extraction workflow.

        Args:
            event_id: Event UUID
            event_data: Event details (sender, subject, body, etc.)

        Returns:
            Final state after all agents have processed
        """
        logger.info(f"[Workflow] Starting extraction for event {event_id}")

        initial_state = create_initial_state(event_id, event_data)
        initial_state["processing_status"] = "in_progress"

        try:
            final_state = await self.graph.ainvoke(initial_state)
            logger.info(f"[Workflow] Extraction complete for event {event_id}")
            return final_state

        except Exception as e:
            logger.error(f"[Workflow] Error in extraction workflow: {e}")
            initial_state["processing_status"] = "failed"
            initial_state["errors"].append(str(e))
            return initial_state


def create_extraction_workflow(db: Session) -> ExtractionWorkflow:
    """Factory function to create extraction workflow."""
    return ExtractionWorkflow(db)
