'use client';

import React, { useState } from 'react';
import {
  Box, Text, VStack, HStack, Avatar, Input, InputGroup,
  InputLeftElement, Flex, Icon, Tooltip,
} from '@chakra-ui/react';
import {
  FiSearch, FiHash, FiLock, FiAlertTriangle, FiSend,
  FiZap, FiShield, FiCpu,
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: number;
  sender: string;
  role: string;
  time: string;
  content: string;
  isAria?: boolean;
  ariaSeverity?: 'critical' | 'warning' | 'info';
  reactions?: { emoji: string; count: number }[];
  thread?: number;
  isPinned?: boolean;
}

interface Channel {
  id: number;
  name: string;
  description: string;
  unread: number;
  isPrivate: boolean;
  isAlert?: boolean;
  memberCount: number;
}

interface DM {
  id: number;
  name: string;
  role: string;
  status: 'online' | 'away' | 'offline';
  unread: number;
  preview: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const channels: Channel[] = [
  { id: 1,  name: 'incident-sec007',   description: 'Active: SEC-007 Basic Auth violation — 17 days open',          unread: 12, isPrivate: false, isAlert: true,  memberCount: 8  },
  { id: 2,  name: 'sec-alerts',        description: 'Security team alerts and policy violations',                    unread: 7,  isPrivate: true,  isAlert: true,  memberCount: 5  },
  { id: 3,  name: 'backend-platform',  description: 'Backend engineering discussions and architecture',              unread: 4,  isPrivate: false, isAlert: false, memberCount: 12 },
  { id: 4,  name: 'infra-eng',         description: 'Infrastructure, DevOps, and platform standards',               unread: 3,  isPrivate: false, isAlert: false, memberCount: 9  },
  { id: 5,  name: 'qa-reports',        description: 'QA benchmarks, audit results, and test findings',              unread: 5,  isPrivate: false, isAlert: false, memberCount: 7  },
  { id: 6,  name: 'engineering',       description: 'All-engineering announcements and cross-team coordination',     unread: 2,  isPrivate: false, isAlert: false, memberCount: 28 },
  { id: 7,  name: 'cto-updates',       description: 'Grace Liu announcements and leadership decisions',             unread: 1,  isPrivate: false, isAlert: false, memberCount: 34 },
];

const directMessages: DM[] = [
  { id: 101, name: 'Irene Garcia',      role: 'Security Lead',      status: 'online',  unread: 3, preview: "Jack's PR still hasn't been reviewed..." },
  { id: 102, name: 'Alice Chen',        role: 'Backend Lead',       status: 'online',  unread: 1, preview: 'The Redis benchmarks are clear. We need...' },
  { id: 103, name: 'Carlos Rodriguez',  role: 'DevOps Engineer',    status: 'away',    unread: 0, preview: 'Still waiting on INFRA-024 approval...' },
  { id: 104, name: 'Bob Martinez',      role: 'DevOps Lead',        status: 'away',    unread: 0, preview: 'INFRA-STD-001 exists for a reason...' },
  { id: 105, name: 'Jack Williams',     role: 'Frontend Lead',      status: 'offline', unread: 0, preview: 'I was going to fix it quietly...' },
];

const channelMessages: Record<string, Message[]> = {
  'incident-sec007': [
    {
      id: 1, sender: 'Grace Liu', role: 'CTO', time: '9:02 AM',
      content: '🚨 All hands: SEC-007 is now **17 days open**. WEB-045, WEB-046, and WEB-047 are shipping Basic Auth to production in violation of SEC-STD-012. This needs to be resolved today. Who has eyes on the fix?',
      reactions: [{ emoji: '👀', count: 6 }, { emoji: '🔴', count: 3 }],
      isPinned: true,
    },
    {
      id: 2, sender: 'Irene Garcia', role: 'Security Lead', time: '9:08 AM',
      content: 'Grace — I\'ve been escalating this internally for a week. Jack has a draft PR (#294) to fix the Basic Auth violation, but it was not disclosed to the Security team. I found out through Marcus\'s audit (SEC-002). This should have been linked to SEC-007, not WEB-051.',
      reactions: [{ emoji: '😤', count: 2 }],
    },
    {
      id: 3, sender: 'Jack Williams', role: 'Frontend Lead', time: '9:15 AM',
      content: 'I was trying to fix it without causing alarm during the sprint. The OAuth implementation (PR #294) is ready — I just hadn\'t formally looped in Security yet. The fix works.',
      reactions: [{ emoji: '🤔', count: 4 }],
    },
    {
      id: 4, sender: 'ARIA', role: 'AI Chief of Staff', time: '9:16 AM', isAria: true, ariaSeverity: 'critical',
      content: '**AI Detection — Shadow Work Pattern:**\n\nPR #294 by Jack Williams remediates SEC-007 without formal Security team notification. Cross-referenced:\n• SEC-007 (17 days open, CRITICAL)\n• WEB-051 (linked to PR #294 — not SEC-007)\n• SEC-STD-012 (OAuth 2.0 mandate, confirmed)\n• SEC-002 audit (Marcus Thompson — discovered PR #294 independently)\n\nThis constitutes a shadow remediation of a security-critical issue. Escalated to CTO visibility.',
    },
    {
      id: 5, sender: 'Grace Liu', role: 'CTO', time: '9:19 AM',
      content: 'Jack, I appreciate the urgency to fix it, but any security vulnerability at this severity **must** go through formal Security review regardless of sprint pressure. Irene — please fast-track PR #294 review today. Jack — re-link PR #294 to SEC-007 immediately, not WEB-051.',
      reactions: [{ emoji: '👍', count: 7 }],
    },
    {
      id: 6, sender: 'Marcus Thompson', role: 'Security Engineer', time: '9:24 AM',
      content: 'I can start the review now. PR #294 needs the following before merge: (1) Formal link to SEC-007, (2) Security sign-off from Irene, (3) QA regression on WEB-045/046/047. Estimated 4 hours with parallel tracks.',
      reactions: [{ emoji: '✅', count: 5 }],
    },
    {
      id: 7, sender: 'Emma Wilson', role: 'QA Engineer', time: '9:31 AM',
      content: 'I\'ll run QA-037 regression against PR #294 once it\'s properly reviewed. Should have results by 2 PM.',
      reactions: [{ emoji: '🙏', count: 3 }],
    },
    {
      id: 8, sender: 'ARIA', role: 'AI Chief of Staff', time: '9:32 AM', isAria: true, ariaSeverity: 'info',
      content: '**AI Action Plan Generated:**\n\n1. Jack Williams → Re-link PR #294 to SEC-007 _(ETA: now)_\n2. Irene Garcia → Security review of PR #294 _(ETA: 12 PM)_\n3. Emma Wilson → QA regression _(ETA: 2 PM)_\n4. Grace Liu → Final approval + production freeze until done\n\nEstimated resolution: Today by 4 PM if parallel tracks hold.',
    },
  ],

  'sec-alerts': [
    {
      id: 1, sender: 'Marcus Thompson', role: 'Security Engineer', time: '2 days ago',
      content: '🔐 **SEC-002 Audit Complete:** WEB-045, WEB-046, WEB-047 confirmed using HTTP Basic Auth in production. All three endpoints transmit credentials in base64-encoded headers on every request. Credentials were captured via simulated MITM in <2 minutes. Linked to SEC-007.',
      reactions: [{ emoji: '🚨', count: 4 }],
      isPinned: true,
    },
    {
      id: 2, sender: 'ARIA', role: 'AI Chief of Staff', time: '2 days ago', isAria: true, ariaSeverity: 'critical',
      content: '**CRITICAL — Policy Violation Confirmed:**\n\nSEC-007 cross-referenced with SEC-STD-012 (OAuth 2.0 mandate, adopted 25d ago). The confirmed endpoints violate company-wide authentication policy. Irene Garcia has not received formal escalation from Frontend team. CTO Grace Liu has no visibility.',
    },
    {
      id: 3, sender: 'Irene Garcia', role: 'Security Lead', time: '2 days ago',
      content: 'I\'m formally logging a **Policy Violation Notice** against the Frontend team. This is the 3rd sprint where security standards have been bypassed to meet deadlines. We need a mandatory SEC-STD-012 training and a production freeze on any new auth endpoints until the team is compliant.',
      reactions: [{ emoji: '💯', count: 2 }],
    },
    {
      id: 4, sender: 'Marcus Thompson', role: 'Security Engineer', time: 'Yesterday',
      content: 'Found draft PR #294 by Jack Williams — appears to be a quiet fix for the Basic Auth violation. Not disclosed to Security, not linked to SEC-007. Flagging this.',
      reactions: [{ emoji: '👀', count: 3 }],
    },
    {
      id: 5, sender: 'ARIA', role: 'AI Chief of Staff', time: 'Yesterday', isAria: true, ariaSeverity: 'warning',
      content: '**AI Detection — Undisclosed Remediation:**\n\nPR #294 contains OAuth 2.0 implementation matching SEC-STD-012 requirements, authored by Jack Williams (Frontend Lead). It is linked to WEB-051, not SEC-007. No Security team reviewers assigned. Confidence: 94%.',
    },
  ],

  'backend-platform': [
    {
      id: 1, sender: 'Alice Chen', role: 'Backend Lead', time: '3 days ago',
      content: '📊 **QA-034 Results are in.** Redis benchmark under production load:\n• P99 latency: **2.1ms** (Memcached: 3.5ms)\n• Cache eviction rate: **0.3%** (Memcached: 4.1%)\n• Throughput at 10k RPS: Redis wins by 43%\n\nThe data is unambiguous. INFRA-024 needs to unblock Redis adoption.',
      reactions: [{ emoji: '🚀', count: 5 }, { emoji: '📈', count: 3 }],
      isPinned: true,
    },
    {
      id: 2, sender: 'David Kim', role: 'Backend Engineer', time: '3 days ago',
      content: 'PR #292 is ready — zero-downtime migration using dual-write strategy. We write to both Memcached and Redis for 2 weeks, then cut over. No risk to production SLAs.',
      reactions: [{ emoji: '👍', count: 4 }],
    },
    {
      id: 3, sender: 'Michael Park', role: 'VP Engineering', time: '2 days ago',
      content: 'Alice, INFRA-024 has been pending Bob\'s approval for **14 days**. I\'ve pinged him 3 times. We\'re going to miss the Sprint 3 commitment on CORE-078 if this doesn\'t resolve today.',
      reactions: [{ emoji: '😤', count: 2 }, { emoji: '⏰', count: 3 }],
    },
    {
      id: 4, sender: 'Carlos Rodriguez', role: 'DevOps Engineer', time: '2 days ago',
      content: 'For what it\'s worth — I\'ve been sitting on INFRA-024, INFRA-025, and CORE-079 for two weeks waiting for a policy decision from above. Working 56h this week. Something needs to break this deadlock.',
      reactions: [{ emoji: '😢', count: 6 }, { emoji: '🙏', count: 4 }],
    },
    {
      id: 5, sender: 'ARIA', role: 'AI Chief of Staff', time: '2 days ago', isAria: true, ariaSeverity: 'warning',
      content: '**AI Detection — Resource Conflict:**\n\nCarlos Rodriguez is carrying 3 blocked tickets (INFRA-024, INFRA-025, CORE-079) for 14+ days due to the unresolved Redis/Memcached policy deadlock. Hours logged this week: 56h. Burnout risk flagged. Root cause: Bob Martinez (DevOps) and Alice Chen (Backend) have conflicting architectural positions with no CTO decision to break the tie.',
    },
    {
      id: 6, sender: 'Alice Chen', role: 'Backend Lead', time: 'Yesterday',
      content: 'Carlos — I\'m sorry. This is on the architecture deadlock, not on you. Grace has directional approval for Redis but Bob hasn\'t formally updated INFRA-STD-001. @Grace Liu can we get a formal decision today?',
      reactions: [{ emoji: '💪', count: 3 }],
    },
  ],

  'infra-eng': [
    {
      id: 1, sender: 'Bob Martinez', role: 'DevOps Lead', time: '4 days ago',
      content: 'INFRA-STD-001 is clear — Memcached is our approved caching standard. I understand the QA-034 data, but our entire production monitoring, alerting, and runbooks are built around Memcached. Migrating to Redis is a 3-month project minimum with real operational risk.',
      reactions: [{ emoji: '🤔', count: 3 }],
      isPinned: true,
    },
    {
      id: 2, sender: 'Alice Chen', role: 'Backend Lead', time: '4 days ago',
      content: 'Bob, with respect, INFRA-STD-001 was written in 2022 before we had production-scale data. QA-034 is from *this sprint* at *our* load. The risk of *not* switching is continued degradation.',
      reactions: [{ emoji: '👀', count: 2 }],
    },
    {
      id: 3, sender: 'Bob Martinez', role: 'DevOps Lead', time: '3 days ago',
      content: 'Merged PR #291 — bumped Memcached connection pool from 10 → 50 connections. This should handle the traffic spikes we\'ve been seeing. Short-term solution while the architecture debate continues.',
      reactions: [{ emoji: '✅', count: 2 }, { emoji: '😬', count: 3 }],
    },
    {
      id: 4, sender: 'ARIA', role: 'AI Chief of Staff', time: '3 days ago', isAria: true, ariaSeverity: 'warning',
      content: '**AI Detection — Conflicting Decisions:**\n\nPR #291 (Memcached pool increase, merged by Bob Martinez) was committed while the Redis/Memcached architecture decision is formally unresolved. This creates an implicit organizational commitment to Memcached without a formal CTO decision, directly conflicting with Alice Chen\'s Redis proposal (INFRA-024). Decision deadlock is now 14 days old.',
    },
    {
      id: 5, sender: 'Leo Zhang', role: 'QA Lead', time: '2 days ago',
      content: 'For reference: the Memcached pool bump in PR #291 *will* help with connection exhaustion but does NOT address the eviction rate problem. At 4.1% eviction, we\'re still serving stale data under peak load. Redis eviction was 0.3% in the same test.',
      reactions: [{ emoji: '📊', count: 4 }],
    },
    {
      id: 6, sender: 'Carlos Rodriguez', role: 'DevOps Engineer', time: 'Yesterday',
      content: 'Can someone with authority make a decision? I have 3 tickets blocked on this. I\'m the one who has to implement either solution and I just need to know which way we\'re going.',
      reactions: [{ emoji: '🙏', count: 7 }, { emoji: '💯', count: 4 }],
    },
  ],

  'qa-reports': [
    {
      id: 1, sender: 'Leo Zhang', role: 'QA Lead', time: '5 days ago',
      content: '📋 **QA-034 FINAL — Redis vs Memcached Benchmark**\n\nTest environment: Staging cluster, 10k RPS sustained\n• Redis P99: **2.1ms** | Memcached P99: **3.5ms** _(+67%)_\n• Redis eviction: **0.3%** | Memcached eviction: **4.1%** _(+1267%)_\n• Redis CPU @ peak: 42% | Memcached: 61%\n\nConclusion: Redis outperforms Memcached on every metric at production load. Recommend INFRA-STD-001 update.',
      reactions: [{ emoji: '📊', count: 5 }, { emoji: '🏆', count: 3 }],
      isPinned: true,
    },
    {
      id: 2, sender: 'Emma Wilson', role: 'QA Engineer', time: '4 days ago',
      content: '🔐 **QA-037 — Basic Auth Security Audit**\n\nTargets: WEB-045, WEB-046, WEB-047\n• All 3 endpoints transmit credentials via Base64-encoded HTTP headers\n• MITM simulation: credentials captured in **<2 minutes** on simulated corporate network\n• Verdict: **CRITICAL** — actively exploitable in production\n\nLinked to SEC-007. Recommend immediate production freeze on these endpoints.',
      reactions: [{ emoji: '🚨', count: 6 }, { emoji: '😱', count: 2 }],
    },
    {
      id: 3, sender: 'ARIA', role: 'AI Chief of Staff', time: '4 days ago', isAria: true, ariaSeverity: 'critical',
      content: '**AI Cross-Reference — QA-037 × SEC-007:**\n\nQA-037 findings confirm SEC-007 is actively exploitable. Timeline:\n• SEC-007 opened 17 days ago (Irene Garcia)\n• QA-037 confirms criticality today\n• PR #294 (Jack Williams) exists but undisclosed to Security\n• CTO has no visibility\n\nRisk escalation: This is now a P0 incident.',
    },
    {
      id: 4, sender: 'Leo Zhang', role: 'QA Lead', time: '3 days ago',
      content: 'Formally linking QA-037 to SEC-007 in JIRA. Emma — can you be on standby to run regression against PR #294 once Security approves it?',
    },
    {
      id: 5, sender: 'Emma Wilson', role: 'QA Engineer', time: '3 days ago',
      content: 'Already queued. I\'ll run the full auth regression suite — should take about 90 minutes. Will post results here.',
      reactions: [{ emoji: '✅', count: 3 }],
    },
  ],

  'engineering': [
    {
      id: 1, sender: 'Grace Liu', role: 'CTO', time: '1 week ago',
      content: '👋 Team — reminder that SEC-STD-012 (OAuth 2.0 mandate) is **company policy** effective immediately. All new API endpoints must use OAuth 2.0. No exceptions without written approval from Security. Violations will be escalated.',
      reactions: [{ emoji: '👍', count: 14 }, { emoji: '✅', count: 8 }],
      isPinned: true,
    },
    {
      id: 2, sender: 'Michael Park', role: 'VP Engineering', time: '3 days ago',
      content: 'Sprint 3 status: INFRA approval queue is the critical blocker right now. Carlos has 3 tickets stuck. If we can\'t resolve the Redis/Memcached decision today, we\'re at risk of missing CORE-078 delivery.',
      reactions: [{ emoji: '😬', count: 4 }],
    },
    {
      id: 3, sender: 'Leo Zhang', role: 'QA Lead', time: '2 days ago',
      content: 'QA-037 report is published in #qa-reports. Basic Auth findings are P0. Everyone should read it.',
      reactions: [{ emoji: '👀', count: 9 }],
    },
    {
      id: 4, sender: 'ARIA', role: 'AI Chief of Staff', time: 'Yesterday', isAria: true, ariaSeverity: 'info',
      content: '**Weekly Org Health Summary:**\n\n🔴 **Critical:** SEC-007 (17d open), Basic Auth in prod, Shadow PR #294\n🟠 **High:** Redis/Memcached deadlock (14d), Carlos burnout risk (56h/wk)\n🟡 **Medium:** INFRA-024/025/CORE-079 blocked\n\nOverall health: **42/100** (declining). Primary bottleneck: 2 unresolved architectural decisions blocking 3 engineers.',
    },
    {
      id: 5, sender: 'Alice Chen', role: 'Backend Lead', time: 'Yesterday',
      content: 'Echoing ARIA — we really need the Redis/Memcached decision closed today. The team is burning out waiting.',
      reactions: [{ emoji: '💯', count: 6 }, { emoji: '🙏', count: 4 }],
    },
  ],

  'cto-updates': [
    {
      id: 1, sender: 'Grace Liu', role: 'CTO', time: '25 days ago',
      content: '📋 **Decision: OAuth 2.0 is now mandatory for all API authentication (SEC-STD-012)**\n\nEffective immediately, all internal and external API endpoints must use OAuth 2.0. Basic Auth, API key auth without rotation, and session tokens without expiry are prohibited. Security team (Irene Garcia) will audit compliance in Sprint 3.\n\nThis is a company-wide policy. Questions to Irene.',
      reactions: [{ emoji: '👍', count: 18 }, { emoji: '🔒', count: 12 }],
      isPinned: true,
    },
    {
      id: 2, sender: 'Grace Liu', role: 'CTO', time: '5 days ago',
      content: 'On the Redis/Memcached debate: I\'ve reviewed QA-034. The performance data supports Redis. I\'m giving **directional approval** for the Backend Platform team to proceed with Redis for transaction query caching. Bob — please update INFRA-STD-001 to reflect this. Final decision doc by EOD.',
      reactions: [{ emoji: '🎉', count: 8 }, { emoji: '✅', count: 6 }],
    },
    {
      id: 3, sender: 'ARIA', role: 'AI Chief of Staff', time: '5 days ago', isAria: true, ariaSeverity: 'warning',
      content: '**AI Note:** Grace Liu\'s directional approval for Redis (above) has not yet been translated into a formal INFRA-STD-001 update by Bob Martinez. INFRA-024 and INFRA-025 remain blocked. This approval may not be visible to Carlos Rodriguez, who is waiting on the formal policy change to proceed.',
    },
    {
      id: 4, sender: 'Grace Liu', role: 'CTO', time: 'Today',
      content: '🚨 SEC-007 update: I\'ve been briefed this morning. This is now a P0. PR #294 must go through Security review today. Production freeze on new auth endpoints until SEC-007 is resolved. I want a resolution update at 4 PM.',
      reactions: [{ emoji: '🔴', count: 5 }, { emoji: '👍', count: 10 }],
    },
  ],
};

// ─── Avatar colors by person ───────────────────────────────────────────────

const AVATAR_COLORS: Record<string, string> = {
  'Grace Liu':        '#7C3AED',
  'Irene Garcia':     '#DC2626',
  'Alice Chen':       '#2563EB',
  'Bob Martinez':     '#D97706',
  'Carlos Rodriguez': '#059669',
  'Jack Williams':    '#7C3AED',
  'Marcus Thompson':  '#6D28D9',
  'Emma Wilson':      '#DB2777',
  'Leo Zhang':        '#0891B2',
  'Michael Park':     '#374151',
  'David Kim':        '#1D4ED8',
  'ARIA':             '#8B5CF6',
};

// ─── Message bubble ────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.isAria) {
    const borderColor = msg.ariaSeverity === 'critical' ? 'rgba(248,113,113,0.5)'
      : msg.ariaSeverity === 'warning' ? 'rgba(251,191,36,0.4)'
      : 'rgba(167,139,250,0.4)';
    const bgColor = msg.ariaSeverity === 'critical' ? 'rgba(248,113,113,0.07)'
      : msg.ariaSeverity === 'warning' ? 'rgba(251,191,36,0.07)'
      : 'rgba(167,139,250,0.07)';
    const accentColor = msg.ariaSeverity === 'critical' ? '#F87171'
      : msg.ariaSeverity === 'warning' ? '#FBBF24'
      : '#A78BFA';

    return (
      <Box
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={3.5}
        ml={2}
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={accentColor} borderRadius="3px 0 0 3px" />
        <Box pl={2}>
          <HStack spacing={2} mb={2}>
            <Box
              bg={accentColor}
              borderRadius="full"
              p={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiCpu} boxSize={3} color="white" />
            </Box>
            <Text fontSize="11px" fontWeight="800" color={accentColor} textTransform="uppercase" letterSpacing="0.07em">
              ARIA · AI Chief of Staff
            </Text>
            <Box
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="full"
              px={2}
              py={0.5}
            >
              <Text fontSize="9px" fontWeight="700" color={accentColor} textTransform="uppercase" letterSpacing="0.05em">
                {msg.ariaSeverity === 'critical' ? 'Critical Alert' : msg.ariaSeverity === 'warning' ? 'Warning' : 'Insight'}
              </Text>
            </Box>
            <Text fontSize="10px" color="text.disabled" ml="auto">{msg.time}</Text>
          </HStack>
          <Text fontSize="xs" color="text.secondary" lineHeight="1.7" whiteSpace="pre-line">
            {msg.content}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      px={3}
      py={2.5}
      borderRadius="lg"
      transition="background 0.12s"
      _hover={{ bg: 'background.raised' }}
    >
      <HStack align="flex-start" spacing={3}>
        <Avatar
          size="sm"
          name={msg.sender}
          bg={AVATAR_COLORS[msg.sender] || '#7C3AED'}
          color="white"
          flexShrink={0}
          mt={0.5}
        />
        <Box flex={1} minW={0}>
          <HStack spacing={2} mb={0.5}>
            <Text fontSize="sm" fontWeight="700" color="text.primary" letterSpacing="-0.01em">
              {msg.sender}
            </Text>
            <Box
              bg="background.overlay"
              borderRadius="full"
              px={1.5}
              py={0.5}
            >
              <Text fontSize="9px" color="text.disabled" fontWeight="500">{msg.role}</Text>
            </Box>
            <Text fontSize="10px" color="text.disabled">{msg.time}</Text>
            {msg.isPinned && (
              <Box bg="rgba(167,139,250,0.1)" border="1px solid" borderColor="rgba(167,139,250,0.25)" borderRadius="full" px={1.5} py={0.5}>
                <Text fontSize="9px" color="#A78BFA" fontWeight="700">PINNED</Text>
              </Box>
            )}
          </HStack>
          <Text fontSize="sm" color="text.secondary" lineHeight="1.65" whiteSpace="pre-line">
            {msg.content}
          </Text>
          {msg.reactions && msg.reactions.length > 0 && (
            <HStack mt={1.5} spacing={1.5} flexWrap="wrap">
              {msg.reactions.map((r, i) => (
                <Box
                  key={i}
                  bg="background.raised"
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                  cursor="pointer"
                  _hover={{ borderColor: 'border.default', bg: 'background.overlay' }}
                  transition="all 0.12s"
                >
                  <Text fontSize="xs">{r.emoji} <Text as="span" color="text.muted" fontSize="10px">{r.count}</Text></Text>
                </Box>
              ))}
            </HStack>
          )}
        </Box>
      </HStack>
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SlackPage() {
  const [selectedChannel, setSelectedChannel] = useState('incident-sec007');
  const [searchQuery, setSearchQuery] = useState('');

  const ch = channels.find(c => c.name === selectedChannel);
  const msgs = channelMessages[selectedChannel] || [];
  const totalUnread = channels.reduce((s, c) => s + c.unread, 0);

  return (
    <AppLayout>
      <Box h="calc(100vh - 130px)" overflow="hidden" borderRadius="xl" border="1px solid" borderColor="border.subtle">
        <Flex h="full">

          {/* ── Sidebar ── */}
          <Box
            w="240px"
            flexShrink={0}
            bg="background.surface"
            borderRight="1px solid"
            borderColor="border.subtle"
            display="flex"
            flexDirection="column"
          >
            {/* Workspace header */}
            <Box p={4} borderBottom="1px solid" borderColor="border.subtle">
              <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" fontWeight="800" color="text.primary" letterSpacing="-0.02em">
                  nexus-tech
                </Text>
                {totalUnread > 0 && (
                  <Box bg="rgba(248,113,113,0.15)" border="1px solid" borderColor="rgba(248,113,113,0.3)" borderRadius="full" px={2} py={0.5}>
                    <Text fontSize="10px" fontWeight="700" color="#F87171">{totalUnread} unread</Text>
                  </Box>
                )}
              </HStack>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="text.muted" boxSize={3.5} />
                </InputLeftElement>
                <Input
                  placeholder="Search channels"
                  bg="background.raised"
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="lg"
                  color="text.primary"
                  fontSize="xs"
                  _placeholder={{ color: 'text.disabled' }}
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #8B5CF6' }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Box>

            {/* Channels */}
            <Box flex={1} overflowY="auto" p={3}>
              <Text fontSize="10px" fontWeight="700" color="text.disabled" textTransform="uppercase" letterSpacing="0.08em" mb={2} px={2}>
                Channels
              </Text>
              <VStack align="stretch" spacing={0.5} mb={5}>
                {channels.map(c => {
                  const isActive = selectedChannel === c.name;
                  return (
                    <HStack
                      key={c.id}
                      py={1.5}
                      px={2}
                      borderRadius="md"
                      cursor="pointer"
                      bg={isActive ? 'rgba(139,92,246,0.12)' : 'transparent'}
                      _hover={{ bg: isActive ? 'rgba(139,92,246,0.15)' : 'background.raised' }}
                      onClick={() => setSelectedChannel(c.name)}
                      transition="background 0.12s"
                    >
                      <Icon
                        as={c.isAlert ? FiAlertTriangle : c.isPrivate ? FiLock : FiHash}
                        boxSize={3.5}
                        color={c.isAlert ? (isActive ? '#F87171' : 'rgba(248,113,113,0.7)') : isActive ? 'text.primary' : 'text.muted'}
                        flexShrink={0}
                      />
                      <Text
                        fontSize="sm"
                        fontWeight={c.unread > 0 ? '700' : '400'}
                        color={isActive ? 'text.primary' : c.unread > 0 ? 'text.secondary' : 'text.muted'}
                        noOfLines={1}
                        flex={1}
                      >
                        {c.name}
                      </Text>
                      {c.unread > 0 && (
                        <Box
                          bg={c.isAlert ? 'rgba(248,113,113,0.2)' : 'rgba(167,139,250,0.2)'}
                          borderRadius="full"
                          minW="18px"
                          h="18px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          px={1}
                        >
                          <Text fontSize="9px" fontWeight="800" color={c.isAlert ? '#F87171' : '#A78BFA'}>
                            {c.unread}
                          </Text>
                        </Box>
                      )}
                    </HStack>
                  );
                })}
              </VStack>

              <Text fontSize="10px" fontWeight="700" color="text.disabled" textTransform="uppercase" letterSpacing="0.08em" mb={2} px={2}>
                Direct Messages
              </Text>
              <VStack align="stretch" spacing={0.5}>
                {directMessages.map(dm => (
                  <HStack key={dm.id} py={1.5} px={2} borderRadius="md" cursor="pointer" _hover={{ bg: 'background.raised' }} transition="background 0.12s" position="relative">
                    <Box position="relative" flexShrink={0}>
                      <Avatar size="xs" name={dm.name} bg={AVATAR_COLORS[dm.name] || '#7C3AED'} color="white" />
                      <Box
                        position="absolute"
                        bottom="-1px"
                        right="-1px"
                        w="8px"
                        h="8px"
                        borderRadius="full"
                        bg={dm.status === 'online' ? '#34D399' : dm.status === 'away' ? '#FBBF24' : '#52525B'}
                        border="2px solid"
                        borderColor="background.surface"
                      />
                    </Box>
                    <Box flex={1} minW={0}>
                      <Text fontSize="xs" fontWeight={dm.unread > 0 ? '700' : '500'} color={dm.unread > 0 ? 'text.primary' : 'text.secondary'} noOfLines={1}>
                        {dm.name}
                      </Text>
                    </Box>
                    {dm.unread > 0 && (
                      <Box bg="rgba(167,139,250,0.2)" borderRadius="full" minW="16px" h="16px" display="flex" alignItems="center" justifyContent="center" px={1}>
                        <Text fontSize="9px" fontWeight="800" color="#A78BFA">{dm.unread}</Text>
                      </Box>
                    )}
                  </HStack>
                ))}
              </VStack>
            </Box>
          </Box>

          {/* ── Main chat area ── */}
          <Flex flex={1} flexDirection="column" bg="background.primary" minW={0}>

            {/* Channel header */}
            <Box
              px={5}
              py={3.5}
              borderBottom="1px solid"
              borderColor="border.subtle"
              bg="background.surface"
              flexShrink={0}
            >
              <HStack spacing={2}>
                <Icon
                  as={ch?.isAlert ? FiAlertTriangle : ch?.isPrivate ? FiLock : FiHash}
                  color={ch?.isAlert ? '#F87171' : 'text.muted'}
                  boxSize={4}
                />
                <Text fontSize="sm" fontWeight="800" color="text.primary" letterSpacing="-0.01em">
                  {selectedChannel}
                </Text>
                <Box bg="border.subtle" w="1px" h="14px" mx={1} />
                <Text fontSize="xs" color="text.muted" noOfLines={1}>{ch?.description}</Text>
                <Box ml="auto" flexShrink={0}>
                  <HStack spacing={2}>
                    <Box bg="background.raised" border="1px solid" borderColor="border.subtle" borderRadius="full" px={2.5} py={1}>
                      <Text fontSize="10px" color="text.muted" fontWeight="500">{ch?.memberCount} members</Text>
                    </Box>
                    <Tooltip label="ARIA monitors this channel for conflicts and anomalies" hasArrow>
                      <HStack
                        spacing={1}
                        bg="rgba(139,92,246,0.1)"
                        border="1px solid"
                        borderColor="rgba(139,92,246,0.25)"
                        borderRadius="full"
                        px={2.5}
                        py={1}
                        cursor="default"
                      >
                        <Icon as={FiZap} boxSize={3} color="#A78BFA" />
                        <Text fontSize="10px" color="#A78BFA" fontWeight="700">ARIA Active</Text>
                      </HStack>
                    </Tooltip>
                  </HStack>
                </Box>
              </HStack>
            </Box>

            {/* Messages */}
            <Box flex={1} overflowY="auto" py={3}>
              <VStack spacing={1} align="stretch" px={2}>
                {msgs.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} />
                ))}
              </VStack>
            </Box>

            {/* Input */}
            <Box
              px={4}
              py={3}
              borderTop="1px solid"
              borderColor="border.subtle"
              bg="background.surface"
              flexShrink={0}
            >
              <HStack
                bg="background.raised"
                border="1px solid"
                borderColor="border.subtle"
                borderRadius="xl"
                px={4}
                py={2.5}
                _focusWithin={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #8B5CF6' }}
                transition="all 0.15s"
              >
                <Input
                  variant="unstyled"
                  placeholder={`Message #${selectedChannel}`}
                  fontSize="sm"
                  color="text.primary"
                  _placeholder={{ color: 'text.disabled' }}
                  flex={1}
                />
                <HStack spacing={2} flexShrink={0}>
                  <Icon as={FiShield} color="text.muted" boxSize={4} cursor="pointer" _hover={{ color: 'text.secondary' }} />
                  <Box
                    bg="brand.600"
                    borderRadius="lg"
                    p={1.5}
                    cursor="pointer"
                    _hover={{ bg: 'brand.500' }}
                    transition="background 0.15s"
                  >
                    <Icon as={FiSend} color="white" boxSize={3.5} />
                  </Box>
                </HStack>
              </HStack>
              <Text fontSize="10px" color="text.disabled" mt={1.5} pl={1}>
                ARIA monitors this channel for conflicts, shadow decisions, and policy violations
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Box>
    </AppLayout>
  );
}
