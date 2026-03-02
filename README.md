# Cortex — Organisational Intelligence for Engineering Leaders

![Cortex](image.png)

> **Detect hidden risks and stalled decisions before they cost you. Lead your growing team with complete visibility.**

Cortex is an AI-powered chief of staff built for CTOs and engineering leaders. It continuously monitors your organisation's communication, code, and project data — surfacing conflicts, burnout risks, stalled decisions, and shadow topics before they become incidents. It attends meetings on your behalf, briefs you every morning, and lets you make decisions directly from a single dashboard.

Built at a hackathon. Powered by **Mistral Large** and **ElevenLabs** for voice intelligence.

---

## The Problem

Engineering leaders are the last to know when something is about to break.

- A security violation sits open for 17 days before the CTO hears about it
- An engineer works 56 hours a week for two weeks — no one notices until they quit
- A critical infrastructure decision is deadlocked for 14 days because no one owns it
- The SOC 2 audit is 19 days away and it's only being discussed in DMs

Traditional tools show you what's on the roadmap. Cortex shows you what's about to derail it.

---

## Core Features

### ARIA — AI Executive Assistant
Your personal AI chief of staff, powered by **Mistral Large**. ARIA attends every meeting, extracts decisions and action items, tracks who committed to what, and briefs you every morning and evening. Ask it anything about your organisation — it responds with real names, ticket IDs, and specific next actions.

Voice output is powered by **ElevenLabs** (`eleven_flash_v2_5`, Rachel voice) for natural, executive-quality speech.

### Org Health Dashboard
Real-time organisational health score (0–100) built from ML signals across four data sources — no surveys, no self-reporting:
- **Jira**: tickets resolved, avg close time, blocked count, 7-sprint velocity trend
- **Communication**: Slack response latency, cross-team thread depth, email escalation rate, silo detection
- **Git**: PR review participation, commit-to-merge time, draft PR and shadow work flagging
- **Capacity**: hours/week, overload threshold (50h+), conflict involvement, escalation lag

### Shadow Topics
Emerging risks being discussed in DMs and side threads with no formal owner or ticket. Cortex clusters semantically related messages across Slack, email, and meeting transcripts — when volume crosses a threshold with no formal artefact, it surfaces as a shadow topic with an urgency score and a recommended action.

### Conflict Detection & Resolution
Cross-team conflicts detected and classified by severity. Each conflict shows parties involved, root cause, supporting evidence, and days open. For decision-blocking conflicts, Cortex generates a direct CTO action — a side-by-side comparison to choose between competing options with one click, unblocking downstream tickets immediately.

### Decisions & Pending Approvals
All decisions extracted from meetings and communications, with a separate pending approvals queue for items awaiting CTO sign-off. Approve or reject directly from the dashboard.

### Meeting Briefings
ARIA attends every meeting and produces structured briefings: decisions made, action items with owners and deadlines, risks flagged, and a pre-generated agenda for upcoming meetings — automatically, without being asked.

### Org Chart & Knowledge Graph
Interactive org chart showing team structure, active conflict indicators, and individual health scores. Orange borders indicate active alerts.

### Calendar Intelligence
ARIA finds free slots across any set of attendees and books meetings directly from conversation.

---

## AI Stack

| Layer | Model / Service | Purpose |
|---|---|---|
| Intelligence & Reasoning | **Mistral Large 2411** | ARIA chat, decision extraction, conflict analysis, briefing generation |
| Text-to-Speech | **ElevenLabs** `eleven_flash_v2_5` | Executive-quality voice output (Rachel voice) |
| Speech Recognition | Web Speech API | Voice input from the browser |

Mistral Large was chosen for its strong instruction following and structured output quality — critical for extracting decisions, action items, and risks from long meeting transcripts with specific names and ticket IDs.

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router) · TypeScript
- Chakra UI (dark theme) · Framer Motion
- Cytoscape.js (org graph) · Recharts

**Backend**
- FastAPI · PostgreSQL + SQLAlchemy
- Neo4j (knowledge graph)
- Redis + Celery (async processing)
- pgvector (semantic search)

---

## Setup

### Prerequisites
- Node.js 18+
- Mistral API key → [mistral.ai](https://mistral.ai)
- ElevenLabs API key → [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)

### 1. Install

```bash
cd frontend
npm install
```

### 2. Environment

Create `frontend/.env.local`:

```env
OPENROUTER_API_KEY=your-mistral-api-key
ELEVENLABS_API_KEY=sk_...
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> The frontend runs fully standalone with rich demo data. The FastAPI backend is optional — ARIA falls back gracefully to its static knowledge base when offline.

---

## Demo Flow

1. **Landing** — problem statement and tech stack overview
2. **Org Chart** — full team view with conflict indicators and health scores
3. **Health** — drill into Jack Williams (41/100, shadow work flagged) and Carlos Rodriguez (burnout risk, 56h/week)
4. **Conflicts** — SEC-007 critical conflict, then "Decide Now" to resolve Redis vs Memcached in one click
5. **Shadow Topics** — SOC 2 Audit Readiness at urgency 96, audit in 19 days, no owner assigned
6. **Briefings** — ARIA-generated meeting summaries, action item tracking, auto board prep agenda
7. **ARIA** — open the voice assistant, ask *"Why is SEC-007 still open?"* and hear ElevenLabs speak the answer

---

*Built at a hackathon · March 2026*
