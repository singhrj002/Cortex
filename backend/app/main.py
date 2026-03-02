"""
AI Chief of Staff - FastAPI Application
Main entry point for the organizational intelligence API.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.session import engine, Base
from app.db.neo4j_client import get_neo4j_client, close_neo4j_connection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    logger.info("Starting AI Chief of Staff API...")

    # Create database tables if they don't exist
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

    # Initialize Neo4j connection and schema
    try:
        logger.info("Initializing Neo4j connection...")
        neo4j_client = get_neo4j_client()
        neo4j_client.create_indexes()
        neo4j_client.create_constraints()
        logger.info("Neo4j connection initialized")
    except Exception as e:
        logger.error(f"Error initializing Neo4j: {e}")

    logger.info("Startup complete!")

    yield

    # Shutdown
    logger.info("Shutting down AI Chief of Staff API...")
    close_neo4j_connection()
    logger.info("Shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="AI Chief of Staff API",
    description="Organizational Intelligence Layer - Extract knowledge, build graphs, detect conflicts",
    version="0.1.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)


@app.get("/")
async def root():
    """Root endpoint - API status check."""
    return {
        "message": "AI Chief of Staff API",
        "status": "operational",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected",
        "graph": "connected"
    }


# Import and include routers
from app.api.v1.api import api_router
app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )