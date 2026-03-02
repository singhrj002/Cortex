"""
Prompts package for LLM interactions.
"""

from app.prompts.extraction_prompts import (
    EXTRACTION_SYSTEM_PROMPT,
    EXTRACTION_USER_PROMPT_TEMPLATE,
    create_extraction_prompt,
    get_extraction_messages,
)

__all__ = [
    "EXTRACTION_SYSTEM_PROMPT",
    "EXTRACTION_USER_PROMPT_TEMPLATE",
    "create_extraction_prompt",
    "get_extraction_messages",
]
