# AI Chief of Staff Backend

The backend API and processing engine for the AI Chief of Staff system, responsible for ingestion, extraction, knowledge graph management, and multi-agent orchestration.

## 🛠️ Tech Stack

- **FastAPI**: Modern, high-performance web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM)
- **PostgreSQL**: Relational database for events, extractions, and notifications
- **Neo4j**: Graph database for knowledge graph
- **Celery**: Distributed task queue for async processing
- **Redis**: Message broker and caching
- **OpenAI API**: LLM extraction and agent reasoning
- **Pydantic**: Data validation and settings management
- **pgvector**: Vector storage for semantic search
- **NetworkX**: Graph algorithms and analysis

## 📂 Project Structure

```
backend/
├─ app/                     # Application package
│  ├─ api/                  # API endpoints
│  │  ├─ v1/                # API v1 routes
│  │  │  ├─ endpoints/      # API endpoint modules
│  │  │  └─ api.py          # API router
│  ├─ core/                 # Core application components
│  │  ├─ config.py          # Configuration
│  │  └─ security.py        # Security utilities
│  ├─ db/                   # Database
│  │  ├─ base.py            # Base models
│  │  └─ session.py         # Database session
│  ├─ models/               # SQLAlchemy models
│  ├─ schemas/              # Pydantic schemas
│  ├─ services/             # Business logic
│  ├─ utils/                # Utility functions
│  └─ main.py               # Application entry point
├─ tests/                   # Tests
│  ├─ api/                  # API tests
│  └─ conftest.py           # Test configuration
├─ alembic/                 # Database migrations
├─ requirements.txt         # Dependencies
└─ pyproject.toml           # Project metadata
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- PostgreSQL
- Neo4j
- Redis

### Installation
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Running Locally
```bash
# Start dev server
uvicorn app.main:app --reload

# Start Celery worker
celery -A app.worker worker --loglevel=info
```

### Docker
```bash
# Build the Docker image
docker build -t ai-chief-of-staff-backend .

# Run with Docker Compose (preferred, includes dependencies)
docker-compose up -d backend
```

## 🧠 System Components

### Ingestion Service
- Connectors for various data sources (email, chat, etc.)
- Event normalization
- Deduplication and threading

### Extraction Pipeline
- LLM extraction of structured information
- Entities (people, teams, projects)
- Decisions, tasks, claims, risks
- Automatic topic clustering

### Knowledge Graph Service
- Graph schema (nodes and relationships)
- Version tracking for decisions and policies
- Provenance tracking
- Diff computation

### Multi-Agent Orchestration
- Memory Agent: Truth consolidation
- Critic Agent: Conflict detection
- Coordinator Agent: Routing decisions
- Observer Agent: Overload detection
- Summarizer Agent: Daily reports

### Routing & Notification
- Relevance scoring
- Throttling and escalation
- Priority determination

## 📝 API Documentation

The API documentation is available at `/docs` when the server is running. It includes:

- All available endpoints
- Request/response schemas
- Authentication information
- Sample requests

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app tests/
```

## 📦 Dependency Management

Dependencies are managed in `requirements.txt` for pip and `pyproject.toml` for modern tooling.

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Neo4j Python Driver Documentation](https://neo4j.com/docs/api/python-driver/current/)
- [Celery Documentation](https://docs.celeryproject.org/)