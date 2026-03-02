# Quick Start Guide - AI Chief of Staff

Get up and running in 5 minutes!

## ⚡ Fastest Path to Running System

### 1. Start Infrastructure (30 seconds)

```bash
docker-compose up -d postgres neo4j redis
```

### 2. Setup Backend (2 minutes)

```bash
cd backend

# Create .env file
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_chief_of_staff
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o-mini
ENABLE_MULTI_AGENT=true
EOF

# Install and start
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
```

### 3. Start Celery Worker (30 seconds)

**New terminal:**
```bash
cd backend
source venv/bin/activate
celery -A app.worker.celery_app worker --loglevel=info &
```

### 4. Setup Frontend (1 minute)

**New terminal:**
```bash
cd frontend

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
EOF

npm install
npm run dev
```

### 5. Ingest Sample Data (30 seconds)

**New terminal:**
```bash
cd backend
source venv/bin/activate

# Ingest 5 sample emails AND trigger extraction
python scripts/ingest_sample_emails.py --extract
```

### 6. Open Frontend

```bash
open http://localhost:3000
```

---

## 🎯 What You'll See

1. **Dashboard** (`/`) - Real-time metrics, recent decisions
2. **Decisions** (`/decisions`) - 5 extracted decisions from sample emails
3. **Notifications** (`/notifications`) - Real-time notifications with WebSocket
4. **Graph** (`/graph`) - Knowledge graph visualization
5. **Admin** (`/admin`) - System stats and ingestion tools

---

## 🔍 Verify It's Working

### Check Events Created
```bash
curl http://localhost:8000/api/v1/events/ | jq length
# Should return: 5
```

### Check Decisions Extracted
```bash
curl http://localhost:8000/api/v1/decisions/ | jq length
# Should return: 3-5 (depends on extraction quality)
```

### Check Graph Nodes
Go to http://localhost:7474
```cypher
MATCH (n) RETURN count(n)
```

### Check Notifications
```bash
curl "http://localhost:8000/api/v1/notifications/?user_email=demo@example.com" | jq length
```

---

## 🎮 Try These Commands

### View Extraction in Progress
Watch Celery worker terminal - you'll see:
```
[Workflow] Executing Memory Agent...
[Workflow] Executing Extractor Agent...
[Workflow] Executing Critic Agent...
...
```

### Trigger Manual Extraction
```bash
# Get an event ID
EVENT_ID=$(curl -s http://localhost:8000/api/v1/events/ | jq -r '.[0].id')

# Trigger extraction
curl -X POST "http://localhost:8000/api/v1/events/$EVENT_ID/extract?use_workflow=true"
```

### Search Graph
```bash
curl "http://localhost:8000/api/v1/graph/search?query=project" | jq
```

---

## 🐛 Quick Fixes

### Backend won't start
```bash
# Kill any process on port 8000
lsof -ti:8000 | xargs kill -9

# Restart
uvicorn app.main:app --reload
```

### Frontend won't start
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart
npm run dev
```

### Database issues
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### OpenAI API errors
```bash
# Check your key is set
echo $OPENAI_API_KEY

# Or edit backend/.env directly
```

---

## 📁 Sample Email Content

The 5 sample emails include:

1. **Project Status Update** - Should extract decisions about milestones
2. **Partnership Opportunity** - Should extract partnership decisions
3. **Tech Newsletter** - Usually no decisions (just informational)
4. **Security Incident** - Should extract security response decisions
5. **HR Announcement** - Should extract process decisions

---

## 🚀 Next Steps

Once running:

1. ✅ View Dashboard at `http://localhost:3000`
2. ✅ Check Decisions at `http://localhost:3000/decisions`
3. ✅ See Real-time Notifications at `http://localhost:3000/notifications`
4. ✅ Explore Graph at `http://localhost:3000/graph`
5. ✅ Try Admin Panel at `http://localhost:3000/admin`

---

## 📊 System Health Checklist

- [ ] PostgreSQL running (port 5432)
- [ ] Neo4j running (port 7474)
- [ ] Redis running (port 6379)
- [ ] FastAPI server (port 8000)
- [ ] Celery worker (running in terminal)
- [ ] Next.js frontend (port 3000)
- [ ] Sample emails ingested (5 events)
- [ ] Extraction completed (check Celery logs)

---

**Total Setup Time:** ~5 minutes
**Total Cost:** $0.01-0.05 for OpenAI extraction

🎉 **You're all set!**
