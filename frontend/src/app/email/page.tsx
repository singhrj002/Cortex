'use client';

import React, { useState } from 'react';
import {
  Box, Heading, Text, HStack, Avatar, Badge, Divider,
  Icon, Input, InputGroup, InputLeftElement, Button,
} from '@chakra-ui/react';
import { FiSearch, FiMail, FiStar, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';

interface Email {
  id: number;
  sender: string;
  email: string;
  to?: string;
  subject: string;
  preview: string;
  fullBody: string;
  time: string;
  read: boolean;
  starred: boolean;
  urgent?: boolean;
  tag?: string;
}

const emails: Email[] = [
  // ── URGENT / UNREAD ──────────────────────────────────────────────────────────
  {
    id: 22,
    sender: 'Irene Garcia',
    email: 'irene.garcia@nexustech.com',
    to: 'jack.williams@nexustech.com',
    subject: 'RE: WEB-045 / 046 / 047 — This Cannot Wait Any Longer',
    preview: 'Jack, it has now been 17 days since SEC-007 was raised. Three production endpoints are actively violating SEC-STD-012...',
    fullBody: `Jack,

It has now been 17 days since SEC-007 was raised. Three production endpoints are actively violating SEC-STD-012 (OAuth 2.0 mandatory). I am cc'ing Michael Park and escalating formally.

The violations are:
• WEB-045 — /api/user-profile → Basic Auth (LIVE IN PRODUCTION)
• WEB-046 — /api/notifications → Basic Auth (LIVE IN PRODUCTION)
• WEB-047 — /api/settings → Basic Auth (LIVE IN PRODUCTION)

QA-037 (Emma Wilson) independently confirmed all three are exploitable. Marcus ran SEC-002 and found the same. This is not a theoretical risk — any network observer can capture plaintext credentials.

I need the following by EOD Thursday:
1. Acknowledgement that this is a critical breach
2. A concrete OAuth 2.0 migration timeline (WEB-051)
3. A joint meeting with you, Grace, and Michael

If I do not hear back, I will escalate directly to Grace Liu.

Irene Garcia
Security Lead — Nexus Technologies`,
    time: 'Today, 8:41 AM',
    read: false,
    starred: true,
    urgent: true,
    tag: 'Security',
  },
  {
    id: 21,
    sender: 'Michael Park',
    email: 'michael.park@nexustech.com',
    to: 'bob.martinez@nexustech.com',
    subject: 'Redis vs Memcached — You Need to Call It Today',
    preview: 'Bob, INFRA-024 and INFRA-025 have been blocked for 14+ days. Carlos is working 56 hours a week carrying both tickets...',
    fullBody: `Bob,

INFRA-024 and INFRA-025 have been blocked for 14+ days. Carlos is currently working 56 hours a week carrying both tickets in limbo, and QA-034 clearly shows Redis outperforms Memcached by 40% under our actual load patterns.

I need a policy decision from you today. Not tomorrow, today.

Options:
A) Update INFRA-STD-001 to approve Redis — unblocks Alice's CORE-078, David's PR #292, and Carlos's INFRA-025
B) Formally reject Redis — we need a written rationale Alice and Grace can review

Sitting on this is not neutral. It is costing us sprint velocity, Carlos's wellbeing, and a production caching upgrade.

Please reply by 3 PM.

— Michael Park, VP Engineering`,
    time: 'Today, 9:15 AM',
    read: false,
    starred: false,
    urgent: true,
    tag: 'Infrastructure',
  },
  {
    id: 16,
    sender: 'Irene Garcia',
    email: 'irene.garcia@nexustech.com',
    to: 'grace.liu@nexustech.com',
    subject: 'ESCALATION: SEC-007 — 17 Days Open, Action Required',
    preview: 'Grace, I need to bring something to your attention that has not been escalated through normal channels...',
    fullBody: `Grace,

I need to bring something to your attention that has not been escalated through normal channels.

SEC-007 has been open for 17 days. It documents that three production API endpoints (WEB-045, WEB-046, WEB-047) are using Basic Auth in direct violation of SEC-STD-012, which mandates OAuth 2.0 for all APIs.

What concerns me even more: I have reason to believe Jack Williams is quietly working on a fix (PR #294, WEB-051 — draft, marked secret) without notifying the Security team or yourself. This is shadow work on a critical security issue.

The Frontend team has not responded constructively to my outreach. I have documented all communication attempts in SEC-007.

I am requesting:
1. A mandatory joint meeting: Jack Williams, Michael Park, you, and me
2. Formal acknowledgement that SEC-STD-012 applies here
3. A production freeze on further Basic Auth deployments

I am happy to present the full audit findings (SEC-002) at your convenience.

Irene Garcia
Security Lead`,
    time: 'Yesterday, 4:52 PM',
    read: false,
    starred: true,
    urgent: true,
    tag: 'Security',
  },
  {
    id: 10,
    sender: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@nexustech.com',
    to: 'bob.martinez@nexustech.com',
    subject: 'INFRA-024 Still Blocked — Week 2, This Is Getting Critical',
    preview: 'Bob, I wanted to flag this again because it is genuinely affecting my ability to function. INFRA-024 and INFRA-025 are both blocked...',
    fullBody: `Bob,

I wanted to flag this again because it is genuinely affecting my ability to function.

INFRA-024 (caching standards policy) and INFRA-025 (Redis ElastiCache Terraform) are both blocked, and they have been for two weeks. Alice's Redis work (CORE-078) is ready to deploy to staging, but without INFRA approval, I can't provision the infrastructure.

I am currently context-switching between two blocked tickets while trying to keep up with sprint work. I logged 56 hours last week. I don't say this to complain — I say it because I need this unblocked.

QA-034 showed Redis is 40% faster than Memcached under our actual load. Can we at least do a temporary exception to unblock INFRA-025 while the policy decision is made formally?

I have been the one in the middle of the Alice/Bob disagreement for two weeks and I need leadership to make the call.

Carlos Rodriguez
Senior DevOps Engineer`,
    time: '2 days ago, 6:48 PM',
    read: false,
    starred: false,
    urgent: false,
    tag: 'Infrastructure',
  },
  {
    id: 9,
    sender: 'Jack Williams',
    email: 'jack.williams@nexustech.com',
    to: 'marcus.thompson@nexustech.com',
    subject: 'RE: SEC-002 Audit Results — Can We Discuss Before You Publish?',
    preview: 'Marcus, thanks for the heads-up. I\'d prefer if we could discuss this before anything goes to Irene or Grace...',
    fullBody: `Marcus,

Thanks for the heads-up on the audit findings. I'd prefer if we could discuss this before anything is formally published or escalated.

I'm already working on a fix — it's in draft in PR #294 (WEB-051). The OAuth migration is more complex than it looks because of the way our sessions are structured, but I have a plan.

My concern is that if this goes straight to Grace or gets written up as a formal finding, it's going to cause a lot of noise. I want to get the fix in place quietly and avoid the politics.

Can we get 30 minutes this week to align on messaging before SEC-002 goes to Irene?

Jack
Frontend Lead`,
    time: '4 days ago, 2:17 PM',
    read: false,
    starred: false,
    urgent: false,
    tag: 'Security',
  },

  // ── READ / RECENT ─────────────────────────────────────────────────────────────
  {
    id: 17,
    sender: 'Grace Liu',
    email: 'grace.liu@nexustech.com',
    to: 'michael.park@nexustech.com',
    subject: 'Sprint 3 — Some Things I Want to Discuss in Our 1:1',
    preview: 'Michael, a few things I\'ve noticed that I want to address before they compound. The Infrastructure team health score has dropped to 56...',
    fullBody: `Michael,

A few things I want to get ahead of in tomorrow's 1:1:

1. Infrastructure team score is at 56/100, the lowest in the company. I see Carlos has 3 blocked tickets and is logging 56-hour weeks. This needs to be addressed this sprint, not next sprint.

2. The Redis vs Memcached decision is taking too long. I approved Redis implementation conceptually based on Alice's proposal two weeks ago. Why is it still blocked?

3. I want to hear more about the SEC-007 situation. Irene mentioned it briefly to me but I don't have the full picture. Can you walk me through it?

4. Sarah Chen is doing exceptional work. 9 tickets, 3-day average close, excellent cross-team feedback. I want to make sure she's on a recognition track.

See you at 2 PM.

— Grace`,
    time: 'Today, 7:30 AM',
    read: true,
    starred: false,
    tag: 'Leadership',
  },
  {
    id: 11,
    sender: 'Michael Park',
    email: 'michael.park@nexustech.com',
    to: 'alice.chen@nexustech.com, bob.martinez@nexustech.com',
    subject: 'Redis vs Memcached — Decision Required This Sprint',
    preview: 'Team, we cannot carry this conflict into Sprint 4. INFRA-024 has been deadlocked for 14 days and QA has given us clear data...',
    fullBody: `Alice, Bob,

We cannot carry this conflict into Sprint 4. INFRA-024 has been deadlocked for 14 days and QA-034 has given us clear data that Redis outperforms Memcached by 40% under our actual load patterns.

I am scheduling a mandatory decision meeting for Thursday. Attendees: both of you, Carlos, Leo (QA), and me.

Prior to that meeting I expect:
• Bob: Written rationale for your Memcached preference that addresses the QA-034 findings
• Alice: Summary of what needs to change in INFRA-STD-001 to formally approve Redis

Carlos has been caught in the middle of this for two weeks at significant personal cost. That ends this sprint.

Meeting invite to follow.

— Michael Park
VP Engineering`,
    time: '1 day ago, 11:03 AM',
    read: true,
    starred: false,
    tag: 'Infrastructure',
  },
  {
    id: 19,
    sender: 'Alice Chen',
    email: 'alice.chen@nexustech.com',
    to: 'grace.liu@nexustech.com',
    subject: 'Urgent: Redis Implementation Still Blocked by Infrastructure Policy',
    preview: 'Grace, I hate to escalate but CORE-078 has been in progress for 3 weeks and I still can\'t get sign-off from Infrastructure...',
    fullBody: `Grace,

I hate to escalate, but CORE-078 (Redis caching layer) has been in active development for three weeks and I still cannot get formal Infrastructure approval.

The situation:
• CORE-078 is in progress — the Redis integration is working in staging
• David's PR #292 (migration scripts) is ready for review
• QA-034 confirmed 40% performance improvement over Memcached
• INFRA-024 (the policy update) has been blocked for 14 days

Bob and I have fundamentally different views on this. Bob prefers Memcached because of existing expertise. I believe the data is clear that Redis is the right call for our transaction query volume.

Carlos Rodriguez is the one stuck in the middle — he's been logging 56-hour weeks trying to keep both tickets alive.

I know you approved this directionally in your email last week. Could you formalize that as a policy exception until INFRA-STD-001 can be updated?

Alice Chen
Backend Lead`,
    time: '2 days ago, 3:41 PM',
    read: true,
    starred: false,
    tag: 'Infrastructure',
  },
  {
    id: 8,
    sender: 'Marcus Thompson',
    email: 'marcus.thompson@nexustech.com',
    to: 'irene.garcia@nexustech.com',
    subject: 'SEC-002 Audit Complete — 3 Basic Auth Violations Confirmed in Production',
    preview: 'Irene, audit complete. I\'ve found exactly the violations SEC-007 flagged, plus one additional endpoint we missed...',
    fullBody: `Irene,

SEC-002 audit is complete. Results:

Confirmed Basic Auth violations in production:
• WEB-045 — /api/user-profile (Jack Williams, PR #267, merged 21 days ago)
• WEB-046 — /api/notifications (Sarah Chen, PR #268, merged 18 days ago)
• WEB-047 — /api/settings (Tom Baker, PR #271, merged 19 days ago)

All three endpoints transmit credentials in plaintext over each request. Under SEC-STD-012, this is a critical violation. OAuth 2.0 has been mandatory since SEC-001 was approved in Q4.

I also found a draft PR (#294, WEB-051) from Jack Williams titled "Migrate user endpoints to OAuth 2.0" — marked as a draft and seemingly not disclosed to Security. I wanted to flag this to you before acting on it.

Full audit report attached (SEC-002-final.pdf).

What would you like me to do next?

Marcus Thompson
Security Engineer`,
    time: '4 days ago, 10:22 AM',
    read: true,
    starred: true,
    tag: 'Security',
  },
  {
    id: 13,
    sender: 'Emma Wilson',
    email: 'emma.wilson@nexustech.com',
    to: 'leo.zhang@nexustech.com',
    subject: 'QA-037 Complete — Basic Auth Confirmed Exploitable, Critical Finding',
    preview: 'Leo, QA-037 auth regression testing is done. Results are not good. All three Basic Auth endpoints are confirmed insecure...',
    fullBody: `Leo,

QA-037 auth regression testing is complete.

Results — all three endpoints failed auth security checks:
• /api/user-profile — credentials transmitted in HTTP Authorization header (plaintext)
• /api/notifications — same issue, also missing rate limiting
• /api/settings — Basic Auth + no session timeout

I simulated a network interception on our staging environment and was able to capture valid credentials in under 2 minutes. This is not theoretical.

I've marked QA-037 as CRITICAL and linked it to SEC-007.

One thing I want to flag: I noticed PR #294 in draft by Jack Williams. The PR description says "migrate endpoints to OAuth 2.0" but it's marked as a secret/draft and not linked to SEC-007 or QA-037 in Jira. It looks like he may be working on a fix without coordination with Security or QA.

Should we reach out directly or loop in Irene?

Emma Wilson
QA Engineer`,
    time: '4 days ago, 2:05 PM',
    read: true,
    starred: false,
    tag: 'QA',
  },
  {
    id: 15,
    sender: 'Leo Zhang',
    email: 'leo.zhang@nexustech.com',
    to: 'alice.chen@nexustech.com, bob.martinez@nexustech.com, michael.park@nexustech.com',
    subject: 'QA-034 Benchmark Results: Redis 40% Faster Than Memcached — Full Report',
    preview: 'Team, QA-034 benchmark testing is complete. The results favor Redis significantly under our actual transaction load patterns...',
    fullBody: `Team,

QA-034 (cache benchmark) testing is complete. Results:

Test environment: Staging, simulating 800–1,200 req/s (production peak load)

Results:
┌─────────────────────┬────────────┬────────────┐
│ Metric              │ Redis      │ Memcached  │
├─────────────────────┼────────────┼────────────┤
│ Avg response time   │ 2.1ms      │ 3.5ms      │
│ p99 latency         │ 8ms        │ 21ms       │
│ Cache hit rate      │ 94.2%      │ 91.7%      │
│ Eviction rate       │ 0.3%       │ 4.1%       │
│ Memory efficiency   │ High       │ Medium     │
└─────────────────────┴────────────┴────────────┘

Redis is ~40% faster on average and significantly better at p99. The eviction rate difference is notable — Memcached is losing more data under our access patterns.

I want to be clear this is a QA data point, not a policy recommendation. The infrastructure policy decision (INFRA-024) sits with Bob and the Infra team. But if the decision is purely performance-based, the data favors Redis.

Full report: QA-034-benchmark-v2.pdf

Leo Zhang
QA Lead`,
    time: '5 days ago, 4:30 PM',
    read: true,
    starred: true,
    tag: 'QA',
  },
  {
    id: 14,
    sender: 'David Kim',
    email: 'david.kim@nexustech.com',
    to: 'alice.chen@nexustech.com',
    subject: 'PR #292 Redis Migration Scripts — Ready for Your Review',
    preview: 'Alice, PR #292 is up and ready. Migration scripts cover all existing Memcached keys, with zero-downtime rollover strategy...',
    fullBody: `Alice,

PR #292 is ready for review. Here's what's included:

Migration approach:
• Zero-downtime dual-write phase (write to both Memcached + Redis during transition)
• Key-by-key migration with TTL preservation
• Automatic rollback trigger if Redis error rate exceeds 0.5%
• Full data consistency verification before Memcached cutover

Tested on staging:
• 100% of Memcached keys migrated successfully in test run
• No cache misses during the dual-write window
• Rollback tested and works within 30 seconds

Blocked on: INFRA-025 approval (Carlos Rodriguez's ElastiCache Terraform cluster hasn't been provisioned because INFRA-024 policy is still stuck).

Once INFRA-025 is unblocked and Carlos can stand up the Redis cluster, we can run this in production. Everything on my side is ready.

Please review when you get a chance.

David Kim
Senior Backend Engineer`,
    time: '2 days ago, 5:15 PM',
    read: true,
    starred: false,
    tag: 'Backend',
  },
  {
    id: 12,
    sender: 'Sarah Chen',
    email: 'sarah.chen@nexustech.com',
    to: 'jack.williams@nexustech.com',
    subject: 'Sprint Update — WEB-046 Closed + 2 More Done',
    preview: 'Jack, quick update: WEB-046 is closed, WEB-052 is done and merged (PR #296), and I\'ve started WEB-053...',
    fullBody: `Jack,

Sprint update:

Closed this week:
• WEB-046 — Notifications API (closed 2 days ahead of schedule)
• WEB-052 — User settings UI refactor (merged, PR #296)
• WEB-048 — Mobile breakpoint fixes (done, waiting on your review)

In progress:
• WEB-053 — Dashboard analytics widgets (started this morning)

PR reviews done: 7 this week (including 3 from David's backend PRs for the Redis work)

One thing I wanted to flag: I noticed PR #294 in our GitHub. I'm not sure what it is — it's a draft and the description says "migrate user endpoints to OAuth 2.0." Is that related to the Irene/Security situation? I wasn't sure if I should be involved or if it's still in early stages.

No pressure — just want to make sure I'm not missing context that's relevant to Frontend.

Sarah Chen
Senior Frontend Engineer`,
    time: '3 days ago, 3:50 PM',
    read: true,
    starred: false,
    tag: 'Frontend',
  },
  {
    id: 18,
    sender: 'Rachel Foster',
    email: 'rachel.foster@nexustech.com',
    to: 'carlos.rodriguez@nexustech.com',
    subject: 'Checking In — How Are You Doing?',
    preview: 'Hey Carlos, I don\'t normally reach out directly but I\'ve seen your hours in the time-tracking dashboard and I\'m concerned...',
    fullBody: `Hey Carlos,

I don't normally reach out directly to individual engineers, but I've seen your hours in the time-tracking dashboard this week (56 hours) and I wanted to check in.

I know the INFRA-024/025 situation has put you in a tough spot. Being the person doing the implementation work while the policy decision is stuck above you is genuinely difficult, and it sounds like that's been going on for two weeks.

A few things:
1. You're allowed to flag this. If blocked tickets are causing you to overwork, that's something that needs to be in the open — not just absorbed by you.
2. If it would help, I can arrange a conversation with Michael Park to formally escalate the policy decision with urgency.
3. Please take your lunch breaks. I mean it.

You're one of the most reliable people on this team and I don't want to lose you to burnout over a policy dispute you didn't create.

Let me know if you want to talk.

Rachel Foster
Head of Product`,
    time: '2 days ago, 12:40 PM',
    read: true,
    starred: false,
    tag: 'HR',
  },
  // ── ORIGINAL EMAILS (lightly refreshed) ────────────────────────────────────
  {
    id: 1,
    sender: 'Irene Garcia',
    email: 'irene.garcia@nexustech.com',
    to: 'jack.williams@nexustech.com, grace.liu@nexustech.com',
    subject: 'RE: API Authentication Standards — SEC-007 Formal Notice',
    preview: 'The Security team requires all APIs to use OAuth 2.0. WEB-045, WEB-046, and WEB-047 are in direct violation of SEC-STD-012...',
    fullBody: `Jack, Grace,

This is a formal notice under SEC-STD-012.

The following endpoints deployed by the Frontend team are using Basic Auth in violation of company security policy:
• WEB-045 — /api/user-profile
• WEB-046 — /api/notifications
• WEB-047 — /api/settings

OAuth 2.0 has been mandatory for all APIs since SEC-001 was approved in Q4. Basic Auth transmits credentials with every request and is explicitly prohibited.

I am raising SEC-007 to track this formally. I need a remediation plan within 5 business days.

Please acknowledge receipt.

Irene Garcia
Security Lead`,
    time: '17 days ago',
    read: true,
    starred: true,
    tag: 'Security',
  },
  {
    id: 2,
    sender: 'Bob Martinez',
    email: 'bob.martinez@nexustech.com',
    to: 'alice.chen@nexustech.com',
    subject: 'RE: Redis Caching Proposal — My Concerns',
    preview: 'Alice, I respect the work you\'ve put into the Redis proposal, but I have real concerns about introducing a new technology stack...',
    fullBody: `Alice,

I respect the work you've put into the Redis proposal, but I have serious concerns about introducing a new technology into our stack when Memcached has been our approved standard for three years.

My specific concerns:
• Team expertise: The DevOps team knows Memcached. Redis has different operational patterns (persistence, AOF, replication)
• INFRA-STD-001: Redis is not currently approved. Approving it requires an infrastructure committee review
• Support model: We'd need Redis-specific runbooks, alerting, and oncall training
• Carlos is already stretched thin — adding a new system is a risk

I'm not opposed to Redis in principle. I'm opposed to moving this fast without proper governance.

Can we set up a formal RFC process and bring this to the infrastructure committee?

Bob Martinez
DevOps Lead`,
    time: '12 days ago',
    read: true,
    starred: false,
    tag: 'Infrastructure',
  },
  {
    id: 3,
    sender: 'Alice Chen',
    email: 'alice.chen@nexustech.com',
    to: 'michael.park@nexustech.com, bob.martinez@nexustech.com',
    subject: 'Proposal: Redis for Transaction Query Caching Layer (CORE-078)',
    preview: 'Team, I propose Redis as our caching layer for the transaction query service. Performance benchmarks show 40% improvement...',
    fullBody: `Team,

I'm proposing Redis as our caching layer for the transaction query service (CORE-078).

Why Redis over Memcached:
• Persistence: Data survives restarts — critical for our session tokens
• Data structures: Sorted sets for leaderboard queries, pub/sub for real-time events
• Performance: 40% faster than Memcached in our test environment (detailed results attached)
• TTL flexibility: Per-key expiration vs Memcached's global policies
• Cluster mode: Redis ElastiCache supports automatic failover natively

David has already written the migration scripts (PR #292). Leo's QA-034 benchmark independently confirmed the performance improvement.

I'd like to move forward with CORE-078 and request Infrastructure approval (INFRA-025) for the ElastiCache cluster.

Alice Chen
Backend Lead`,
    time: '14 days ago',
    read: true,
    starred: true,
    tag: 'Backend',
  },
  {
    id: 4,
    sender: 'Grace Liu',
    email: 'grace.liu@nexustech.com',
    to: 'michael.park@nexustech.com, alice.chen@nexustech.com',
    subject: 'Directional Approval: Redis Caching — Pending Infrastructure Sign-off',
    preview: 'After reviewing Alice\'s proposal and QA results, I\'m giving directional approval for Redis. Infrastructure team needs to formally...',
    fullBody: `Michael, Alice,

After reviewing Alice's Redis proposal and the QA-034 benchmark results, I'm giving directional approval for moving to Redis for the transaction caching layer.

The data is compelling — 40% performance improvement with better eviction characteristics. The persistence argument is also valid for our use case.

However, this needs to go through proper channels:
• Bob and the Infrastructure team need to formally update INFRA-STD-001
• Carlos needs to be unblocked on INFRA-025 to provision the ElastiCache cluster
• I'd like a rollback plan documented before production

Michael — please make sure this gets prioritized with the Infrastructure team. I don't want this decision sitting in limbo.

Grace Liu
CTO`,
    time: '10 days ago',
    read: true,
    starred: false,
    tag: 'Leadership',
  },
  {
    id: 5,
    sender: 'Leo Zhang',
    email: 'leo.zhang@nexustech.com',
    to: 'alice.chen@nexustech.com, michael.park@nexustech.com',
    subject: 'QA-034 Interim Results — Memcached Eviction Issues Under Load',
    preview: 'Interim finding: Memcached shows 4.1% eviction rate under our peak load pattern vs 0.3% for Redis. Stale reads observed...',
    fullBody: `Alice, Michael,

Sharing interim QA-034 results while full testing continues.

At 1,000 req/s (our production peak):
• Memcached eviction rate: 4.1% — this means 4% of cached data is being dropped under load
• Redis eviction rate: 0.3% — dramatically more stable

Practical impact: At 1,000 req/s with a 4.1% eviction rate, roughly 41 requests per second are falling through to the database. This is likely contributing to our observed DB spikes on Monday mornings.

I've also observed 15% of Memcached reads returning stale data during rapid cache invalidation scenarios. This is a consistency risk.

Still running the full benchmark suite — final report (QA-034) will be ready by end of week.

Leo Zhang
QA Lead`,
    time: '8 days ago',
    read: true,
    starred: false,
    tag: 'QA',
  },
  {
    id: 7,
    sender: 'Jack Williams',
    email: 'jack.williams@nexustech.com',
    to: 'michael.park@nexustech.com',
    subject: 'FW: API Implementation — WEB-045, 046, 047 Shipped',
    preview: 'Michael, shipping update. User profile, notifications, and settings API endpoints are live. Used Basic Auth for speed...',
    fullBody: `Michael,

Shipping update: WEB-045, WEB-046, and WEB-047 are all live in production.

Endpoints deployed:
• /api/user-profile (PR #267)
• /api/notifications (PR #268)
• /api/settings (PR #271)

I went with Basic Auth for now — it was the fastest path to get these shipped and unblock the mobile team. We can revisit auth if needed.

Sprint velocity is looking good. Sarah Chen is killing it — 9 tickets this sprint.

Jack Williams
Frontend Lead`,
    time: '21 days ago',
    read: true,
    starred: false,
    tag: 'Frontend',
  },
];

type FilterType = 'all' | 'unread' | 'starred' | 'urgent';

const TAG_COLORS: Record<string, string> = {
  Security: 'red',
  Infrastructure: 'orange',
  Backend: 'blue',
  Frontend: 'purple',
  QA: 'green',
  Leadership: 'gray',
  HR: 'teal',
};

export default function EmailPage() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const filtered = emails.filter(e => {
    const matchFilter =
      filter === 'all' ? true :
      filter === 'unread' ? !e.read :
      filter === 'starred' ? e.starred :
      filter === 'urgent' ? e.urgent : true;
    const matchSearch = search === '' ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.sender.toLowerCase().includes(search.toLowerCase()) ||
      e.preview.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const unreadCount = emails.filter(e => !e.read).length;
  const urgentCount = emails.filter(e => e.urgent).length;

  if (selectedEmail) {
    return (
      <AppLayout>
        <Box maxW="860px" mx="auto" pt={8} pb={12} px={4}>
          <Button
            leftIcon={<Icon as={FiArrowLeft} />}
            variant="ghost" mb={4}
            onClick={() => setSelectedEmail(null)}
            color="text.secondary"
          >
            Back to Inbox
          </Button>

          <Box borderWidth="1px" borderColor="border.subtle" borderRadius="xl" bg="background.surface" overflow="hidden">
            {/* Email header bar */}
            {selectedEmail.urgent && (
              <Box bg="rgba(248,113,113,0.08)" px={6} py={2.5} borderBottom="1px solid" borderColor="rgba(248,113,113,0.25)">
                <HStack>
                  <Icon as={FiAlertTriangle} color="#F87171" />
                  <Text fontSize="sm" color="#F87171" fontWeight="600">
                    Urgent — action required
                  </Text>
                </HStack>
              </Box>
            )}

            <Box px={6} pt={6} pb={4}>
              <HStack mb={4} justify="space-between" align="flex-start">
                <Heading size="md" color="text.primary" maxW="600px" lineHeight="1.35">
                  {selectedEmail.subject}
                </Heading>
                {selectedEmail.tag && (
                  <Badge colorScheme={TAG_COLORS[selectedEmail.tag] || 'gray'} flexShrink={0}>
                    {selectedEmail.tag}
                  </Badge>
                )}
              </HStack>

              <HStack spacing={4} mb={5}>
                <Avatar size="md" name={selectedEmail.sender} />
                <Box flex="1">
                  <Text fontWeight="700" color="text.primary">{selectedEmail.sender}</Text>
                  <Text fontSize="xs" color="text.muted">{selectedEmail.email}</Text>
                  {selectedEmail.to && (
                    <Text fontSize="xs" color="text.muted" mt={0.5}>To: {selectedEmail.to}</Text>
                  )}
                </Box>
                <Text fontSize="sm" color="text.muted" flexShrink={0}>{selectedEmail.time}</Text>
              </HStack>

              <Divider mb={5} borderColor="border.subtle" />

              <Text whiteSpace="pre-wrap" lineHeight="1.85" color="text.primary" fontSize="sm">
                {selectedEmail.fullBody}
              </Text>
            </Box>
          </Box>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box maxW="1100px" mx="auto" pt={8} pb={12} px={4}>
        {/* Top bar */}
        <HStack mb={6} justify="space-between">
          <Heading size="xl" color="text.primary">Email</Heading>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="text.muted" />
            </InputLeftElement>
            <Input
              placeholder="Search emails…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              borderRadius="full" fontSize="sm"
              bg="background.raised" borderColor="border.subtle"
            />
          </InputGroup>
        </HStack>

        {/* Filter tabs */}
        <HStack spacing={2} mb={6} flexWrap="wrap">
          {([
            { key: 'all', label: `All (${emails.length})`, icon: FiMail, scheme: 'blue' },
            { key: 'unread', label: `Unread (${unreadCount})`, icon: FiMail, scheme: 'purple' },
            { key: 'starred', label: 'Starred', icon: FiStar, scheme: 'yellow' },
            { key: 'urgent', label: `Urgent (${urgentCount})`, icon: FiAlertTriangle, scheme: 'red' },
          ] as const).map(f => (
            <Badge
              key={f.key}
              as="button"
              onClick={() => setFilter(f.key)}
              colorScheme={filter === f.key ? f.scheme : 'gray'}
              px={3} py={1.5} borderRadius="full"
              display="flex" alignItems="center" gap={1}
              cursor="pointer" fontSize="xs"
              opacity={filter === f.key ? 1 : 0.6}
              transition="opacity 0.15s"
            >
              <Icon as={f.icon} boxSize={3} />
              {f.label}
            </Badge>
          ))}
        </HStack>

        {/* Email list */}
        <Box borderWidth="1px" borderColor="border.subtle" borderRadius="xl" bg="background.surface" overflow="hidden">
          {filtered.length === 0 ? (
            <Box p={10} textAlign="center">
              <Text color="text.disabled">No emails match your filter.</Text>
            </Box>
          ) : (
            filtered.map((email, i) => (
              <React.Fragment key={email.id}>
                {i > 0 && <Divider borderColor="border.subtle" />}
                <HStack
                  px={5} py={4} spacing={4}
                  bg={email.read ? 'background.surface' : 'rgba(96,165,250,0.06)'}
                  _hover={{ bg: email.urgent ? 'rgba(248,113,113,0.08)' : 'background.raised' }}
                  cursor="pointer"
                  onClick={() => setSelectedEmail(email)}
                  transition="background 0.1s"
                >
                  <Avatar size="sm" name={email.sender} flexShrink={0} />
                  <Box flex="1" minW={0}>
                    <HStack mb={0.5} justify="space-between">
                      <HStack spacing={2} minW={0}>
                        <Text
                          fontWeight={email.read ? '500' : '700'}
                          color="text.primary" fontSize="sm" noOfLines={1}
                        >
                          {email.sender}
                        </Text>
                        {email.starred && <Icon as={FiStar} color="yellow.500" boxSize={3} flexShrink={0} />}
                        {email.urgent && <Icon as={FiAlertTriangle} color="#F87171" boxSize={3} flexShrink={0} />}
                        {email.tag && (
                          <Badge
                            colorScheme={TAG_COLORS[email.tag] || 'gray'}
                            fontSize="9px" px={1.5} py={0.5} borderRadius="full"
                          >
                            {email.tag}
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="text.disabled" flexShrink={0} ml={2}>{email.time}</Text>
                    </HStack>
                    <Text
                      fontWeight={email.read ? '400' : '600'}
                      fontSize="sm" color="text.primary" mb={0.5} noOfLines={1}
                    >
                      {email.subject}
                    </Text>
                    <Text fontSize="xs" color="text.muted" noOfLines={1}>{email.preview}</Text>
                  </Box>
                </HStack>
              </React.Fragment>
            ))
          )}
        </Box>
      </Box>
    </AppLayout>
  );
}
