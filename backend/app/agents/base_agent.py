"""
Base agent class for LangGraph multi-agent system.
All specialized agents inherit from this base class.
"""

import logging
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
from openai import OpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """
    Base class for all agents in the system.

    Each agent has:
    - A name and role
    - Access to OpenAI LLM
    - A process method that defines its behavior
    """

    def __init__(
        self,
        name: str,
        role: str,
        model: Optional[str] = None,
        temperature: float = 0.1
    ):
        """
        Initialize the base agent.

        Args:
            name: Agent name (e.g., "Memory", "Extractor")
            role: Agent's role/purpose
            model: OpenAI model to use (defaults to settings.OPENAI_MODEL)
            temperature: LLM temperature (0.0-1.0)
        """
        self.name = name
        self.role = role
        self.model = model or settings.OPENAI_MODEL
        self.temperature = temperature
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

        logger.info(f"Initialized {self.name} agent (role: {self.role})")

    @abstractmethod
    async def process(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process the current state and return updated state.

        This is the main method each agent must implement.

        Args:
            state: Current workflow state

        Returns:
            Updated state dictionary
        """
        pass

    def call_llm(
        self,
        messages: list,
        response_format: Optional[Dict] = None,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Call OpenAI LLM with messages.

        Args:
            messages: List of message dictionaries
            response_format: Optional response format (e.g., {"type": "json_object"})
            max_tokens: Maximum tokens in response

        Returns:
            LLM response content
        """
        try:
            kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": self.temperature,
                "max_tokens": max_tokens or settings.OPENAI_MAX_TOKENS,
            }

            if response_format:
                kwargs["response_format"] = response_format

            response = self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Error calling LLM in {self.name} agent: {e}")
            raise

    def log(self, message: str, level: str = "info"):
        """
        Log a message with agent context.

        Args:
            message: Message to log
            level: Log level (info, warning, error)
        """
        log_message = f"[{self.name}] {message}"

        if level == "info":
            logger.info(log_message)
        elif level == "warning":
            logger.warning(log_message)
        elif level == "error":
            logger.error(log_message)

    def get_system_prompt(self) -> str:
        """
        Get the system prompt for this agent.
        Can be overridden by subclasses.

        Returns:
            System prompt string
        """
        return f"You are a {self.role}. Your name is {self.name}."
