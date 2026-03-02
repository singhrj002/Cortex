# AI Chief of Staff — What's Actually Built

## Frontend Pages

### 1. Dashboard `/`
- Key metrics: Notifications, Decisions, Graph Nodes, Relationships
- Trending Topics with badges (5 most mentioned)
- Recent Decisions list with status + confidence scores
- System Status panel: 6 agents live, WebSocket connection, Neo4j sync
- Fallback data when backend is offline

### 2. Decisions `/decisions`
- Filter by status: All / Proposed / Confirmed / Deprecated
- Filter by confidence: All / ≥50% / ≥70% / ≥80%
- Decision cards: title, status badge, confidence score, version number
- **Verify** button → marks proposed decision as confirmed
- **Deprecate** button → marks decision as obsolete
- Toast notifications on every action

### 3. Notifications `/notifications`
- Two tabs: All Notifications + Real-time (WebSocket)
- Unread count badge
- Filter: Unread Only / Show All
- Notification cards: type badge, priority badge, title, body, reasoning, timestamp
- Mark as read (per item)
- Dismiss notification
- Mark All as Read (bulk action)
- Live notifications arrive via WebSocket without page refresh

### 4. Email `/email`
- 7 demo emails telling a complete conflict story
  - Alice proposes Redis → Bob pushes back → Frank sets standards
  - Jack implements Basic Auth → Leo raises QA concerns
  - Irene reports OAuth violation → Grace approves Redis
- Click email → opens full email body
- Inbox / Starred / Archived tabs
- Unread/read styling distinction

### 5. Knowledge Graph `/graph`
- Search bar for nodes
- Filter by node type: All / Decisions / Tasks / People / Topics / Claims
- **Two visualization modes:**
  - Table Mode: nodes + relationships as HTML tables
  - Visualization Mode: force-directed interactive graph (Cytoscape.js)
- Load Graph button (fetches from Neo4j with 5s timeout)
- Fallback demo data: 10 nodes, 10 relationships
- Stats display: total nodes and relationships loaded

### 6. Conflicts `/conflicts`
- 4 conflicts with real organizational detail:
  1. Redis vs Memcached — High severity, Resolved
  2. Friday deployment freezes — Medium severity, Open
  3. OAuth 2.0 vs Basic Auth — **Critical**, Reviewing
  4. Database schema changes — High severity, Open
- Stats cards: Total / Open / Reviewing / Resolved
- Critical attention alert for urgent conflicts
- Filter by status: All / Open / Reviewing / Resolved
- Detail modal with 3 tabs:
  - Overview: description, severity, affected teams, timeline
  - Entities: related decisions and claims
  - Resolution: resolution summary (for resolved conflicts)
- Action modal: suggested next steps per conflict type
  - Auth conflicts: Migrate to OAuth 2.0, Request Security Review
  - Caching conflicts: Request Standards Exception
  - All: Schedule Meeting, Escalate to Leadership, Create Action Items

### 7. Slack `/slack`
- Mock Slack-like 2-column interface
- 5 channels with unread counts (#general, #engineering, etc.)
- 4 Direct Messages with online/offline/away status
- Message list with reactions (emoji + count)
- Message input with attachment button

### 8. Shadow Topics `/shadow-topics`
- Detects emergent/implicit organizational topics from communications
- Stats: Total Topics, Average Score, High Priority, Cross-Team, Total Keywords
- Filter: All / Emerging / Escalating / Implicit Policies / Ownership Ambiguity
- 4 sample shadow topics:
  1. Caching Reliability (score: 94, Emerging)
  2. Infra Change Approval Process (score: 87, Implicit Policy)
  3. Caching Ownership (score: 78, Ownership Ambiguity)
  4. Test Environment Stability (score: 65, Emerging)
- Detail modal with 3 tabs:
  - Overview: score, age, teams, keywords, AI insight, recommendation
  - Supporting Evidence: table of source events
  - Analysis: emergence analysis, impact, suggested actions

### 9. Admin `/admin`
- Knowledge Graph stats: total nodes, total relationships, node type breakdown
- **Enron Dataset Ingestion:**
  - Input: dataset path + email limit
  - Processes real Enron emails through 6-agent pipeline
  - Shows: processed, saved, duplicates, persons created
- **Neo4j Graph Sync:**
  - Sync Decisions button
  - Sync All Entities (persons, decisions, tasks, claims)
- Extraction workflow description (all 6 agents listed)
- System info: API URL, WebSocket URL

---

## Voice Assistant (Floating Button — All Pages)
- Floating microphone button (bottom-right, visible on all pages)
- Click-to-open chat window with conversation history
- **Speech-to-text**: Web Speech API (browser native)
- **LLM response**: OpenAI GPT-4o-mini with full org context:
  - Current conflicts (OAuth, Redis)
  - 7 recent emails with participants
  - Key people and roles
  - Organization stats
- **Text-to-speech**: OpenAI TTS-1 (alloy voice) — speaks responses aloud
- Visual states: Listening → Processing → Speaking

---

## Backend — 6-Agent LangGraph Pipeline

Every email/message goes through this pipeline automatically:

```
START
  ↓
[Memory Agent]           — Retrieves sender history, recent decisions, trending topics
  ↓
[Extractor Agent]        — Extracts decisions, tasks, claims with confidence scores
  ↓
[Critic Agent]           — Validates quality, flags low-confidence extractions
  ↓
[Conflict Detector]      — Detects contradictions between new and existing claims
  ↓
[Coordinator Agent]      — Determines who to notify, what to escalate
  ↓
[Summarizer Agent]       — Generates headline, key points, action items
  ↓
END → PostgreSQL + Neo4j + WebSocket notifications
```

---

## Backend API Endpoints

### Events
- `GET /api/v1/events` — List events with filters (date, topic, team, search)
- `POST /api/v1/events/ingest/enron/load` — Load Enron email dataset
- `POST /api/v1/events/{id}/extract` — Trigger 6-agent extraction
- `POST /api/v1/events/extract/batch` — Batch extraction

### Decisions
- `GET /api/v1/decisions` — List with status/confidence filters
- `GET /api/v1/decisions/recent` — Most recent decisions
- `GET /api/v1/decisions/{id}/versions` — Full version history
- `POST /api/v1/decisions/{id}/verify` — Confirm a decision
- `POST /api/v1/decisions/{id}/deprecate` — Deprecate a decision

### Notifications
- `GET /api/v1/notifications` — Get user notifications
- `GET /api/v1/notifications/unread-count` — Unread badge count
- `POST /api/v1/notifications/{id}/read` — Mark as read
- `POST /api/v1/notifications/mark-all-read` — Bulk mark read
- `DELETE /api/v1/notifications/{id}` — Dismiss

### Knowledge Graph
- `GET /api/v1/graph/stats` — Node/relationship counts by type
- `GET /api/v1/graph/subgraph` — Explore graph from a center node
- `GET /api/v1/graph/state?timestamp=` — **Time-travel: graph state at past date**
- `GET /api/v1/graph/node/{id}/history` — Full history of one node
- `GET /api/v1/graph/search` — Search nodes by text
- `POST /api/v1/graph/sync` — Sync PostgreSQL → Neo4j
- `GET /api/v1/graph/export` — Export full graph

### Topics
- `GET /api/v1/topics/trending` — Most mentioned topics
- `GET /api/v1/topics/{id}/entities` — What's associated with a topic

### WebSocket
- `WS /api/v1/ws?user_email=` — Real-time notification stream
- `GET /api/v1/ws/stats` — Active connections count

---

## Data Models

### Decision
- `title`, `summary`, `rationale`, `scope`
- `status`: PROPOSED → CONFIRMED → DEPRECATED
- `version`: integer (tracks all revisions)
- `confidence`: 0.0 – 1.0
- `affected_teams`, `affected_projects`
- `decided_by`, `owner`

### Task
- `title`, `description`, `assignee`, `created_by`
- `status`: open / in_progress / completed / blocked
- `priority`: low / normal / high / urgent
- `due_date`, `confidence`

### Claim
- `text`, `polarity`: positive / negative / neutral
- `claimant`, `topic`
- `confidence`, `evidence_event_ids`

---

## Infrastructure
- **PostgreSQL** — All events, decisions, tasks, claims, notifications
- **Neo4j** — Knowledge graph with versioned nodes (valid_from, valid_to)
- **Redis** — Task queue + caching
- **Celery** — Async background workers for extraction pipeline
- **WebSocket** — Real-time notification push to browser
- **OpenAI** — GPT-4o-mini (LLM) + TTS-1 (voice)

---

---

# The Story — Based on What's Actually Built

---

## It's Monday Morning. 7:58 AM.

Grace Liu, CTO of a 200-person engineering company, opens her laptop.

She doesn't open Slack. She doesn't check email.

She opens **AI Chief of Staff**.

---

### The Dashboard

In 3 seconds she sees everything that matters:

- **12 notifications** waiting
- **7 decisions** made last week
- **27 nodes** in the knowledge graph
- **2 unread emails** flagged as important
- **1 critical conflict** — blinking red

She hasn't read a single email yet.

---

### The Conflict

She clicks Conflicts.

There it is.

**OAuth 2.0 vs Basic Auth — CRITICAL — Reviewing**

The system has already told her:
- What the conflict is
- Which teams are involved (Security ↔ Frontend)
- What the affected systems are
- What the suggested actions are: *Migrate to OAuth 2.0. Schedule Security Review.*

She clicks the detail modal. Three tabs. Overview. Entities. Resolution.

The entities tab shows her exactly which decisions and claims are connected to this conflict.

She has full context in 45 seconds. Without reading a single email thread.

---

### The Emails

She's curious. She clicks Email.

7 emails. The full story is there — in chronological order:

Alice proposed Redis. Bob pushed back. Frank said Memcached is the standard. Leo ran QA tests and found Memcached failing under load. Jack implemented Basic Auth while everyone was arguing about caching. Irene flagged the security violation.

Grace clicks Irene's email. Full body. Full context. The warning was sent 5 days ago.

She never saw it in her inbox. The system did.

---

### The Voice Query

Grace doesn't want to read more. She clicks the microphone.

*"What are the most urgent things I need to act on today?"*

The AI speaks back:

*"You have one critical conflict between Jack Williams and Irene Garcia over authentication standards. Jack's team deployed Basic Auth to three production endpoints. Irene's standard SEC-STD-012 requires OAuth 2.0. This is currently live in production and violates your security compliance. I recommend scheduling a meeting with both before Friday's planned release."*

Spoken. Out loud. In 8 seconds.

Grace understood the situation without opening a single Slack thread.

---

### The Knowledge Graph

She clicks Graph.

The force-directed visualization loads. She can see:

- Grace (CTO) connected to the Redis decision she approved
- Alice connected to her Redis proposal
- Jack connected to his Basic Auth implementation
- A red edge between Jack's decision and Irene's security standard — **conflicts_with**

She switches to Table Mode. Every node. Every relationship. Exportable.

She searches "auth". Two nodes surface. The conflict is visible as a relationship.

---

### The Decisions Queue

She clicks Decisions. Filters to Proposed.

Three decisions waiting for her verification.

She reads each one:
- Redis implementation: confidence 0.87 — she clicks **Verify**. Done.
- API versioning strategy: confidence 0.62 — she leaves it Proposed. Needs more evidence.
- Frontend deployment freeze: confidence 0.91 — she clicks **Deprecate**. That policy is outdated.

Three decisions. 90 seconds. No meetings.

---

### The Shadow Topics

She clicks Shadow Topics.

Something she's never seen in any tool before.

The AI has been watching the communications — not for explicit topics, but for **patterns nobody named yet**.

Four emergent topics are surfacing:

- **Caching Reliability** — score 94. Three teams have been circling this for weeks without anyone owning it.
- **Infra Change Approval Process** — score 87. An implicit policy is forming. Nobody wrote it down.
- **Test Environment Stability** — score 65. Still early. Worth watching.

She clicks Caching Reliability. The supporting evidence tab shows 12 specific messages — emails, Slack — where teams mentioned caching issues without ever filing a ticket or creating a decision.

The AI's insight: *"This topic has cross-team involvement and increasing velocity. Recommend assigning an owner and creating a formal initiative."*

Nobody told Grace this was a problem. The system found it by reading between the lines.

---

### The Notifications

She clicks Notifications.

Real-time tab is live. As she watches, a new notification arrives — someone on Alice's team just marked the Redis implementation task as in_progress.

She didn't ask for that update. It arrived because she's the CTO and this decision was flagged as affecting her.

She marks the auth conflict notification as read. She'll handle it in her 10am.

She clicks Mark All as Read on the rest.

---

### What Just Happened

Grace spent **12 minutes**.

She understood:
- Every active conflict in her organization
- Every pending decision waiting for action
- 7 emails' worth of organizational history
- 4 shadow topics nobody had named yet
- The real-time pulse of her team's work

No meetings. No Slack scrolling. No email archaeology.

The AI Chief of Staff read everything. Extracted what matters. Surfaced what's urgent. Spoke the answer when she asked.

---

## That's not a dashboard.

## That's organizational intelligence.

---

*Built with: FastAPI · Next.js · Neo4j · LangGraph · 6-Agent AI Pipeline · OpenAI · WebSocket · Celery · PostgreSQL*
