'use client';

import React, { useState } from 'react';
import {
  Box, Text, VStack, HStack, Avatar, Flex, Icon,
  Tabs, TabList, Tab, TabPanels, TabPanel,
} from '@chakra-ui/react';
import {
  FiMic, FiClock, FiCalendar, FiCheckSquare,
  FiAlertCircle, FiCpu, FiList, FiArrowRight,
  FiUsers, FiRadio, FiZap,
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Attendee { name: string; role: string; }
interface TranscriptLine { time: string; speaker: string; role: string; content: string; isAria?: boolean; }
interface ActionItem { task: string; owner: string; deadline: string; priority: 'high' | 'medium' | 'low'; }
interface Decision { text: string; owner: string; }
interface Risk { text: string; severity: 'critical' | 'high' | 'medium'; }
interface AgendaItem { title: string; duration: string; owner: string; context: string; }
interface AriaBrief {
  summary: string;
  decisions: Decision[];
  actionItems: ActionItem[];
  risks: Risk[];
  preparedAgenda: AgendaItem[];
}
interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  status: 'completed' | 'live' | 'scheduled';
  attendees: Attendee[];
  topicTags: string[];
  transcript: TranscriptLine[];
  ariaBrief: AriaBrief;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const AVATAR_COLORS: Record<string, string> = {
  'Grace Liu': '#7C3AED', 'Irene Garcia': '#DC2626', 'Alice Chen': '#2563EB',
  'Bob Martinez': '#D97706', 'Carlos Rodriguez': '#059669', 'Jack Williams': '#6D28D9',
  'Marcus Thompson': '#7C3AED', 'Emma Wilson': '#DB2777', 'Leo Zhang': '#0891B2',
  'Michael Park': '#374151', 'David Kim': '#1D4ED8', 'Sarah Okafor': '#B45309',
  'James Liu': '#166534', 'ARIA': '#8B5CF6',
};

const meetings: Meeting[] = [
  // ── Meeting 1: Q2 Engineering Roadmap ──────────────────────────────────────
  {
    id: 1,
    title: 'Q2 Engineering Roadmap Planning',
    date: 'Feb 27, 2026',
    time: '10:00 AM',
    duration: '52 min',
    status: 'completed',
    topicTags: ['Q2 Roadmap', 'Redis Migration', 'SEC Compliance', 'Capacity'],
    attendees: [
      { name: 'Grace Liu', role: 'CTO' },
      { name: 'Michael Park', role: 'VP Engineering' },
      { name: 'Alice Chen', role: 'Backend Lead' },
      { name: 'Bob Martinez', role: 'DevOps Lead' },
      { name: 'Jack Williams', role: 'Frontend Lead' },
      { name: 'Irene Garcia', role: 'Security Lead' },
    ],
    transcript: [
      { time: '10:01', speaker: 'Grace Liu', role: 'CTO', content: 'Q2 starts in 4 days. I want to leave today with a clear priority stack and a decision on the two critical blockers — Redis migration and the SEC compliance timeline. Let\'s go.' },
      { time: '10:03', speaker: 'Michael Park', role: 'VP Engineering', content: 'Before we get to Q2, I need to flag that Carlos Rodriguez has 3 tickets blocked and logged 56 hours this week. The INFRA approval bottleneck has to be first on the agenda — it\'s becoming a people problem.' },
      { time: '10:05', speaker: 'Alice Chen', role: 'Backend Lead', content: 'Completely agree. QA-034 is conclusive — Redis wins on every metric. INFRA-024 has been waiting 14 days. I need a decision to unblock David and Carlos before we plan anything for Q2.' },
      { time: '10:08', speaker: 'Bob Martinez', role: 'DevOps Lead', content: 'I\'m not blocking for the sake of it. Our entire runbook library, PagerDuty setup, and on-call training is built around Memcached. If we switch mid-sprint we lose observability on the cache layer until monitoring catches up. That\'s a real production risk.' },
      { time: '10:10', speaker: 'Grace Liu', role: 'CTO', content: 'Bob, I\'ve read QA-034. A 43% throughput improvement and 93% better eviction rate are too significant to ignore. What specifically do you need to feel confident about the migration?' },
      { time: '10:13', speaker: 'Bob Martinez', role: 'DevOps Lead', content: 'Two things: Redis-specific alerting in PagerDuty before we cut over, and the ops runbooks updated for the new system. Realistically that\'s 2–3 weeks of prep work.' },
      { time: '10:15', speaker: 'Alice Chen', role: 'Backend Lead', content: 'David\'s dual-write strategy means we can run Redis alongside Memcached for two weeks and build monitoring in parallel. No production risk during transition — if Redis shows problems, we flip reads back in under 5 minutes.' },
      { time: '10:17', speaker: 'Grace Liu', role: 'CTO', content: 'That works. Decision: Redis is approved for transaction query caching. Bob — update INFRA-STD-001 by end of day. Alice — INFRA-024 is unblocked as of right now. Carlos can start the migration work.' },
      { time: '10:20', speaker: 'Jack Williams', role: 'Frontend Lead', content: 'On the frontend side — I have 6 tickets queued that depend on the new auth standard. SEC-STD-012 is clear, but I need Security sign-off on my OAuth implementation before we can ship any of them.' },
      { time: '10:22', speaker: 'Irene Garcia', role: 'Security Lead', content: 'Jack — we need to establish the right protocol. Any auth-related PR needs Security review listed in the PR description, not requested after the fact. What\'s the current state of your OAuth implementation?' },
      { time: '10:24', speaker: 'Jack Williams', role: 'Frontend Lead', content: 'Draft is complete. I\'ll post it to #sec-alerts within the hour for formal review.' },
      { time: '10:26', speaker: 'Irene Garcia', role: 'Security Lead', content: 'Good. I\'ll prioritize it. We cannot enter Q2 with any Basic Auth exposure. If it\'s clean, I can turn review around by tomorrow morning.' },
      { time: '10:31', speaker: 'Michael Park', role: 'VP Engineering', content: 'With the INFRA blocker resolved, we have capacity for all three Q2 priorities. The risk is if SEC-007 closure drags into Week 2 — that compresses everything else.' },
      { time: '10:35', speaker: 'Alice Chen', role: 'Backend Lead', content: 'One more thing — Carlos\'s workload. He\'s been carrying the INFRA deadlock stress on top of full sprint capacity. Can we make sure he\'s not the last to know about decisions that directly affect his tickets?' },
      { time: '10:37', speaker: 'Michael Park', role: 'VP Engineering', content: 'I\'ll do a 1:1 with Carlos today. He\'ll hear about the INFRA-024 approval directly from me, not via Slack.' },
      { time: '10:38', speaker: 'Grace Liu', role: 'CTO', content: 'Good. Action items locked: Bob — INFRA-STD-001 by EOD. Jack — PR to #sec-alerts within the hour. Michael — 1:1 with Carlos today. Alice — unblock INFRA-024 and set David\'s priorities. Irene — SEC review of Jack\'s PR by tomorrow.' },
    ],
    ariaBrief: {
      summary: 'Q2 roadmap planning resolved both critical blockers in under 40 minutes. Redis migration is formally approved with Bob Martinez\'s dual-write safety model accepted; Carlos Rodriguez\'s 3 blocked tickets are immediately unblocked. SEC-STD-012 compliance process formalized — Jack Williams will post OAuth PR to Security within the hour.',
      decisions: [
        { text: 'Redis approved for transaction query caching with dual-write transition strategy', owner: 'Grace Liu' },
        { text: 'INFRA-STD-001 must be updated to reflect Redis as approved standard by EOD Feb 27', owner: 'Bob Martinez' },
        { text: 'Q2 top-3 priorities: (1) SEC-007 closure (2) Redis migration to production (3) CORE-078 delivery', owner: 'Grace Liu' },
        { text: 'All auth-related PRs must include Security review request in PR description — not post-facto', owner: 'Irene Garcia' },
      ],
      actionItems: [
        { task: 'Update INFRA-STD-001 to reflect Redis as approved caching standard', owner: 'Bob Martinez', deadline: 'EOD Feb 27', priority: 'high' },
        { task: 'Post OAuth implementation PR (#draft) to #sec-alerts for Security review', owner: 'Jack Williams', deadline: 'Within 1 hour', priority: 'high' },
        { task: '1:1 with Carlos Rodriguez — inform him of INFRA-024 unblock directly', owner: 'Michael Park', deadline: 'Today Feb 27', priority: 'high' },
        { task: 'Formally unblock INFRA-024 and set David Kim\'s Sprint 3 priorities', owner: 'Alice Chen', deadline: 'Today Feb 27', priority: 'high' },
        { task: 'Security review of Jack\'s OAuth PR and sign-off', owner: 'Irene Garcia', deadline: 'Feb 28 morning', priority: 'high' },
        { task: 'Draft Q2 Redis migration timeline and share with DevOps + Backend', owner: 'David Kim', deadline: 'Mar 1', priority: 'medium' },
      ],
      risks: [
        { text: 'SEC-007 closure may slip to Week 2 of Q2, compressing CORE-078 delivery window', severity: 'high' },
        { text: 'Carlos Rodriguez burnout risk — 56h/wk logged, 3 blocked tickets for 14 days', severity: 'high' },
        { text: 'Redis monitoring gap during dual-write transition if alerting setup is delayed', severity: 'medium' },
      ],
      preparedAgenda: [
        { title: 'SEC-007 status check — has PR #294 merged?', duration: '10 min', owner: 'Irene Garcia', context: 'Merge was targeted for Mar 1 after Security sign-off and QA regression. Verify production deployment and ticket closure.' },
        { title: 'INFRA-STD-001 update confirmation', duration: '5 min', owner: 'Bob Martinez', context: 'Bob committed to EOD Feb 27 update. Confirm document is published and Carlos + David have been notified.' },
        { title: 'Redis migration Week 1 progress', duration: '15 min', owner: 'David Kim + Carlos Rodriguez', context: 'PagerDuty alerting spec (Leo Zhang) and dual-write code should be in progress. Verify timelines and blockers.' },
        { title: 'Carlos Rodriguez capacity check-in', duration: '10 min', owner: 'Michael Park', context: 'Following up on the 1:1 commitment. Is Carlos at a sustainable pace? Any new blockers introduced?' },
        { title: 'Q2 Week 1 delivery status vs plan', duration: '15 min', owner: 'All leads', context: 'First week of Q2. Are the three priorities on track? Early warning on any slippage.' },
      ],
    },
  },

  // ── Meeting 2: SEC-007 Emergency Response ──────────────────────────────────
  {
    id: 2,
    title: 'SEC-007 Emergency Response',
    date: 'Mar 1, 2026',
    time: '9:30 AM',
    duration: '38 min',
    status: 'completed',
    topicTags: ['P0 Incident', 'Basic Auth', 'PR #294', 'Production Freeze'],
    attendees: [
      { name: 'Grace Liu', role: 'CTO' },
      { name: 'Irene Garcia', role: 'Security Lead' },
      { name: 'Marcus Thompson', role: 'Security Engineer' },
      { name: 'Jack Williams', role: 'Frontend Lead' },
      { name: 'Emma Wilson', role: 'QA Engineer' },
    ],
    transcript: [
      { time: '9:30', speaker: 'Grace Liu', role: 'CTO', content: 'This meeting is P0. SEC-007 has been open 17 days. I found out this morning via QA-037 that this is actively exploitable in production. I need a resolution plan on the table in 30 minutes — not a status update, a plan.' },
      { time: '9:32', speaker: 'Irene Garcia', role: 'Security Lead', content: 'I\'ve been escalating internally for a week. Marcus\'s audit uncovered PR #294 — Jack\'s fix — which was never shared with my team. On a CRITICAL security ticket, that cannot happen. I need to say that clearly before we move to resolution.' },
      { time: '9:34', speaker: 'Jack Williams', role: 'Frontend Lead', content: 'I understand. I was trying to fix it quickly without causing sprint disruption and that was the wrong call. PR #294 is fully coded, the OAuth implementation is complete, and it\'s ready for review today.' },
      { time: '9:36', speaker: 'Marcus Thompson', role: 'Security Engineer', content: 'I reviewed PR #294 this morning. The implementation is correct and meets SEC-STD-012. Three things need to happen before merge: (1) formal re-link from WEB-051 to SEC-007, (2) Security sign-off from Irene, (3) QA regression on WEB-045, WEB-046, WEB-047. With parallel tracks, 4 hours total.' },
      { time: '9:39', speaker: 'Grace Liu', role: 'CTO', content: 'Production freeze on WEB-045, WEB-046, WEB-047 effective immediately. No deployments on those endpoints until SEC-007 is resolved. Jack — re-link PR #294 to SEC-007 right now.' },
      { time: '9:41', speaker: 'Jack Williams', role: 'Frontend Lead', content: 'Done. Re-linked to SEC-007. WEB-051 removed from PR.' },
      { time: '9:43', speaker: 'Irene Garcia', role: 'Security Lead', content: 'I\'ll start the formal Security review now. Marcus, I need you on the token expiration and refresh flow — that\'s the highest-risk section. If we split the PR review, I can have sign-off by 12 PM.' },
      { time: '9:44', speaker: 'Marcus Thompson', role: 'Security Engineer', content: 'I\'m on it. Auth flow validation, token scope enforcement, refresh token rotation. I\'ll focus there. We can have a joint sign-off by noon.' },
      { time: '9:46', speaker: 'Emma Wilson', role: 'QA Engineer', content: 'I\'ll run QA-037 regression against PR #294 as soon as Security clears it. Full auth regression suite is about 90 minutes. If I start by 1 PM, I can have results by 2:30 PM.' },
      { time: '9:48', speaker: 'Grace Liu', role: 'CTO', content: 'Locked: Security sign-off by 12 PM, QA starts 1 PM, results by 2:30 PM. I want a go/no-go for production merge by 3 PM. If we merge by 4 PM, SEC-007 closes today. I\'ll monitor personally.' },
      { time: '9:50', speaker: 'Irene Garcia', role: 'Security Lead', content: 'One process point going forward: any PR touching authentication must be filed under the relevant security ticket from the first commit. I\'m adding this as a required field in JIRA — Security ticket link is mandatory for auth PRs.' },
      { time: '9:52', speaker: 'Jack Williams', role: 'Frontend Lead', content: 'Fully agree. I\'ll also document the OAuth implementation pattern after this is merged — the team needs a clear template for Q2 auth work so we don\'t run into this again.' },
      { time: '9:54', speaker: 'Grace Liu', role: 'CTO', content: 'Marcus — please send me a written summary of the QA-037 findings before 11 AM. I\'m briefing the board on our security posture next Thursday and this incident needs to be included with the resolution.' },
      { time: '9:56', speaker: 'Marcus Thompson', role: 'Security Engineer', content: 'I\'ll have it in your inbox by 10:30 AM.' },
      { time: '9:57', speaker: 'Grace Liu', role: 'CTO', content: 'Good. Last point — I want to acknowledge Jack for building the fix even under pressure, and Irene and Marcus for catching this through the audit process. The disclosure process broke down, but the underlying intent was right. We fix the process, not the people.' },
    ],
    ariaBrief: {
      summary: 'SEC-007 emergency response produced a concrete same-day resolution plan. Production freeze enacted on three vulnerable endpoints. PR #294 (OAuth remediation) enters formal Security review immediately, with QA regression to follow — targeting SEC-007 closure by 4 PM today. A new mandatory JIRA field for auth PRs prevents recurrence.',
      decisions: [
        { text: 'Production freeze on WEB-045, WEB-046, WEB-047 until SEC-007 resolved', owner: 'Grace Liu' },
        { text: 'PR #294 formally re-linked to SEC-007 (removed from WEB-051)', owner: 'Jack Williams' },
        { text: 'New JIRA mandatory field: Security ticket link required on all auth-related PRs', owner: 'Irene Garcia' },
        { text: 'SEC-007 targeted for full closure same day (Mar 1, 2026) by 4 PM', owner: 'Grace Liu' },
      ],
      actionItems: [
        { task: 'Security review of PR #294 — auth flow, token expiration, scope enforcement', owner: 'Irene Garcia + Marcus Thompson', deadline: '12:00 PM Mar 1', priority: 'high' },
        { task: 'QA regression suite (QA-037) against PR #294', owner: 'Emma Wilson', deadline: '2:30 PM Mar 1', priority: 'high' },
        { task: 'Written QA-037 findings summary for board briefing', owner: 'Marcus Thompson', deadline: '10:30 AM Mar 1', priority: 'high' },
        { task: 'OAuth implementation pattern document for team template', owner: 'Jack Williams', deadline: 'Mar 5', priority: 'medium' },
        { task: 'Add mandatory Security ticket link field to JIRA auth PR workflow', owner: 'Irene Garcia', deadline: 'Mar 3', priority: 'medium' },
      ],
      risks: [
        { text: 'QA regression may find defects in PR #294, pushing resolution past today\'s 4 PM target', severity: 'medium' },
        { text: 'WEB-045/046/047 production freeze creates frontend feature freeze for Jack\'s team', severity: 'medium' },
        { text: 'Board briefing scheduled for next week — SEC-007 must be closed before that date', severity: 'high' },
      ],
      preparedAgenda: [
        { title: 'SEC-007 closure confirmation', duration: '5 min', owner: 'Irene Garcia', context: 'Confirm PR #294 merged to production and WEB-045/046/047 production freeze lifted. Verify SEC-007 ticket is fully closed.' },
        { title: 'QA-037 findings report review', duration: '10 min', owner: 'Marcus Thompson', context: 'Marcus sent written report by 10:30 AM. Review key findings before the board briefing and confirm nothing requires further escalation.' },
        { title: 'Auth PR process rollout', duration: '10 min', owner: 'Irene Garcia', context: 'New JIRA mandatory field for auth PRs. Confirm it\'s configured and all leads have been notified. Any team training required?' },
        { title: 'OAuth template document review', duration: '10 min', owner: 'Jack Williams', context: 'Jack committed to documenting OAuth pattern for Q2 reuse. Review draft and ensure it covers all SEC-STD-012 requirements.' },
        { title: 'Post-incident retrospective: process improvements', duration: '15 min', owner: 'Grace Liu', context: 'Structured review of what broke down in the SEC-007 disclosure process. Agree on 2-3 systemic fixes beyond the JIRA field.' },
      ],
    },
  },

  // ── Meeting 3: Redis Architecture Decision ─────────────────────────────────
  {
    id: 3,
    title: 'Redis vs Memcached — Architecture Decision',
    date: 'Feb 25, 2026',
    time: '2:00 PM',
    duration: '61 min',
    status: 'completed',
    topicTags: ['Architecture', 'Redis', 'Memcached', 'INFRA-024', 'Performance'],
    attendees: [
      { name: 'Alice Chen', role: 'Backend Lead' },
      { name: 'Bob Martinez', role: 'DevOps Lead' },
      { name: 'David Kim', role: 'Backend Engineer' },
      { name: 'Carlos Rodriguez', role: 'DevOps Engineer' },
      { name: 'Leo Zhang', role: 'QA Lead' },
    ],
    transcript: [
      { time: '2:00', speaker: 'Alice Chen', role: 'Backend Lead', content: 'Thanks for joining. Goal today: reach a final recommendation on Redis vs Memcached or escalate to Grace with a clear position. We have QA-034 — Leo, walk us through the numbers.' },
      { time: '2:02', speaker: 'Leo Zhang', role: 'QA Lead', content: 'QA-034 ran 72 hours on staging at production traffic patterns — 10k RPS sustained. Redis P99 latency: 2.1ms. Memcached P99: 3.5ms. Cache eviction rate: Redis 0.3%, Memcached 4.1%. CPU at peak: Redis 42%, Memcached 61%. Redis outperforms on every metric at our load profile.' },
      { time: '2:05', speaker: 'Bob Martinez', role: 'DevOps Lead', content: 'I\'m not disputing the benchmark. My concern is operational continuity: 8 years of Memcached runbooks, PagerDuty integrations, and on-call training. Switching mid-year creates a real gap in our ops capability until monitoring catches up.' },
      { time: '2:08', speaker: 'David Kim', role: 'Backend Engineer', content: 'I\'ve been working on a dual-write migration plan. We write to both Memcached and Redis simultaneously for 2 weeks. Cache reads stay on Memcached. At the two-week mark, we flip reads to Redis. Safety valve: if anything goes wrong, reads flip back in under 5 minutes.' },
      { time: '2:11', speaker: 'Carlos Rodriguez', role: 'DevOps Engineer', content: 'I need to understand the ops gap specifically. If I\'m the one implementing this, what does the monitoring coverage look like during the transition window?' },
      { time: '2:13', speaker: 'Bob Martinez', role: 'DevOps Lead', content: 'Right now PagerDuty has 14 Memcached alerts: memory pressure, connection pool exhaustion, eviction spike, replication lag. We\'d need equivalent Redis alerts before I\'m comfortable with production traffic on Redis reads.' },
      { time: '2:15', speaker: 'Alice Chen', role: 'Backend Lead', content: 'How long to build Redis alerting from scratch?' },
      { time: '2:17', speaker: 'Bob Martinez', role: 'DevOps Lead', content: 'Realistically, 3–4 days of focused work. If Carlos handles the PagerDuty config while David codes the dual-write layer, we could have both ready within one sprint.' },
      { time: '2:19', speaker: 'Carlos Rodriguez', role: 'DevOps Engineer', content: 'I can do PagerDuty config. Give me 2 days for the initial alert set. I want Leo to sign off on the thresholds so they\'re actually calibrated to our production patterns.' },
      { time: '2:21', speaker: 'Leo Zhang', role: 'QA Lead', content: 'I\'ll write the alert threshold spec based on QA-034 data — we have real P99 numbers and eviction rates now, so thresholds can be precise rather than guesswork. Spec ready by tomorrow.' },
      { time: '2:26', speaker: 'Bob Martinez', role: 'DevOps Lead', content: 'I can accept that sequence. My formal objection has always been about going into dual-write *without* alerting in place. If alerting comes first, then dual-write, I\'m on board with Redis.' },
      { time: '2:28', speaker: 'Alice Chen', role: 'Backend Lead', content: 'That\'s the sequence then. Carlos — does this work with your current capacity?' },
      { time: '2:30', speaker: 'Carlos Rodriguez', role: 'DevOps Engineer', content: 'It works if INFRA-024 is formally approved so I can start. Right now I can\'t touch anything on the Redis side without a go-ahead. I\'ve been blocked for 14 days.' },
      { time: '2:32', speaker: 'Alice Chen', role: 'Backend Lead', content: 'That approval needs to come from Grace or Michael — it\'s above this group\'s authority. We should escalate with our aligned recommendation after this meeting.' },
      { time: '2:34', speaker: 'Bob Martinez', role: 'DevOps Lead', content: 'Carlos — I can unblock the alerting prep work right now. That\'s pure DevOps work, doesn\'t require INFRA-024. Start on the PagerDuty config today using the Memcached setup as the template.' },
      { time: '2:40', speaker: 'Bob Martinez', role: 'DevOps Lead', content: 'I want to be clear in our recommendation: my objection was process-based, not technical. The data supports Redis. Alice — please reflect that in the escalation doc.' },
      { time: '2:48', speaker: 'David Kim', role: 'Backend Engineer', content: 'One thing worth highlighting: the dual-write approach gives us 2 weeks of real production data on Redis before we fully commit. That\'s actually stronger risk management than benchmark data alone.' },
      { time: '2:54', speaker: 'Carlos Rodriguez', role: 'DevOps Engineer', content: 'Thank you for actually listening to the operational concerns before making a decision. I\'ve been feeling like the engineering process was being pushed past the people who have to implement it.' },
    ],
    ariaBrief: {
      summary: 'Architecture debate reached consensus after 61 minutes. All five stakeholders aligned on Redis adoption with a phased, operations-first approach: alerting setup precedes dual-write, dual-write precedes cutover. Bob Martinez\'s objection was process-based, not technical — the data is unambiguous. Formal CTO approval still required to unblock INFRA-024.',
      decisions: [
        { text: 'Redis recommended as replacement for Memcached transaction query caching', owner: 'Alice Chen (escalation to Grace Liu)' },
        { text: 'Migration sequence: (1) alerting setup → (2) dual-write 2 weeks → (3) read cutover', owner: 'Bob Martinez + Alice Chen' },
        { text: 'PagerDuty alert threshold spec to be based on QA-034 production metrics', owner: 'Leo Zhang' },
        { text: 'Carlos Rodriguez can begin alerting config work today without waiting for INFRA-024', owner: 'Bob Martinez' },
      ],
      actionItems: [
        { task: 'Write Redis alert threshold spec based on QA-034 production data', owner: 'Leo Zhang', deadline: 'Feb 26', priority: 'high' },
        { task: 'Begin PagerDuty Redis alerting configuration using Memcached template', owner: 'Carlos Rodriguez', deadline: 'Feb 27', priority: 'high' },
        { task: 'Draft Redis migration recommendation document and share with team for review', owner: 'Alice Chen', deadline: 'EOD Feb 25', priority: 'high' },
        { task: 'Code dual-write migration layer (write to both Memcached + Redis)', owner: 'David Kim', deadline: 'Mar 3', priority: 'medium' },
        { task: 'Write operational risk section for escalation document', owner: 'Bob Martinez', deadline: 'Feb 26', priority: 'medium' },
      ],
      risks: [
        { text: 'INFRA-024 still requires CTO/VP approval — Carlos is blocked on the migration itself until then', severity: 'high' },
        { text: 'Carlos is operating at 56h/week — alerting setup adds scope to an already stressed engineer', severity: 'high' },
        { text: 'Redis alerting gap risk during dual-write if Leo\'s threshold spec is delayed', severity: 'medium' },
      ],
      preparedAgenda: [
        { title: 'INFRA-024 approval status', duration: '5 min', owner: 'Alice Chen', context: 'Escalation doc was sent to Grace Liu and Michael Park on Feb 26. Has a formal decision been issued? Carlos is blocked until this is resolved.' },
        { title: 'Leo\'s alert threshold spec review', duration: '15 min', owner: 'Leo Zhang', context: 'Spec was due Feb 26. Review the proposed Redis alert thresholds against QA-034 baselines and get Bob\'s sign-off before Carlos starts PagerDuty config.' },
        { title: 'Dual-write code progress update', duration: '10 min', owner: 'David Kim', context: 'Dual-write layer development started. What\'s the completion estimate? Any blockers or design questions?' },
        { title: 'Carlos capacity check', duration: '10 min', owner: 'Bob Martinez', context: 'Carlos flagged workload stress. With alerting added to his backlog, is he still sustainable? Does anything need to be reprioritized?' },
      ],
    },
  },

  // ── Meeting 4: Sprint 3 Retrospective ──────────────────────────────────────
  {
    id: 4,
    title: 'Sprint 3 Retrospective',
    date: 'Feb 24, 2026',
    time: '4:00 PM',
    duration: '45 min',
    status: 'completed',
    topicTags: ['Retrospective', 'Process', 'Team Health', 'Sprint 4 Planning'],
    attendees: [
      { name: 'Michael Park', role: 'VP Engineering' },
      { name: 'Alice Chen', role: 'Backend Lead' },
      { name: 'Bob Martinez', role: 'DevOps Lead' },
      { name: 'Carlos Rodriguez', role: 'DevOps Engineer' },
      { name: 'David Kim', role: 'Backend Engineer' },
      { name: 'Jack Williams', role: 'Frontend Lead' },
      { name: 'Emma Wilson', role: 'QA Engineer' },
      { name: 'Leo Zhang', role: 'QA Lead' },
      { name: 'Marcus Thompson', role: 'Security Engineer' },
    ],
    transcript: [
      { time: '4:00', speaker: 'Michael Park', role: 'VP Engineering', content: 'Sprint 3 retro — let\'s be honest today. What went well? I\'ll go around.' },
      { time: '4:02', speaker: 'Leo Zhang', role: 'QA Lead', content: 'QA-034 was a success. Solid benchmarking methodology, results everyone can trust. The new staging environment really showed what we can do at scale.' },
      { time: '4:03', speaker: 'Emma Wilson', role: 'QA Engineer', content: 'The QA regression framework we rebuilt — QA-037 ran in 90 minutes. Six months ago that would have taken 3 days manually. The investment paid off.' },
      { time: '4:05', speaker: 'David Kim', role: 'Backend Engineer', content: 'The dual-write strategy design came together well. Good collaborative discussion between Backend and DevOps.' },
      { time: '4:06', speaker: 'Marcus Thompson', role: 'Security Engineer', content: 'The SEC-002 audit was uncomfortable but it caught something real and critical. That\'s what audits are for.' },
      { time: '4:08', speaker: 'Michael Park', role: 'VP Engineering', content: 'Good. What didn\'t go well?' },
      { time: '4:10', speaker: 'Carlos Rodriguez', role: 'DevOps Engineer', content: 'I\'ll be direct: the INFRA decision deadlock. 3 tickets blocked for 2 weeks while I waited for a policy decision from above. 56 hours this week, most of it blocked or context-switching. That is not sustainable.' },
      { time: '4:12', speaker: 'Bob Martinez', role: 'DevOps Lead', content: 'Fair, and that\'s on me too. I should have escalated the Memcached vs Redis decision to Grace much earlier instead of trying to hold the line at the DevOps level.' },
      { time: '4:14', speaker: 'Irene Garcia', role: 'Security Lead', content: 'The SEC-007 disclosure process. A critical security issue was open 17 days and I found out about the remediation PR through a security audit — not from the team who wrote it.' },
      { time: '4:16', speaker: 'Jack Williams', role: 'Frontend Lead', content: 'That\'s on me. I prioritized speed over the correct process and that was wrong. I should have filed PR #294 under SEC-007 from day one.' },
      { time: '4:18', speaker: 'Alice Chen', role: 'Backend Lead', content: 'Cross-team communication in general. Backend, DevOps, and Security were all working on pieces of the same problem in complete isolation. We didn\'t have shared visibility on blockers.' },
      { time: '4:20', speaker: 'Michael Park', role: 'VP Engineering', content: 'What do we change for Sprint 4?' },
      { time: '4:22', speaker: 'Irene Garcia', role: 'Security Lead', content: 'Security review as part of sprint planning, not an afterthought. Any ticket touching authentication or data security must be flagged to Security before the sprint starts — not when the PR is already written.' },
      { time: '4:24', speaker: 'Bob Martinez', role: 'DevOps Lead', content: 'A weekly DevOps/Backend sync — 30 minutes, no formal agenda, just infrastructure status and blocker check. We\'d have caught the INFRA-024 deadlock in week one instead of week two.' },
      { time: '4:26', speaker: 'Alice Chen', role: 'Backend Lead', content: 'Agreed on the sync. I\'d also propose: any ticket blocked more than 3 days automatically escalates to VP level. Remove the social friction from asking for help.' },
      { time: '4:28', speaker: 'Carlos Rodriguez', role: 'DevOps Engineer', content: 'That 3-day rule would have saved me 2 weeks and about 20 hours of wasted context-switching.' },
      { time: '4:30', speaker: 'Michael Park', role: 'VP Engineering', content: '3-day escalation rule is policy starting Sprint 4. I\'ll write it up and share with all leads by tomorrow.' },
      { time: '4:34', speaker: 'Leo Zhang', role: 'QA Lead', content: 'QA should be in architectural decisions from the start, not brought in after design is locked. QA-034 should have been running in Sprint 1, not Sprint 3.' },
      { time: '4:36', speaker: 'Michael Park', role: 'VP Engineering', content: 'Agreed. QA joins the initial architecture review going forward — not just implementation review.' },
      { time: '4:38', speaker: 'Alice Chen', role: 'Backend Lead', content: 'Team health note: Carlos has been carrying too much. The blocked tickets weren\'t just frustrating — they were demoralizing. He needs a lighter Sprint 4 and some visible wins.' },
      { time: '4:40', speaker: 'Carlos Rodriguez', role: 'DevOps Engineer', content: 'I appreciate that. I just need decisions to be made faster. When I know what to build, I build it well. It\'s the waiting that kills.' },
      { time: '4:42', speaker: 'Michael Park', role: 'VP Engineering', content: 'Sprint 4 — Carlos gets the Redis migration as his primary focus. No new assignments without checking with me first. That\'s a commitment.' },
      { time: '4:45', speaker: 'Michael Park', role: 'VP Engineering', content: 'Good sprint despite the friction. SEC-007 was a wake-up call. QA-034 gave us the data we needed. We have a clear path. Carry the lessons, not the frustration.' },
    ],
    ariaBrief: {
      summary: 'Sprint 3 retrospective surfaced three systemic issues: the INFRA decision deadlock (14 days), the SEC-007 disclosure failure, and cross-team isolation. The team self-diagnosed clearly and agreed on concrete process changes for Sprint 4 without defensiveness. Carlos Rodriguez\'s workload and morale are the most pressing human risk heading into Q2.',
      decisions: [
        { text: '3-day ticket escalation rule: any ticket blocked 3+ days auto-escalates to VP Engineering', owner: 'Michael Park' },
        { text: 'Security review required at sprint planning stage for any auth or security-touching ticket', owner: 'Irene Garcia' },
        { text: 'Weekly DevOps/Backend sync — 30 min, infrastructure status and blockers', owner: 'Bob Martinez + Alice Chen' },
        { text: 'QA included in all initial architecture reviews, not just implementation reviews', owner: 'Michael Park' },
        { text: 'Carlos Rodriguez assigned Redis migration as Sprint 4 primary focus — no new assignments without VP check', owner: 'Michael Park' },
      ],
      actionItems: [
        { task: 'Write and distribute 3-day escalation rule policy to all leads', owner: 'Michael Park', deadline: 'Feb 25', priority: 'high' },
        { task: 'Schedule recurring weekly DevOps/Backend sync (30 min, Tuesdays)', owner: 'Bob Martinez', deadline: 'Feb 26', priority: 'medium' },
        { task: 'Update sprint planning template to include Security review checkbox for auth tickets', owner: 'Irene Garcia', deadline: 'Mar 1', priority: 'medium' },
        { task: 'Set Carlos Rodriguez\'s Sprint 4 priorities — Redis migration primary, no new items', owner: 'Michael Park', deadline: 'Feb 24', priority: 'high' },
      ],
      risks: [
        { text: 'Carlos Rodriguez burnout risk persists into Sprint 4 — needs visible wins and lighter load', severity: 'high' },
        { text: 'Process changes discussed but not yet implemented — follow-through risk before Sprint 4 starts', severity: 'medium' },
        { text: 'SEC-007 still open at end of Sprint 3 — carries into Q2 as priority debt', severity: 'high' },
      ],
      preparedAgenda: [
        { title: 'Sprint 4 kickoff — priority alignment', duration: '20 min', owner: 'Michael Park', context: 'First meeting of Q2. Confirm each lead\'s Sprint 4 focus and verify process changes from the retro have been implemented (escalation rule, security checkbox, weekly sync).' },
        { title: 'Carlos Rodriguez Sprint 4 capacity review', duration: '10 min', owner: 'Michael Park', context: 'Carlos committed to Redis migration as primary focus. Verify no new assignments were added. Check in on morale and workload.' },
        { title: 'New process check-in: 3-day rule + security checkbox', duration: '10 min', owner: 'Irene Garcia + Alice Chen', context: 'Are the new Sprint 4 process changes visible in JIRA? Has anyone already hit the 3-day escalation trigger?' },
        { title: 'SEC-007 carry-forward status', duration: '10 min', owner: 'Irene Garcia', context: 'SEC-007 was still open at end of Sprint 3. What\'s the current status and expected resolution date?' },
      ],
    },
  },

  // ── Meeting 5: Board Presentation Prep (Scheduled) ─────────────────────────
  {
    id: 5,
    title: 'Q2 Board Presentation Prep',
    date: 'Mar 5, 2026',
    time: '11:00 AM',
    duration: '60 min (est.)',
    status: 'scheduled',
    topicTags: ['Board Prep', 'Q1 Metrics', 'Q2 Roadmap', 'Security Posture', 'Headcount'],
    attendees: [
      { name: 'Grace Liu', role: 'CTO' },
      { name: 'Michael Park', role: 'VP Engineering' },
      { name: 'Sarah Okafor', role: 'CFO' },
      { name: 'James Liu', role: 'General Counsel' },
    ],
    transcript: [],
    ariaBrief: {
      summary: 'ARIA has prepared this agenda based on open threads from the Q2 Roadmap meeting (Feb 27), SEC-007 Emergency Response (Mar 1), and current org health data. The board will need a clear picture of Q1 delivery, Q2 commitments, and the SEC-007 incident resolution before this meeting.',
      decisions: [],
      actionItems: [
        { task: 'Confirm SEC-007 is fully closed before Mar 5 board meeting', owner: 'Irene Garcia', deadline: 'Mar 4', priority: 'high' },
        { task: 'Draft Q1 engineering metrics slide (delivery rate, incident count, team capacity)', owner: 'Michael Park', deadline: 'Mar 4', priority: 'high' },
        { task: 'Prepare SEC-007 post-incident summary for board (factual, resolution-focused)', owner: 'Marcus Thompson', deadline: 'Mar 3', priority: 'high' },
        { task: 'Q2 roadmap slide: top 3 priorities with timelines', owner: 'Grace Liu + Michael Park', deadline: 'Mar 4', priority: 'high' },
        { task: 'Headcount request justification — Backend + Security roles', owner: 'Sarah Okafor + Grace Liu', deadline: 'Mar 3', priority: 'medium' },
      ],
      risks: [
        { text: 'SEC-007 still open — board will likely question security posture; needs to be resolved before Mar 5', severity: 'critical' },
        { text: 'Q1 delivery may show Redis/Memcached deadlock as a 14-day slip on CORE-078', severity: 'high' },
        { text: 'Board may probe headcount request given Q1 capacity issues — need clear narrative', severity: 'medium' },
      ],
      preparedAgenda: [
        { title: 'Q1 Engineering Delivery Review', duration: '15 min', owner: 'Michael Park', context: 'Present Q1 delivery metrics, sprint velocity, and capacity. Be prepared to explain the 14-day INFRA-024 delay and how the new escalation policy prevents recurrence.' },
        { title: 'Security Incident: SEC-007 Post-Mortem', duration: '15 min', owner: 'Grace Liu + Irene Garcia', context: 'Board-level summary of SEC-007: what happened, how it was detected (Marcus audit), resolution timeline, and systemic process changes implemented. Frame as a process improvement story, not a failure story.' },
        { title: 'Q2 Engineering Roadmap', duration: '15 min', owner: 'Grace Liu', context: 'Three Q2 priorities: (1) SEC-007 full closure + auth compliance, (2) Redis migration to production, (3) CORE-078 feature delivery. Timeline and key milestones for each.' },
        { title: 'Headcount Request', duration: '10 min', owner: 'Grace Liu + Sarah Okafor', context: 'Engineering capacity is strained — Carlos Rodriguez at 56h/wk is a symptom. Make the case for 2 Backend Engineers and 1 Security Engineer based on Q2 roadmap scope vs. current team capacity.' },
        { title: 'Open Q&A', duration: '5 min', owner: 'Grace Liu', context: 'Board questions. Likely topics: security posture follow-up, Redis migration ROI, team health indicators.' },
      ],
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  completed: { label: 'Completed', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
  live:      { label: 'Live · ARIA Recording', color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
  scheduled: { label: 'Scheduled', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
};

const PRIORITY_CONFIG = {
  high:   { color: '#F87171', bg: 'rgba(248,113,113,0.1)', label: 'High' },
  medium: { color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  label: 'Med' },
  low:    { color: '#34D399', bg: 'rgba(52,211,153,0.1)',  label: 'Low' },
};

const SEVERITY_CONFIG = {
  critical: { color: '#F87171', label: 'Critical' },
  high:     { color: '#FBBF24', label: 'High' },
  medium:   { color: '#60A5FA', label: 'Medium' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MeetingListItem({ meeting, isActive, onClick }: { meeting: Meeting; isActive: boolean; onClick: () => void }) {
  const sc = STATUS_CONFIG[meeting.status];
  return (
    <Box
      px={3} py={2.5} borderRadius="lg" cursor="pointer"
      bg={isActive ? 'rgba(139,92,246,0.12)' : 'transparent'}
      border="1px solid"
      borderColor={isActive ? 'rgba(139,92,246,0.3)' : 'transparent'}
      _hover={{ bg: isActive ? 'rgba(139,92,246,0.15)' : 'background.raised' }}
      transition="all 0.12s"
      onClick={onClick}
    >
      <HStack justify="space-between" mb={1}>
        <Text fontSize="xs" fontWeight="700" color={isActive ? 'text.primary' : 'text.secondary'} noOfLines={1} flex={1}>
          {meeting.title}
        </Text>
        <Box
          bg={sc.bg} border="1px solid" borderColor={sc.border}
          borderRadius="full" px={1.5} py={0.5} flexShrink={0}
        >
          <Text fontSize="9px" fontWeight="700" color={sc.color}>{meeting.status === 'live' ? '● Live' : sc.label}</Text>
        </Box>
      </HStack>
      <HStack spacing={3}>
        <HStack spacing={1}>
          <Icon as={FiCalendar} boxSize={2.5} color="text.disabled" />
          <Text fontSize="10px" color="text.disabled">{meeting.date}</Text>
        </HStack>
        <HStack spacing={1}>
          <Icon as={FiClock} boxSize={2.5} color="text.disabled" />
          <Text fontSize="10px" color="text.disabled">{meeting.duration}</Text>
        </HStack>
        <HStack spacing={1}>
          <Icon as={FiUsers} boxSize={2.5} color="text.disabled" />
          <Text fontSize="10px" color="text.disabled">{meeting.attendees.length}</Text>
        </HStack>
      </HStack>
    </Box>
  );
}

function TranscriptView({ meeting }: { meeting: Meeting }) {
  if (meeting.status === 'scheduled') {
    return (
      <Flex direction="column" align="center" justify="center" h="full" py={16} gap={3}>
        <Box bg="rgba(167,139,250,0.1)" border="1px solid" borderColor="rgba(167,139,250,0.2)" borderRadius="full" p={4}>
          <Icon as={FiMic} boxSize={6} color="#A78BFA" />
        </Box>
        <Text fontWeight="700" color="text.primary">ARIA will join this meeting</Text>
        <Text fontSize="sm" color="text.muted" textAlign="center" maxW="320px">
          Transcript will be generated live when the meeting starts on {meeting.date} at {meeting.time}.
        </Text>
        <Box
          bg="rgba(139,92,246,0.08)" border="1px solid" borderColor="rgba(139,92,246,0.2)"
          borderRadius="xl" px={4} py={2} mt={2}
        >
          <HStack spacing={2}>
            <Icon as={FiZap} boxSize={3.5} color="#A78BFA" />
            <Text fontSize="xs" color="#A78BFA" fontWeight="600">ARIA Prepared Agenda ready in the Brief tab</Text>
          </HStack>
        </Box>
      </Flex>
    );
  }

  return (
    <VStack align="stretch" spacing={0} py={2}>
      {meeting.transcript.map((line, i) => (
        <Box
          key={i}
          px={4} py={2.5}
          borderRadius="lg"
          _hover={{ bg: 'background.raised' }}
          transition="background 0.1s"
        >
          <HStack align="flex-start" spacing={3}>
            <Avatar
              size="xs" name={line.speaker}
              bg={AVATAR_COLORS[line.speaker] || '#7C3AED'}
              color="white" flexShrink={0} mt={0.5}
            />
            <Box flex={1} minW={0}>
              <HStack spacing={2} mb={0.5}>
                <Text fontSize="xs" fontWeight="700" color="text.primary">{line.speaker}</Text>
                <Box bg="background.overlay" borderRadius="full" px={1.5} py={0.5}>
                  <Text fontSize="9px" color="text.disabled">{line.role}</Text>
                </Box>
                <Text fontSize="10px" color="text.disabled">{line.time}</Text>
              </HStack>
              <Text fontSize="sm" color="text.secondary" lineHeight="1.65">{line.content}</Text>
            </Box>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
}

function AriaBriefView({ meeting }: { meeting: Meeting }) {
  const { ariaBrief } = meeting;
  const isScheduled = meeting.status === 'scheduled';

  return (
    <VStack align="stretch" spacing={5} p={4}>
      {/* Header */}
      <HStack
        bg="rgba(139,92,246,0.08)" border="1px solid" borderColor="rgba(139,92,246,0.2)"
        borderRadius="xl" px={4} py={3} spacing={3}
      >
        <Box bg="#7C3AED" borderRadius="full" p={1.5} display="flex" alignItems="center" justifyContent="center">
          <Icon as={FiCpu} boxSize={3.5} color="white" />
        </Box>
        <Box>
          <Text fontSize="xs" fontWeight="800" color="#A78BFA" textTransform="uppercase" letterSpacing="0.07em">
            {isScheduled ? 'ARIA Pre-Meeting Intelligence' : 'ARIA Post-Meeting Brief'}
          </Text>
          <Text fontSize="10px" color="text.muted">{isScheduled ? 'Generated from open org threads before meeting' : `Extracted from ${meeting.transcript.length}-line transcript · ${meeting.duration}`}</Text>
        </Box>
      </HStack>

      {/* Summary */}
      <Box bg="background.raised" borderRadius="xl" p={4} border="1px solid" borderColor="border.subtle">
        <HStack spacing={2} mb={2}>
          <Icon as={FiRadio} boxSize={3.5} color="#A78BFA" />
          <Text fontSize="xs" fontWeight="700" color="text.primary" textTransform="uppercase" letterSpacing="0.06em">Executive Summary</Text>
        </HStack>
        <Text fontSize="sm" color="text.secondary" lineHeight="1.75">{ariaBrief.summary}</Text>
      </Box>

      {/* Decisions (completed only) */}
      {ariaBrief.decisions.length > 0 && (
        <Box>
          <HStack spacing={2} mb={3}>
            <Icon as={FiCheckSquare} boxSize={3.5} color="#34D399" />
            <Text fontSize="xs" fontWeight="700" color="text.primary" textTransform="uppercase" letterSpacing="0.06em">Key Decisions Made</Text>
          </HStack>
          <VStack align="stretch" spacing={2}>
            {ariaBrief.decisions.map((d, i) => (
              <HStack key={i} align="flex-start" spacing={3} bg="rgba(52,211,153,0.05)" border="1px solid" borderColor="rgba(52,211,153,0.15)" borderRadius="lg" px={3} py={2.5}>
                <Box w="20px" h="20px" borderRadius="full" bg="rgba(52,211,153,0.15)" border="1px solid" borderColor="rgba(52,211,153,0.3)" display="flex" alignItems="center" justifyContent="center" flexShrink={0} mt={0.5}>
                  <Text fontSize="9px" fontWeight="800" color="#34D399">{i + 1}</Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" color="text.secondary" lineHeight="1.6">{d.text}</Text>
                  <Text fontSize="10px" color="text.disabled" mt={0.5}>Decision by {d.owner}</Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Action Items */}
      <Box>
        <HStack spacing={2} mb={3}>
          <Icon as={FiList} boxSize={3.5} color="#60A5FA" />
          <Text fontSize="xs" fontWeight="700" color="text.primary" textTransform="uppercase" letterSpacing="0.06em">
            Action Items <Text as="span" color="text.disabled" fontWeight="500">({ariaBrief.actionItems.length})</Text>
          </Text>
        </HStack>
        <VStack align="stretch" spacing={2}>
          {ariaBrief.actionItems.map((item, i) => {
            const pc = PRIORITY_CONFIG[item.priority];
            return (
              <HStack key={i} align="flex-start" spacing={3} bg="background.raised" border="1px solid" borderColor="border.subtle" borderRadius="lg" px={3} py={2.5}>
                <Box bg={pc.bg} border="1px solid" borderColor={`${pc.color}40`} borderRadius="full" px={1.5} py={0.5} flexShrink={0}>
                  <Text fontSize="9px" fontWeight="700" color={pc.color}>{pc.label}</Text>
                </Box>
                <Box flex={1} minW={0}>
                  <Text fontSize="sm" color="text.secondary" lineHeight="1.6">{item.task}</Text>
                  <HStack spacing={3} mt={0.5}>
                    <Text fontSize="10px" color="text.disabled">→ {item.owner}</Text>
                    <Text fontSize="10px" color="text.disabled">Due: {item.deadline}</Text>
                  </HStack>
                </Box>
              </HStack>
            );
          })}
        </VStack>
      </Box>

      {/* Risks */}
      <Box>
        <HStack spacing={2} mb={3}>
          <Icon as={FiAlertCircle} boxSize={3.5} color="#FBBF24" />
          <Text fontSize="xs" fontWeight="700" color="text.primary" textTransform="uppercase" letterSpacing="0.06em">Risks & Blockers</Text>
        </HStack>
        <VStack align="stretch" spacing={2}>
          {ariaBrief.risks.map((risk, i) => {
            const sc = SEVERITY_CONFIG[risk.severity];
            return (
              <HStack key={i} align="flex-start" spacing={3} bg="background.raised" border="1px solid" borderColor="border.subtle" borderRadius="lg" px={3} py={2.5}>
                <Box bg={`${sc.color}15`} border="1px solid" borderColor={`${sc.color}40`} borderRadius="full" px={1.5} py={0.5} flexShrink={0}>
                  <Text fontSize="9px" fontWeight="700" color={sc.color}>{sc.label}</Text>
                </Box>
                <Text fontSize="sm" color="text.secondary" flex={1} lineHeight="1.6">{risk.text}</Text>
              </HStack>
            );
          })}
        </VStack>
      </Box>

      {/* ARIA Prepared Agenda */}
      <Box>
        <HStack spacing={2} mb={1}>
          <Icon as={FiArrowRight} boxSize={3.5} color="#A78BFA" />
          <Text fontSize="xs" fontWeight="700" color="text.primary" textTransform="uppercase" letterSpacing="0.06em">
            {isScheduled ? 'ARIA Prepared Agenda' : 'ARIA Suggested Next Agenda'}
          </Text>
        </HStack>
        <Text fontSize="10px" color="text.disabled" mb={3}>
          {isScheduled
            ? 'Generated from open org threads · Ready for your review'
            : 'Based on open threads from this meeting · Ready for your next session'}
        </Text>
        <VStack align="stretch" spacing={2}>
          {ariaBrief.preparedAgenda.map((item, i) => (
            <Box key={i} bg="rgba(139,92,246,0.05)" border="1px solid" borderColor="rgba(139,92,246,0.15)" borderRadius="xl" p={3.5} position="relative" overflow="hidden">
              <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg="#7C3AED" borderRadius="3px 0 0 3px" />
              <Box pl={2}>
                <HStack justify="space-between" mb={1}>
                  <HStack spacing={2}>
                    <Box w="18px" h="18px" borderRadius="full" bg="rgba(167,139,250,0.2)" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                      <Text fontSize="9px" fontWeight="800" color="#A78BFA">{i + 1}</Text>
                    </Box>
                    <Text fontSize="sm" fontWeight="700" color="text.primary">{item.title}</Text>
                  </HStack>
                  <HStack spacing={2} flexShrink={0}>
                    <Box bg="background.overlay" borderRadius="full" px={2} py={0.5}>
                      <Text fontSize="9px" color="text.disabled">{item.duration}</Text>
                    </Box>
                  </HStack>
                </HStack>
                <Text fontSize="10px" color="#A78BFA" fontWeight="600" mb={1}>{item.owner}</Text>
                <Text fontSize="xs" color="text.muted" lineHeight="1.65">{item.context}</Text>
              </Box>
            </Box>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BriefingsPage() {
  const [selectedId, setSelectedId] = useState(1);
  const meeting = meetings.find(m => m.id === selectedId)!;
  const sc = STATUS_CONFIG[meeting.status];

  return (
    <AppLayout>
      <Box h="calc(100vh - 130px)" overflow="hidden" borderRadius="xl" border="1px solid" borderColor="border.subtle">
        <Flex h="full">

          {/* ── Left: Meeting List ── */}
          <Box w="260px" flexShrink={0} bg="background.surface" borderRight="1px solid" borderColor="border.subtle" display="flex" flexDirection="column">
            <Box p={4} borderBottom="1px solid" borderColor="border.subtle">
              <HStack spacing={2} mb={1}>
                <Box bg="rgba(139,92,246,0.12)" borderRadius="full" p={1.5}>
                  <Icon as={FiMic} boxSize={3.5} color="#A78BFA" />
                </Box>
                <Text fontSize="sm" fontWeight="800" color="text.primary" letterSpacing="-0.02em">Briefings</Text>
                <Box ml="auto" bg="rgba(167,139,250,0.15)" border="1px solid" borderColor="rgba(167,139,250,0.3)" borderRadius="full" px={2} py={0.5}>
                  <Text fontSize="10px" fontWeight="700" color="#A78BFA">ARIA Active</Text>
                </Box>
              </HStack>
              <Text fontSize="10px" color="text.muted">ARIA attends, transcribes, and briefs you</Text>
            </Box>

            <Box flex={1} overflowY="auto" p={3}>
              <VStack align="stretch" spacing={1.5}>
                {meetings.map(m => (
                  <MeetingListItem
                    key={m.id}
                    meeting={m}
                    isActive={m.id === selectedId}
                    onClick={() => setSelectedId(m.id)}
                  />
                ))}
              </VStack>
            </Box>
          </Box>

          {/* ── Right: Meeting Detail ── */}
          <Flex flex={1} flexDirection="column" bg="background.primary" minW={0}>

            {/* Meeting Header */}
            <Box px={5} py={4} borderBottom="1px solid" borderColor="border.subtle" bg="background.surface" flexShrink={0}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="md" fontWeight="800" color="text.primary" letterSpacing="-0.02em" noOfLines={1}>
                  {meeting.title}
                </Text>
                <Box bg={sc.bg} border="1px solid" borderColor={sc.border} borderRadius="full" px={3} py={1} flexShrink={0}>
                  <Text fontSize="xs" fontWeight="700" color={sc.color}>{sc.label}</Text>
                </Box>
              </HStack>

              <HStack spacing={4} mb={3} flexWrap="wrap">
                <HStack spacing={1.5}>
                  <Icon as={FiCalendar} boxSize={3.5} color="text.muted" />
                  <Text fontSize="xs" color="text.muted">{meeting.date} · {meeting.time}</Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Icon as={FiClock} boxSize={3.5} color="text.muted" />
                  <Text fontSize="xs" color="text.muted">{meeting.duration}</Text>
                </HStack>
                <HStack spacing={1.5}>
                  <Icon as={FiUsers} boxSize={3.5} color="text.muted" />
                  <Text fontSize="xs" color="text.muted">{meeting.attendees.length} attendees</Text>
                </HStack>
              </HStack>

              {/* Attendees */}
              <HStack spacing={2} flexWrap="wrap" mb={3}>
                {meeting.attendees.map(a => (
                  <HStack key={a.name} spacing={1.5} bg="background.raised" border="1px solid" borderColor="border.subtle" borderRadius="full" px={2} py={1}>
                    <Avatar size="2xs" name={a.name} bg={AVATAR_COLORS[a.name] || '#7C3AED'} color="white" />
                    <Text fontSize="10px" color="text.secondary" fontWeight="600">{a.name}</Text>
                    <Text fontSize="9px" color="text.disabled">{a.role}</Text>
                  </HStack>
                ))}
              </HStack>

              {/* Tags */}
              <HStack spacing={1.5} flexWrap="wrap">
                {meeting.topicTags.map(tag => (
                  <Box key={tag} bg="rgba(139,92,246,0.08)" border="1px solid" borderColor="rgba(139,92,246,0.2)" borderRadius="full" px={2} py={0.5}>
                    <Text fontSize="9px" fontWeight="600" color="#A78BFA">{tag}</Text>
                  </Box>
                ))}
              </HStack>
            </Box>

            {/* Tabs: Transcript + ARIA Brief */}
            <Box flex={1} overflow="hidden" display="flex" flexDirection="column">
              <Tabs variant="unstyled" display="flex" flexDirection="column" h="full">
                <TabList px={5} py={0} borderBottom="1px solid" borderColor="border.subtle" bg="background.surface" flexShrink={0}>
                  {[
                    { label: 'Transcript', icon: FiMic },
                    { label: 'ARIA Brief', icon: FiCpu },
                  ].map(tab => (
                    <Tab
                      key={tab.label}
                      py={3}
                      mr={4}
                      fontSize="xs"
                      fontWeight="600"
                      color="text.muted"
                      borderBottom="2px solid transparent"
                      _selected={{ color: 'text.primary', borderBottomColor: '#8B5CF6' }}
                      _hover={{ color: 'text.secondary' }}
                    >
                      <HStack spacing={1.5}>
                        <Icon as={tab.icon} boxSize={3.5} />
                        <Text>{tab.label}</Text>
                      </HStack>
                    </Tab>
                  ))}
                </TabList>

                <TabPanels flex={1} overflow="hidden">
                  <TabPanel p={0} h="full" overflowY="auto">
                    <TranscriptView meeting={meeting} />
                  </TabPanel>
                  <TabPanel p={0} h="full" overflowY="auto">
                    <AriaBriefView meeting={meeting} />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </Flex>
        </Flex>
      </Box>
    </AppLayout>
  );
}
