# AI Chief of Staff — Demo Script
**Total Runtime: ~10–12 minutes**

---

## RECOMMENDED FEATURE ORDER

> Reshuffled for maximum narrative impact. The flow moves from *hook → context → pain → intelligence → action*, building tension and payoff like a story.

1. Introduction + Landing Page
2. **ARIA Morning Brief** ← moved up as the opening hook
3. Org Map
4. Org Health
5. Conflicts
6. Decisions ← live approval moment (climax)
7. Shadow Topics
8. Knowledge Graph ← visual wow after the "why" is established
9. Briefings
10. **ARIA Close** ← book a meeting live (call to action)

---

---

# THE SCRIPT

---

## 1. INTRODUCTION (60 seconds)
**[ Stay on Landing Page ]**

---

"Let me introduce you to Grace Liu.

She's the CTO of Nexus Technologies — a fintech company, 18 engineers across 5 teams: Backend, Frontend, Infrastructure, Security, and QA.

Grace is good at her job. She's in the meetings, she reads the Slack threads, she signs off on the tickets. But here's the problem that every CTO faces at her scale —

**The decisions that matter most are the ones nobody tells her about.**

A security violation slips through code review. Two teams propose conflicting infrastructure standards. An engineer is quietly burning out. And Grace won't know any of it until it's already a crisis.

Today is Monday, March 2nd, 2026. And there are three critical things happening right now that Grace doesn't know about.

This platform is her AI Chief of Staff — it reads every PR, every ticket, every meeting transcript, and surfaces what matters, before it becomes a problem.

Let me show you how it starts Grace's day."

---

## 2. ARIA — MORNING BRIEF (90 seconds)
**[ Click the floating ARIA orb, bottom-right corner ]**
**[ Click "Morning Brief" button ]**

---

"The first thing Grace does every morning is open ARIA — her AI executive assistant, powered by ElevenLabs and GPT-4.

She doesn't read through 47 Slack notifications. She doesn't manually triage Jira. She just asks ARIA.

[ *Wait for ARIA to respond and speak aloud* ]

In under 60 seconds, ARIA has told Grace:
- There's a critical security violation live in production — **three endpoints are using Basic Auth**, which directly violates her own OAuth 2.0 policy
- The Redis vs Memcached decision is now 14 days overdue
- **Carlos Rodriguez is working 56-hour weeks** and is carrying two blocked tickets
- The SOC 2 audit is in 18 days and compliance gaps haven't been briefed to her

None of this was in her calendar this morning.

Let's pull back and see the organisation this is happening inside."

---

## 3. ORG MAP (90 seconds)
**[ Navigate to /org-map ]**

---

"Here's Nexus Technologies — all 18 people, their reporting lines, their teams.

Grace at the top. Michael Park, VP Engineering. Rachel Foster, Head of Product. And below them, five teams doing the actual work.

But this isn't just an org chart. Watch what happens when you look at Jack Williams.

[ *Point to Jack Williams in the Frontend column — notice the orange highlight and alert* ]

Jack is the Frontend Lead. And right next to his name you can see: **2 decisions not escalated, 1 active conflict**.

That means Jack has made decisions — real, production-impacting decisions — without telling Grace. The platform caught this automatically by reading his PR activity and ticket updates.

[ *Click on Jack's card to open the detail modal* ]

You can see exactly what those decisions were, what tickets they're linked to, and who else is affected.

This is what Grace's org *actually* looks like — not the version in the HR system, but the version playing out in GitHub and Jira right now."

---

## 4. ORG HEALTH (2 minutes)
**[ Navigate to /health ]**

---

"Now let's look at how healthy this organisation actually is.

[ *Point to the top score ring* ]

Overall organisational health: **68 out of 100. Trending down.**

The platform tracks five pillars. Let me walk you through them quickly:

**Conflict Rate: 28 out of 100.** That's a red flag. Seven active conflicts across teams — that's unusually high for an 18-person org.

**Decision Velocity: 42 out of 100.** Decisions are taking an average of 8 days to close. That's slow. It means teams are blocked, waiting.

**Communication: 74. Knowledge Density: 35.** That gap is the real problem — people are talking, but the knowledge isn't moving between teams. Classic silo pattern.

Now scroll down — the tension hotspots.

[ *Scroll to Tension Hotspots section* ]

Six active conflicts, ranked by severity. At the top:

**CRITICAL: Security vs Frontend.** Three OAuth violations are live in production. Irene Garcia from Security flagged this. Jack's team shipped them without going through security review.

**HIGH: Backend vs Infrastructure.** Alice wants Redis. Bob wants Memcached. Both have escalated to Grace. Grace hasn't decided yet — and that stalemate is now 14 days old.

Scroll further — Employee Pulse.

[ *Scroll to Employee Pulse section* ]

Individual health scores for every person on the team. This is AI-generated from their GitHub activity, ticket velocity, and communication patterns.

Look at **Carlos Rodriguez: 58 out of 100.** The AI insight says: *'Carrying 2 blocked tickets, averaging 56 hours per week. Burnout risk escalating.'*

**Jack Williams: 41 out of 100.** *'Shadow work detected. Opened WEB-051 draft without escalating to leadership.'*

And here's the one that matters — **Grace Liu herself: 85 out of 100. Healthy.** But the AI notes she's *'unaware of WEB-051 draft fix and Basic Auth scope.'*

That's the gap this platform closes."

---

## 5. CONFLICTS (2 minutes)
**[ Navigate to /conflicts ]**

---

"Let's go deeper into those conflicts — because each one has a story.

[ *Point to first conflict card* ]

**Conflict 1: OAuth 2.0 versus Basic Auth. CRITICAL.**

Grace herself approved SEC-001 twenty-five days ago — OAuth 2.0 is mandatory across all endpoints. Jack's team then shipped three production endpoints using Basic Auth. PRs 267, 268, and 271. All merged. All in production right now.

The platform caught this not because anyone filed a bug report — it caught it because it read the PRs, compared them against the active security policy, and flagged the contradiction.

[ *Scroll to Conflict 2* ]

**Conflict 2: Redis versus Memcached. HIGH.**

Alice's team benchmarked Redis — 40% performance improvement, verified by QA. Bob's DevOps team has a standing Memcached standard. Both have escalated to Grace. Neither team can move forward until she decides.

And then there's this —

[ *Scroll to Conflict 3: Jack's Silent Remediation* ]

**Conflict 3: Jack's Silent Remediation. HIGH.**

Jack knows about the OAuth violation. So he started fixing it — he opened PR #294 as a draft. But he never linked it to SEC-007. He never told Irene. He never told Grace.

The platform found this because it watches for orphan PRs — work that's happening but isn't connected to the visible decision trail. This is what the platform calls a **shadow decision**.

Grace's security lead is blocked waiting for Frontend cooperation. Meanwhile, Frontend is quietly fixing the problem without coordinating with Security. That's how compliance gaps widen.

[ *Scroll to the Shadow Decisions section at the bottom* ]

Three shadow decisions total. Each one showing: who made it, when, what it affects, and — critically — **whether Grace was informed. All three: No.**"

---

## 6. DECISIONS — LIVE APPROVAL (90 seconds)
**[ Navigate to /decisions ]**

---

"Every decision this platform has tracked across emails, meetings, Jira, and GitHub lands here — the decision registry.

Five decisions are waiting for Grace's approval right now.

[ *Scroll to the Redis Caching Layer card and the Retain Memcached Standard card* ]

You can see both sides of the Redis versus Memcached debate sitting here, side by side. Alice's Redis proposal and Bob's Memcached retention — both marked AWAITING APPROVAL, both flagging that they conflict with each other.

Let's make the decision.

[ *Click 'Approve' on Redis Caching Layer — the interactive modal opens* ]

The modal shows Grace everything she needs: the performance data, the conflict, the affected teams, the linked tickets. She can approve Redis right here.

[ *Click Approve* ]

The moment she does that, the decision is logged with a timestamp, a confidence score, and the full decision chain. The conflict is marked resolved. Both teams get notified. The knowledge graph updates.

That's eight days of stalemate resolved in ten seconds."

---

## 7. SHADOW TOPICS (90 seconds)
**[ Navigate to /shadow-topics ]**

---

"Now here's where it gets interesting — because not every problem has a ticket.

Shadow Topics are themes the AI surfaces from the actual language people are using in Slack messages, PR comments, and meeting transcripts. These are the conversations happening in DMs that never make it into a formal report.

[ *Point to the first card: SOC 2 Audit Readiness* ]

**SOC 2 Audit Readiness. Topic strength: 96. Status: Urgent. 19 days active.**

The AI has detected this theme spreading across 4 messages — Irene flagging compliance gaps in Slack DMs, engineers asking about audit timelines, incomplete checklists referenced in PRs. None of this was formally escalated.

The audit is scheduled for March 20th. That's 18 days away. Grace has not been briefed on the readiness gaps.

This is the kind of thing that kills a company's SOC 2 certification — not because no one knew about it, but because the people who knew about it assumed someone else was escalating it.

[ *Point to the third card: Caching Ownership* ]

**Caching Ownership. Status: Ownership Ambiguity.**

Backend thinks they own caching configuration. Infrastructure thinks they own it. The platform detected this from language patterns in the Redis and Memcached tickets — phrases like 'that's your team's call' appearing from both sides.

No one filed a conflict ticket for this. The AI found it because it was reading between the lines."

---

## 8. KNOWLEDGE GRAPH (90 seconds)
**[ Navigate to /graph ]**

---

"Everything you've seen so far — the people, the tickets, the decisions, the conflicts, the policies — the platform holds all of it as a connected knowledge graph.

[ *Let the graph render, then zoom into the centre* ]

Every node is an entity: people, tickets, pull requests, decisions, policies. Every edge is a relationship.

But look at these edges — the **red dashed ones**.

[ *Point to the VIOLATES edges from WEB-045, WEB-046, WEB-047 connecting to SEC-STD-012* ]

These are VIOLATES relationships. WEB-045, WEB-046, WEB-047 — Jack's three merged PRs — all connecting to SEC-STD-012, the OAuth 2.0 mandate. The platform drew these connections automatically by reading the code and the policy.

Now look at PR #294 — Jack's draft fix.

[ *Point to PR #294 / WEB-051* ]

Notice what it's NOT connected to. It's not linked to SEC-007, the security ticket. It's not connected to Irene's investigation. It's an isolated node — orphaned work, visible in the graph but invisible to everyone except the AI.

This graph is queryable. You can time-travel — ask what the graph looked like two weeks ago before these PRs were merged. You can see exactly when the violation was introduced and who touched it.

This is organisational memory that doesn't disappear when someone changes teams."

---

## 9. BRIEFINGS (90 seconds)
**[ Navigate to /briefings ]**

---

"ARIA doesn't just answer questions — she attends meetings.

[ *Point to the Sprint 3 Retrospective card* ]

Last Friday, February 28th: Grace, Michael, Alice, Bob, and Irene were in the Sprint 3 Retrospective. ARIA was there too — not as a participant, but as an intelligence layer sitting on top of the transcript.

[ *Click into the meeting to expand it* ]

From that one meeting, the platform extracted:

**Decisions made** — 'CTO decision on Redis vs Memcached needed by March 3rd.' That deadline was yesterday.

**Action items with owners** — Carlos to finalise Redis cluster config by March 5th. Grace to schedule a decision meeting with Bob and Alice.

**Risks flagged** — Carlos's burnout risk. The SOC 2 audit with 18 days remaining and unfilled compliance gaps.

These were all said in that meeting. But without this system, they would have lived in a meeting notes doc that nobody reads, and the action items would have quietly slipped.

ARIA turns meetings from information sinks into intelligence. Every commitment, every risk, every decision — captured, attributed, and tracked."

---

## 10. ARIA — CLOSE (60 seconds)
**[ Click the ARIA orb to re-open the assistant ]**

---

"Let's bring it back to Grace.

She's seen everything now. She knows about the security violation. She knows Carlos is burning out. She's just approved Redis. She knows the SOC 2 audit is in 18 days.

What does she do first?

[ *Type or speak into ARIA: 'Book SEC-007 meeting with Jack and Irene' ]**

[ *Wait for ARIA to confirm the booking and show the booking card* ]

[ *Click Confirm on the booking card* ]

Meeting booked. Jack and Irene. Linked to SEC-007. Added to Grace's calendar. The action is logged.

[ *Optional: Ask ARIA — 'What should I do about Carlos?' ]**

Grace now has full organisational visibility — not from reading dashboards for an hour, but from a 60-second morning brief and one natural-language command.

This is what an AI Chief of Staff looks like.

It doesn't replace leadership. It gives leaders the information they need to lead well."

---

---

## CLOSING LINE (Optional, if needed)

*"Every organisation has decisions being made that leadership doesn't know about. Every team has a Carlos burning out quietly. Every codebase has a Jack working around a process he doesn't want to escalate.*

*The AI Chief of Staff makes the invisible visible — before it becomes a crisis."*

---

---

## QUICK REFERENCE — KEY FACTS TO REMEMBER

| Fact | Detail |
|------|--------|
| Company | Nexus Technologies (fintech) |
| CTO | Grace Liu |
| Team size | 18 engineers, 5 teams |
| Org health score | 68/100, trending down |
| Active conflicts | 6 |
| Security violation | 3 Basic Auth endpoints violating SEC-001 (OAuth mandate) |
| Redis vs Memcached | 14-day stalemate, both escalated to Grace |
| Shadow decisions | 3 (Jack x2, Bob x1) — none escalated to Grace |
| Carlos's hours | 56h/week, burnout risk, 2 blocked tickets |
| Jack's health score | 41/100 |
| SOC 2 audit | March 20, 2026 — 18 days away |
| Grace's health score | 85/100 — but unaware of key issues |
| Key ticket | SEC-007 (CRITICAL, Grace doesn't know it exists) |
| Jack's secret PR | PR #294 / WEB-051 — draft, not linked to SEC-007, not escalated |

---

## PAGE NAVIGATION CHEATSHEET

| Section | URL | Time |
|---------|-----|------|
| Landing Page | `/` | 0:00 |
| ARIA Morning Brief | Click orb (any page) | 1:00 |
| Org Map | `/org-map` | 2:30 |
| Org Health | `/health` | 4:00 |
| Conflicts | `/conflicts` | 6:00 |
| Decisions | `/decisions` | 8:00 |
| Shadow Topics | `/shadow-topics` | 9:30 |
| Knowledge Graph | `/graph` | 11:00 |
| Briefings | `/briefings` | 12:30 |
| ARIA Close | Click orb (any page) | 14:00 |
