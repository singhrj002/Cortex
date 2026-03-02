"""
Configuration management using Pydantic Settings.
Loads configuration from environment variables with validation and defaults.
"""

from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field, PostgresDsn, validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Chief of Staff API"
    DEBUG: bool = Field(default=False, env="DEBUG")

    # Database - PostgreSQL
    DATABASE_URL: PostgresDsn = Field(
        default="postgresql://postgres:postgres@postgres:5432/ai_chief_of_staff",
        env="DATABASE_URL"
    )

    # Database - Neo4j
    NEO4J_URI: str = Field(default="bolt://neo4j:7687", env="NEO4J_URI")
    NEO4J_USER: str = Field(default="neo4j", env="NEO4J_USER")
    NEO4J_PASSWORD: str = Field(default="password", env="NEO4J_PASSWORD")

    # Redis
    REDIS_URL: str = Field(default="redis://redis:6379/0", env="REDIS_URL")
    CELERY_BROKER_URL: str = Field(default="redis://redis:6379/1", env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://redis:6379/2", env="CELERY_RESULT_BACKEND")

    # OpenAI
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY")  # Required
    OPENAI_MODEL: str = Field(default="gpt-4o-mini", env="OPENAI_MODEL")
    OPENAI_TEMPERATURE: float = Field(default=0.1, env="OPENAI_TEMPERATURE")
    OPENAI_MAX_TOKENS: int = Field(default=2048, env="OPENAI_MAX_TOKENS")

    # Extraction Settings
    EXTRACTION_BATCH_SIZE: int = Field(default=10, env="EXTRACTION_BATCH_SIZE")
    MAX_TOKENS_PER_EXTRACTION: int = Field(default=4000, env="MAX_TOKENS_PER_EXTRACTION")

    # Security
    SECRET_KEY: str = Field(default="changethissecretkey", env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000", "http://frontend:3000"],
        env="BACKEND_CORS_ORIGINS"
    )

    # Feature Flags
    ENABLE_WEBSOCKET: bool = Field(default=True, env="ENABLE_WEBSOCKET")
    ENABLE_PDF_PROCESSING: bool = Field(default=False, env="ENABLE_PDF_PROCESSING")
    MOCK_DATA: bool = Field(default=False, env="MOCK_DATA")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Allow extra fields from environment


# Global settings instance
settings = Settings()
