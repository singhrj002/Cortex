# AI Chief of Staff - Organizational Intelligence Layer

![License](https://img.shields.io/badge/license-MIT-blue.svg)

A sophisticated AI system that serves as an organizational intelligence layer by ingesting communication, extracting decisions and tasks using multi-agent LangGraph workflows, maintaining versioned knowledge graphs, and intelligently routing information to stakeholders.

## 📌 Overview

The AI Chief of Staff system:

- **Ingests** organizational communications (email, Slack, meetings)
- **Extracts** decisions, tasks, claims, risks using 6-agent LangGraph workflow
- **Maintains** a versioned Neo4j knowledge graph with time-travel queries
- **Routes** intelligent notifications to the right stakeholders
- **Detects** contradictions, conflicts, and information overload
- **Visualizes** knowledge graph, information flow, and agent reasoning

## 🚀 Key Features

- **Multi-Agent LangGraph Workflow**: 6 specialized agents (Memory, Extractor, Critic, Conflict Detector, Coordinator, Summarizer)
- **Real-time Notifications**: WebSocket-based push notifications with intelligent routing
- **Knowledge Graph Explorer**: Interactive Neo4j visualization with versioning and time-travel
- **Admin Dashboard**: Data ingestion, graph sync, and system monitoring
- **Decisions Management**: View, verify, deprecate decisions with confidence scores
- **Notification Center**: Real-time alerts with routing reasons

## 🏗️ Architecture

### Tech Stack

#### Backend
- **Python FastAPI** - REST API with async support
- **PostgreSQL** - Events, decisions, tasks, notifications
- **Neo4j** - Versioned knowledge graph with time-travel
- **Redis** - Task queue and caching
- **Celery** - Async background workers
- **LangGraph** - Multi-agent workflow orchestration
- **OpenAI API** - LLM-based extraction and reasoning

#### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Chakra UI** - Component library
- **React Query** - Data fetching and caching
- **WebSocket** - Real-time notifications
- **Cytoscape.js** - Graph visualization

---

## 📋 Complete Setup Guide

### Prerequisites

- **Docker & Docker Compose** (recommended for infrastructure)
- **Python 3.11+** (for backend development)
- **Node.js 18+** (for frontend development)
- **OpenAI API Key** (required for LLM extraction)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/ai-chief-of-staff.git
cd ai-chief-of-staff
```

### Step 2: Environment Setup

#### Backend Environment

Create `/backend/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_chief_of_staff

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# OpenAI (REQUIRED)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.1
OPENAI_MAX_TOKENS=2000

# Feature Flags
ENABLE_MULTI_AGENT=true
ENABLE_GRAPH_SYNC=true
ENABLE_NOTIFICATIONS=true
```

#### Frontend Environment

Create `/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Step 3: Start Infrastructure (Docker)

The easiest way to run PostgreSQL, Neo4j, and Redis:

```bash
# Start all infrastructure services
docker-compose up -d postgres neo4j redis

# Verify services are running
docker-compose ps
```

**Access Points:**
- PostgreSQL: `localhost:5432` (user: `postgres`, password: `password`)
- Neo4j Browser: `http://localhost:7474` (user: `neo4j`, password: `password`)
- Redis: `localhost:6379`

### Step 4: Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Database will be auto-created on first run via FastAPI lifespan
# Neo4j indexes/constraints will also be auto-created

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at:** `http://localhost:8000`
**API Documentation:** `http://localhost:8000/docs`

### Step 5: Start Celery Worker

In a **new terminal** (keep FastAPI running):

```bash
cd backend
source venv/bin/activate  # Activate same virtual environment

# Start Celery worker for async processing
celery -A app.worker.celery_app worker --loglevel=info
```

### Step 6: Setup Frontend

In a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend will be available at:** `http://localhost:3000`

---

## 🎯 Quick Start: Ingesting Sample Data

Once all services are running, you can ingest the sample emails.

### Option 1: Python Script (Recommended)

```bash
cd backend
source venv/bin/activate

# Ingest sample emails into database
python scripts/ingest_sample_emails.py

# Ingest AND trigger extraction workflow
python scripts/ingest_sample_emails.py --extract

# Use simple extraction (no LangGraph workflow)
python scripts/ingest_sample_emails.py --extract --simple
```

**What this does:**
1. Creates 5 sample events in PostgreSQL
2. Creates Person records for all email participants
3. (With `--extract`) Triggers LangGraph multi-agent workflow
4. Extracts decisions, tasks, claims
5. Creates notifications
6. Syncs to Neo4j graph

### Option 2: Admin UI

1. Go to `http://localhost:3000/admin`
2. Use the Enron Data Ingestion section
3. Set path: `/path/to/enron/maildir` (if you have Enron dataset)
4. Or use the sample emails ingestion script above

### Option 3: Direct API

```bash
# Get events
curl http://localhost:8000/api/v1/events/

# Trigger extraction for an event
curl -X POST "http://localhost:8000/api/v1/events/{event_id}/extract?use_workflow=true"
```

---

## 🔍 Verify Everything Works

### 1. Check Events Were Created

```bash
curl http://localhost:8000/api/v1/events/ | jq
```

You should see your sample emails as events.

### 2. Check Celery Worker Logs

Watch the Celery terminal - you should see:
```
[Workflow] Starting extraction for event {id}
[Workflow] Executing Memory Agent...
[Workflow] Executing Extractor Agent...
[Workflow] Executing Critic Agent...
[Workflow] Executing Conflict Detector Agent...
[Workflow] Executing Coordinator Agent...
[Workflow] Executing Summarizer Agent...
[Workflow] Extraction complete
```

### 3. View Extracted Decisions

- **Dashboard:** `http://localhost:3000` - See recent decisions
- **Decisions Page:** `http://localhost:3000/decisions` - Full list with filters
- **API:** `curl http://localhost:8000/api/v1/decisions/ | jq`

### 4. Check Knowledge Graph

- **Neo4j Browser:** `http://localhost:7474`
- **Query:** `MATCH (n) RETURN n LIMIT 25`
- **Or use:** `http://localhost:3000/graph` - Load graph visualization

### 5. Check Notifications

- **Notifications Page:** `http://localhost:3000/notifications`
- **API:** `curl "http://localhost:8000/api/v1/notifications/?user_email=demo@example.com" | jq`

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  Dashboard | Decisions | Notifications | Graph | Admin     │
│                                                             │
│  React Query (Caching) + WebSocket (Real-time)            │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP / WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                 FastAPI Backend                             │
│  Events API | Decisions API | Notifications API | Graph   │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌───▼──────┐ ┌───▼──────────┐
│ PostgreSQL   │ │  Neo4j   │ │ Redis/Celery │
│              │ │          │ │              │
│ • Events     │ │ • Nodes  │ │ • Task Queue │
│ • Decisions  │ │ • Edges  │ │ • Caching    │
│ • Tasks      │ │ • Version│ │              │
│ • Persons    │ │   History│ │              │
│ • Notific.   │ │          │ │              │
└──────────────┘ └──────────┘ └──────┬───────┘
                                      │
                            ┌─────────▼─────────┐
                            │  Celery Worker    │
                            │                   │
                            │  LangGraph Flow:  │
                            │  Memory           │
                            │    ↓              │
                            │  Extractor        │
                            │    ↓              │
                            │  Critic           │
                            │    ↓              │
                            │  ConflictDetector │
                            │    ↓              │
                            │  Coordinator      │
                            │    ↓              │
                            │  Summarizer       │
                            │                   │
                            │  ↓ Notifications  │
                            │  ↓ WebSocket Push │
                            └───────────────────┘
```

---

## 📖 System Components

### Multi-Agent LangGraph Workflow

**6 Specialized Agents:**

1. **Memory Agent** - Retrieves context from database and graph
2. **Extractor Agent** - Extracts decisions, tasks, claims using OpenAI
3. **Critic Agent** - Validates extraction quality, adjusts confidence
4. **Conflict Detector** - Finds contradictions in claims
5. **Coordinator Agent** - Determines notification routing
6. **Summarizer Agent** - Generates executive summaries

**Workflow:** Memory → Extractor → Critic → Conflict → Coordinator → Summarizer

### Intelligent Routing Engine

Determines notification recipients using:
- AI analysis (Coordinator Agent)
- Routing rules (database-driven)
- User subscriptions (topics, keywords, people)
- Graph relationships (mentions, ownership)

### Knowledge Graph (Neo4j)

**Features:**
- **Versioned Nodes** - Every update creates a new version
- **Time-Travel Queries** - View graph state at any timestamp
- **Relationship Tracking** - MADE_DECISION, ASSIGNED_TO, RELATES_TO
- **Node Types** - Person, Decision, Task, Claim, Topic

**Example Query:**
```cypher
// Get all decisions made by a person
MATCH (p:Person {email: "alice@company.com"})-[:MADE_DECISION]->(d:Decision)
WHERE d.valid_to IS NULL  // Get current versions only
RETURN p, d

// Time-travel: Get graph state on a specific date
MATCH (d:Decision)
WHERE d.valid_from <= datetime('2026-02-01T00:00:00Z')
  AND (d.valid_to IS NULL OR d.valid_to > datetime('2026-02-01T00:00:00Z'))
RETURN d
```

### Real-time Notifications

**WebSocket Flow:**
1. Client connects: `ws://localhost:8000/api/v1/ws?user_email=user@example.com`
2. Celery worker completes extraction
3. Notifications created with routing logic
4. WebSocket broadcasts to connected users
5. React context updates UI instantly

---

## 🎮 Usage Examples

### Create and Extract an Event

```bash
# Using the API
curl -X POST "http://localhost:8000/api/v1/events/" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "manual",
    "channel": "email",
    "sender": "john@acme.com",
    "recipients": ["alice@company.com"],
    "subject": "Q2 Budget Approval",
    "body_text": "We have decided to approve the Q2 marketing budget of $500K. Please proceed with the campaign planning.",
    "timestamp": "2026-02-08T10:00:00Z"
  }'

# Then trigger extraction
curl -X POST "http://localhost:8000/api/v1/events/{event_id}/extract?use_workflow=true"
```

### Search Knowledge Graph

```bash
# Search for nodes
curl "http://localhost:8000/api/v1/graph/search?query=budget&node_type=Decision" | jq

# Get graph statistics
curl "http://localhost:8000/api/v1/graph/stats" | jq

# Get subgraph around a decision
curl "http://localhost:8000/api/v1/graph/subgraph?center_id={decision_id}&depth=2" | jq
```

### Manage Decisions

```bash
# List decisions
curl "http://localhost:8000/api/v1/decisions/?status=proposed&min_confidence=0.7" | jq

# Verify a decision
curl -X POST "http://localhost:8000/api/v1/decisions/{decision_id}/verify" | jq

# Get version history
curl "http://localhost:8000/api/v1/decisions/by-key/{decision_key}/versions" | jq
```

### Manage Notifications

```bash
# Get unread notifications
curl "http://localhost:8000/api/v1/notifications/?user_email=alice@company.com&unread_only=true" | jq

# Mark as read
curl -X POST "http://localhost:8000/api/v1/notifications/{notif_id}/read?user_email=alice@company.com" | jq

# Mark all as read
curl -X POST "http://localhost:8000/api/v1/notifications/mark-all-read?user_email=alice@company.com" | jq
```

---

## 🐳 Docker Compose Full Stack

To run everything in Docker (backend, frontend, all infrastructure):

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Neo4j: http://localhost:7474
```

**Note:** Currently optimized for local development with selective Docker usage (infrastructure only).

---

## 🛠️ Development Workflow

### Local Development Setup

```bash
# Terminal 1: Infrastructure
docker-compose up postgres neo4j redis

# Terminal 2: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 3: Celery Worker
cd backend
source venv/bin/activate
celery -A app.worker.celery_app worker --loglevel=info

# Terminal 4: Frontend
cd frontend
npm run dev
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

---

## 📝 Configuration

### Backend Settings

Edit `backend/app/core/config.py` or use environment variables:

```python
# Extraction Settings
OPENAI_MODEL = "gpt-4o-mini"  # or gpt-4o for better quality
OPENAI_TEMPERATURE = 0.1      # Low temperature for consistent extraction
OPENAI_MAX_TOKENS = 2000

# Feature Flags
ENABLE_MULTI_AGENT = True     # Use LangGraph workflow
ENABLE_GRAPH_SYNC = True      # Auto-sync to Neo4j
ENABLE_NOTIFICATIONS = True   # Create notifications
```

### Frontend Settings

User email for demo: Edit `frontend/src/app/providers.tsx`:

```typescript
<NotificationProvider userEmail="your-email@company.com">
```

---

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check PostgreSQL connection
docker-compose logs postgres

# Check if port 8000 is available
lsof -i :8000
```

### Celery worker not processing tasks

```bash
# Check Redis connection
docker-compose logs redis

# Restart Celery worker
# Ctrl+C in Celery terminal, then restart
celery -A app.worker.celery_app worker --loglevel=info
```

### Frontend can't connect to backend

```bash
# Check backend is running
curl http://localhost:8000/docs

# Check CORS settings in backend/app/main.py
# Ensure NEXT_PUBLIC_API_URL is set correctly
```

### Extraction not working

```bash
# Check OpenAI API key is set
echo $OPENAI_API_KEY

# Check Celery worker logs for errors
# Try simple extraction first
python scripts/ingest_sample_emails.py --extract --simple
```

### Neo4j connection issues

```bash
# Check Neo4j is running
docker-compose logs neo4j

# Access Neo4j browser and verify credentials
# http://localhost:7474
# Default: neo4j / password
```

---

## 📚 API Documentation

Once the backend is running, visit:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgements

- **OpenAI** for LLM technology
- **LangGraph** for multi-agent orchestration
- **Neo4j** for graph database capabilities
- **FastAPI**, **Next.js**, and all open-source libraries

---

## 📧 Support

For questions or issues:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review API documentation at `/docs`

---

**Built with ❤️ using Claude Code**
