'use client';

import { useState } from 'react';
import {
  Box, Flex, Text, Heading, Badge, Avatar, HStack, VStack,
  Icon, SimpleGrid, Select, Tag, Divider, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure,
} from '@chakra-ui/react';
import {
  FiGitPullRequest, FiAlertTriangle, FiCheckCircle, FiClock,
  FiUsers, FiLink, FiShield, FiZap, FiThumbsUp, FiThumbsDown, FiMessageSquare,
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import { getMemberById, jiraTickets, shadowDecisions } from '@/data/mockData';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type DecisionStatus = 'confirmed' | 'proposed' | 'conflicted' | 'superseded' | 'awaiting_approval';
type DecisionImpact = 'critical' | 'high' | 'medium' | 'low';

interface OrgDecision {
  id: string;
  title: string;
  summary: string;
  rationale: string;
  status: DecisionStatus;
  impact: DecisionImpact;
  confidence: number;
  madeById: string;
  approvedById?: string;
  affectedTeams: string[];
  linkedTickets: string[];
  linkedPRs: number[];
  createdDaysAgo: number;
  escalatedToCTO: boolean;
  isConflict?: boolean;
  conflictsWith?: string;
  tags: string[];
}

// ─── Decisions awaiting CTO approval ───────────────────────
const pendingApprovals: OrgDecision[] = [
  {
    id: 'pend-001',
    title: 'Adopt GitHub Actions as Company-Wide CI/CD Standard',
    summary: 'Infrastructure team proposes replacing Jenkins with GitHub Actions across all 14 repositories. Estimated 30% reduction in pipeline maintenance overhead and full integration with existing GitHub workflows.',
    rationale: 'Jenkins requires dedicated infra-ops time for upgrades, plugin management, and incident response. GitHub Actions is already used by 6 of 14 repos informally. Standardising eliminates context switching and reduces MTTR on build failures.',
    status: 'awaiting_approval',
    impact: 'high',
    confidence: 0.89,
    madeById: 'u-012',
    affectedTeams: ['Infrastructure', 'Backend Platform', 'Frontend', 'DevOps'],
    linkedTickets: ['INFRA-031', 'INFRA-032'],
    linkedPRs: [301],
    createdDaysAgo: 4,
    escalatedToCTO: true,
    tags: ['ci-cd', 'github-actions', 'jenkins', 'infra-standard'],
  },
  {
    id: 'pend-002',
    title: 'Enforce Mandatory API Rate Limiting Across All Public Endpoints',
    summary: 'Security team requests CTO sign-off to enforce rate limiting (500 req/min per token) on all external-facing APIs. Required for SOC 2 Type II audit scheduled March 20th.',
    rationale: 'Current public endpoints have no rate limiting. Two recent scraping incidents (logged in SEC-009, SEC-010) consumed 40% of API capacity. SOC 2 auditors flagged absence of rate limiting as a control gap. Implementation is ready — needs executive approval to deploy.',
    status: 'awaiting_approval',
    impact: 'critical',
    confidence: 0.96,
    madeById: 'u-015',
    affectedTeams: ['Security', 'Backend Platform', 'API Gateway'],
    linkedTickets: ['SEC-009', 'SEC-010', 'SEC-011'],
    linkedPRs: [298, 299],
    createdDaysAgo: 2,
    escalatedToCTO: true,
    tags: ['security', 'rate-limiting', 'soc2', 'compliance', 'urgent'],
  },
  {
    id: 'pend-003',
    title: 'Approve Q2 Engineering Headcount — 3 Senior Backend Hires',
    summary: 'Engineering VP requests approval for 3 senior backend engineer hires in Q2. Roles focused on data pipeline, API infrastructure, and real-time systems. Total comp budget: $720k annualised.',
    rationale: 'Current backend team (8 engineers) is at 94% utilisation per last sprint retro. Carlos and two others flagged at burnout risk (56+ hr/wk for 6 weeks). Redis/Memcached blocker and SEC-007 remediation cannot run in parallel without additional capacity.',
    status: 'awaiting_approval',
    impact: 'high',
    confidence: 0.92,
    madeById: 'u-004',
    affectedTeams: ['Backend Platform', 'Engineering Leadership'],
    linkedTickets: ['ENG-018', 'ENG-019'],
    linkedPRs: [],
    createdDaysAgo: 1,
    escalatedToCTO: true,
    tags: ['headcount', 'hiring', 'q2-planning', 'budget'],
  },
  {
    id: 'pend-004',
    title: 'Use Redis as Primary Caching Layer (Backend Proposal)',
    summary: 'Backend Platform team proposes replacing Memcached with Redis for transaction query caching. Staging benchmarks show 43% P99 latency improvement. Conflicts with current infrastructure standard INFRA-023.',
    rationale: 'Redis supports richer data structures (sorted sets, pub/sub, streams) needed for future real-time features. QA benchmarks confirm Redis outperforms Memcached under burst load (QA-034). Requires INFRA policy update and CTO sign-off to override existing standard.',
    status: 'awaiting_approval',
    impact: 'high',
    confidence: 0.84,
    madeById: 'u-004',
    affectedTeams: ['Backend Platform', 'Infrastructure'],
    linkedTickets: ['CORE-078', 'CORE-079', 'CORE-082'],
    linkedPRs: [289, 292],
    createdDaysAgo: 20,
    escalatedToCTO: true,
    isConflict: true,
    conflictsWith: 'pend-005',
    tags: ['redis', 'caching', 'performance', 'needs-cto-decision'],
  },
  {
    id: 'pend-005',
    title: 'Retain Memcached as Infrastructure Caching Standard',
    summary: 'Infrastructure team recommends keeping Memcached as the company caching standard. Existing tooling, SLAs, and monitoring are all built around Memcached. Conflicts with Backend Platform Redis proposal.',
    rationale: 'Switching to Redis adds operational overhead, requires new runbooks, and existing Memcached clusters meet current SLA targets. Redis migration risk is unquantified at production scale. INFRA-023 policy must be respected without CTO override.',
    status: 'awaiting_approval',
    impact: 'high',
    confidence: 0.71,
    madeById: 'u-012',
    affectedTeams: ['Infrastructure', 'Backend Platform'],
    linkedTickets: ['INFRA-023', 'INFRA-024', 'INFRA-025'],
    linkedPRs: [291, 45],
    createdDaysAgo: 18,
    escalatedToCTO: true,
    isConflict: true,
    conflictsWith: 'pend-004',
    tags: ['memcached', 'caching', 'infra-standard', 'blocked'],
  },
];

const decisions: OrgDecision[] = [
  {
    id: 'dec-001',
    title: 'Adopt OAuth 2.0 as Mandatory API Authentication Standard',
    summary: 'All internal and external API endpoints must migrate to OAuth 2.0. Basic Auth is prohibited effective immediately per SEC-STD-012.',
    rationale: 'Basic Auth transmits credentials in every request header (base64 encoded, not encrypted). OAuth 2.0 scoped tokens reduce attack surface, enable fine-grained permissions, and meet SOC 2 Type II compliance requirements.',
    status: 'confirmed',
    impact: 'critical',
    confidence: 0.97,
    madeById: 'u-015',
    approvedById: 'u-001',
    affectedTeams: ['Backend Platform', 'Frontend', 'Security'],
    linkedTickets: ['SEC-001'],
    linkedPRs: [],
    createdDaysAgo: 25,
    escalatedToCTO: true,
    tags: ['security', 'oauth', 'compliance', 'company-policy'],
  },
  {
    id: 'dec-004',
    title: 'Ship User Profile Endpoints with Basic Auth',
    summary: 'Frontend team shipped /api/user-profile, /api/notifications, and /api/user-settings using HTTP Basic Auth to meet sprint deadline. Not escalated to leadership.',
    rationale: 'Sprint deadline pressure. Frontend Lead opted for Basic Auth as the fastest implementation path. SEC-001 policy was not reviewed before merging. This directly violates the confirmed OAuth 2.0 mandate.',
    status: 'conflicted',
    impact: 'critical',
    confidence: 0.95,
    madeById: 'u-008',
    affectedTeams: ['Frontend', 'Security'],
    linkedTickets: ['WEB-045', 'WEB-046', 'WEB-047'],
    linkedPRs: [267, 268, 271],
    createdDaysAgo: 9,
    escalatedToCTO: false,
    isConflict: true,
    conflictsWith: 'dec-001',
    tags: ['auth', 'basic-auth', 'production', 'sec-violation', 'unescalated'],
  },
  {
    id: 'dec-005',
    title: 'Quietly Remediate OAuth Violation Without Leadership Notification',
    summary: 'Frontend Lead started a draft PR (#294) to fix the Basic Auth violation after an informal heads-up from Marcus (Security). Not linked to SEC-007. Grace not informed.',
    rationale: 'Jack initiated the fix but chose not to escalate, likely to avoid scrutiny of the original violation. Draft PR has no reviewers assigned. Security team is not formally involved.',
    status: 'proposed',
    impact: 'high',
    confidence: 0.91,
    madeById: 'u-008',
    affectedTeams: ['Frontend'],
    linkedTickets: ['WEB-051'],
    linkedPRs: [294],
    createdDaysAgo: 3,
    escalatedToCTO: false,
    isConflict: true,
    conflictsWith: 'dec-001',
    tags: ['oauth', 'remediation', 'draft', 'not-escalated'],
  },
  {
    id: 'dec-006',
    title: 'Increase Memcached Connection Pool to Handle Traffic Spikes',
    summary: "DevOps Lead merged a quick fix (PR #291) bumping Memcached pool from 10 → 50 connections while the caching architecture debate is ongoing.",
    rationale: "Short-term mitigation for production traffic spikes. Signals DevOps commitment to Memcached while Alice's Redis proposal is under review — creates an implicit conflict of interest.",
    status: 'confirmed',
    impact: 'medium',
    confidence: 0.78,
    madeById: 'u-012',
    affectedTeams: ['Infrastructure', 'Backend Platform'],
    linkedTickets: ['INFRA-023'],
    linkedPRs: [291],
    createdDaysAgo: 5,
    escalatedToCTO: false,
    isConflict: true,
    conflictsWith: 'dec-002',
    tags: ['memcached', 'hotfix', 'not-escalated'],
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DecisionStatus, { color: string; glow: string; icon: any; label: string }> = {
  confirmed:         { color: '#34D399', glow: 'rgba(52,211,153,0.15)',  icon: FiCheckCircle,    label: 'Confirmed'          },
  proposed:          { color: '#A78BFA', glow: 'rgba(167,139,250,0.15)', icon: FiClock,          label: 'Proposed'           },
  conflicted:        { color: '#F87171', glow: 'rgba(248,113,113,0.15)', icon: FiAlertTriangle,  label: 'Conflicted'         },
  superseded:        { color: '#71717A', glow: 'rgba(113,113,122,0.15)', icon: FiGitPullRequest, label: 'Superseded'         },
  awaiting_approval: { color: '#FBBF24', glow: 'rgba(251,191,36,0.15)', icon: FiClock,          label: 'Awaiting Approval'  },
};

const IMPACT_COLOR: Record<DecisionImpact, string> = {
  critical: '#F87171',
  high:     '#FBBF24',
  medium:   '#60A5FA',
  low:      '#34D399',
};

const IMPACT_BG: Record<DecisionImpact, string> = {
  critical: 'rgba(248,113,113,0.12)',
  high:     'rgba(251,191,36,0.12)',
  medium:   'rgba(96,165,250,0.12)',
  low:      'rgba(52,211,153,0.12)',
};

function confidenceBar(c: number) {
  if (c >= 0.9) return { color: '#34D399', label: `${Math.round(c * 100)}% confidence` };
  if (c >= 0.75) return { color: '#A78BFA', label: `${Math.round(c * 100)}% confidence` };
  if (c >= 0.5)  return { color: '#FBBF24', label: `${Math.round(c * 100)}% confidence` };
  return { color: '#F87171', label: `${Math.round(c * 100)}% confidence` };
}

// ─────────────────────────────────────────────────────────────
// Decision Card
// ─────────────────────────────────────────────────────────────

function DecisionCard({ dec, onClick, onApprove, onReject }: {
  dec: OrgDecision;
  onClick: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}) {
  const maker = getMemberById(dec.madeById);
  const sc    = STATUS_CONFIG[dec.status];
  const conf  = confidenceBar(dec.confidence);

  return (
    <Box
      bg="background.surface"
      border="1px solid"
      borderColor={dec.isConflict ? 'rgba(248,113,113,0.3)' : dec.escalatedToCTO ? 'border.subtle' : 'rgba(251,191,36,0.25)'}
      borderRadius="xl"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.18s cubic-bezier(0.4,0,0.2,1)"
      _hover={{
        borderColor: sc.color,
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${sc.color}22`,
        bg: 'background.raised',
      }}
      onClick={onClick}
      position="relative"
    >
      {/* Status accent bar */}
      <Box
        h="2px"
        bgGradient={`linear(to-r, ${sc.color}, transparent)`}
      />

      <Box p={5}>
        {/* Header row */}
        <Flex justify="space-between" align="flex-start" mb={3} gap={3}>
          <Box flex={1} minW={0}>
            <Text
              fontWeight="700"
              fontSize="sm"
              color="text.primary"
              lineHeight="1.45"
              mb={2}
              letterSpacing="-0.01em"
            >
              {dec.title}
            </Text>

            <HStack spacing={2} flexWrap="wrap">
              {/* Status badge */}
              <HStack
                spacing={1.5}
                bg={sc.glow}
                border="1px solid"
                borderColor={`${sc.color}44`}
                borderRadius="full"
                px={2.5}
                py={0.5}
              >
                <Icon as={sc.icon} boxSize={3} color={sc.color} />
                <Text fontSize="10px" fontWeight="700" color={sc.color} textTransform="uppercase" letterSpacing="0.05em">
                  {sc.label}
                </Text>
              </HStack>

              {/* Impact badge */}
              <Box
                bg={IMPACT_BG[dec.impact]}
                border="1px solid"
                borderColor={`${IMPACT_COLOR[dec.impact]}33`}
                borderRadius="full"
                px={2.5}
                py={0.5}
              >
                <Text fontSize="10px" fontWeight="700" color={IMPACT_COLOR[dec.impact]} textTransform="uppercase" letterSpacing="0.05em">
                  {dec.impact} impact
                </Text>
              </Box>

              {/* Confidence */}
              <Box
                bg="background.overlay"
                border="1px solid"
                borderColor="border.subtle"
                borderRadius="full"
                px={2.5}
                py={0.5}
              >
                <Text fontSize="10px" fontWeight="600" color={conf.color}>
                  {conf.label}
                </Text>
              </Box>
            </HStack>
          </Box>

          {/* Right badges */}
          <VStack spacing={1} align="flex-end" flexShrink={0}>
            {!dec.escalatedToCTO && (
              <Box
                bg="rgba(251,191,36,0.1)"
                border="1px solid"
                borderColor="rgba(251,191,36,0.3)"
                borderRadius="full"
                px={2.5}
                py={0.5}
              >
                <Text fontSize="10px" fontWeight="700" color="#FBBF24" textTransform="uppercase" letterSpacing="0.05em">
                  Not Escalated
                </Text>
              </Box>
            )}
            {dec.isConflict && (
              <Box
                bg="rgba(248,113,113,0.1)"
                border="1px solid"
                borderColor="rgba(248,113,113,0.3)"
                borderRadius="full"
                px={2.5}
                py={0.5}
              >
                <Text fontSize="10px" fontWeight="700" color="#F87171" textTransform="uppercase" letterSpacing="0.05em">
                  Policy Conflict
                </Text>
              </Box>
            )}
          </VStack>
        </Flex>

        {/* Summary */}
        <Text fontSize="xs" color="text.secondary" lineHeight="1.65" mb={4} noOfLines={2}>
          {dec.summary}
        </Text>

        {/* Footer */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <HStack spacing={2}>
            {maker && (
              <HStack spacing={1.5}>
                <Avatar size="xs" name={maker.name} bg="brand.600" color="white" />
                <Text fontSize="xs" color="text.muted">{maker.name}</Text>
              </HStack>
            )}
            <Text fontSize="xs" color="text.disabled">· {dec.createdDaysAgo}d ago</Text>
          </HStack>

          <HStack spacing={2}>
            {dec.linkedTickets.length > 0 && (
              <HStack spacing={1} bg="background.raised" borderRadius="full" px={2} py={0.5}>
                <Icon as={FiLink} boxSize={3} color="text.muted" />
                <Text fontSize="xs" color="text.muted">
                  {dec.linkedTickets.length} ticket{dec.linkedTickets.length > 1 ? 's' : ''}
                </Text>
              </HStack>
            )}
            {dec.affectedTeams.slice(0, 2).map(t => (
              <Box
                key={t}
                bg="background.overlay"
                border="1px solid"
                borderColor="border.subtle"
                borderRadius="full"
                px={2.5}
                py={0.5}
              >
                <Text fontSize="10px" color="text.muted" fontWeight="500">{t}</Text>
              </Box>
            ))}
          </HStack>
        </Flex>

        {/* ── Approval action bar ── */}
        {dec.status === 'awaiting_approval' && onApprove && onReject && (
          <>
            <Box h="1px" bg="rgba(251,191,36,0.15)" my={4} mx={-5} />
            <Flex gap={2} onClick={e => e.stopPropagation()}>
              <Box
                as="button"
                flex={1}
                display="flex" alignItems="center" justifyContent="center" gap={2}
                py={2.5} borderRadius="lg"
                bg="rgba(52,211,153,0.1)"
                border="1px solid rgba(52,211,153,0.3)"
                color="#34D399"
                fontSize="13px" fontWeight="700"
                cursor="pointer"
                _hover={{ bg: 'rgba(52,211,153,0.2)', borderColor: 'rgba(52,211,153,0.5)' }}
                transition="all 0.15s"
                onClick={() => onApprove(dec.id)}
              >
                <Icon as={FiThumbsUp} boxSize={3.5} />
                Approve
              </Box>
              <Box
                as="button"
                flex={1}
                display="flex" alignItems="center" justifyContent="center" gap={2}
                py={2.5} borderRadius="lg"
                bg="rgba(248,113,113,0.1)"
                border="1px solid rgba(248,113,113,0.3)"
                color="#F87171"
                fontSize="13px" fontWeight="700"
                cursor="pointer"
                _hover={{ bg: 'rgba(248,113,113,0.2)', borderColor: 'rgba(248,113,113,0.5)' }}
                transition="all 0.15s"
                onClick={() => onReject(dec.id)}
              >
                <Icon as={FiThumbsDown} boxSize={3.5} />
                Reject
              </Box>
              <Box
                as="button"
                display="flex" alignItems="center" justifyContent="center"
                px={3} py={2.5} borderRadius="lg"
                bg="background.raised"
                border="1px solid"
                borderColor="border.subtle"
                color="text.secondary"
                cursor="pointer"
                _hover={{ bg: 'background.overlay', color: 'text.primary' }}
                transition="all 0.15s"
                onClick={onClick}
                title="View details"
              >
                <Icon as={FiMessageSquare} boxSize={3.5} />
              </Box>
            </Flex>
          </>
        )}
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// Decision Detail Modal
// ─────────────────────────────────────────────────────────────

function DecisionModal({ dec, isOpen, onClose }: {
  dec: OrgDecision | null; isOpen: boolean; onClose: () => void;
}) {
  if (!dec) return null;
  const maker    = getMemberById(dec.madeById);
  const approver = dec.approvedById ? getMemberById(dec.approvedById) : null;
  const sc       = STATUS_CONFIG[dec.status];
  const conf     = confidenceBar(dec.confidence);
  const conflict = dec.conflictsWith ? decisions.find(d => d.id === dec.conflictsWith) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(6px)" bg="blackAlpha.700" />
      <ModalContent
        bg="background.surface"
        borderRadius="2xl"
        border="1px solid"
        borderColor="border.subtle"
        boxShadow="0 25px 60px rgba(0,0,0,0.8)"
        overflow="hidden"
      >
        <Box h="2px" bgGradient={`linear(to-r, ${sc.color}, transparent)`} />

        <ModalHeader pb={2} color="text.primary">
          <HStack spacing={3} align="flex-start">
            <Box
              bg={sc.glow}
              border="1px solid"
              borderColor={`${sc.color}44`}
              borderRadius="lg"
              p={2}
              flexShrink={0}
            >
              <Icon as={sc.icon} color={sc.color} boxSize={5} />
            </Box>
            <Box flex={1}>
              <Text fontSize="md" fontWeight="800" color="text.primary" lineHeight="1.35" letterSpacing="-0.02em">
                {dec.title}
              </Text>
              <HStack mt={2} flexWrap="wrap" gap={1.5}>
                <HStack
                  spacing={1.5}
                  bg={sc.glow}
                  border="1px solid"
                  borderColor={`${sc.color}44`}
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                >
                  <Icon as={sc.icon} boxSize={3} color={sc.color} />
                  <Text fontSize="10px" fontWeight="700" color={sc.color} textTransform="uppercase" letterSpacing="0.05em">
                    {sc.label}
                  </Text>
                </HStack>
                <Box
                  bg={IMPACT_BG[dec.impact]}
                  border="1px solid"
                  borderColor={`${IMPACT_COLOR[dec.impact]}33`}
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                >
                  <Text fontSize="10px" fontWeight="700" color={IMPACT_COLOR[dec.impact]} textTransform="uppercase" letterSpacing="0.05em">
                    {dec.impact} impact
                  </Text>
                </Box>
                <Box
                  bg="background.overlay"
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                >
                  <Text fontSize="10px" fontWeight="600" color={conf.color}>{conf.label}</Text>
                </Box>
                {!dec.escalatedToCTO && (
                  <Box
                    bg="rgba(251,191,36,0.1)"
                    border="1px solid"
                    borderColor="rgba(251,191,36,0.3)"
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                  >
                    <Text fontSize="10px" fontWeight="700" color="#FBBF24" textTransform="uppercase" letterSpacing="0.05em">
                      Not Escalated to CTO
                    </Text>
                  </Box>
                )}
              </HStack>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top={5} right={5} color="text.muted" _hover={{ bg: 'background.raised', color: 'text.primary' }} />

        <ModalBody pb={6}>
          {/* Conflict alert */}
          {dec.isConflict && conflict && (
            <Box
              bg="rgba(248,113,113,0.08)"
              border="1px solid"
              borderColor="rgba(248,113,113,0.25)"
              borderRadius="lg"
              p={3}
              mb={4}
            >
              <HStack spacing={2}>
                <Icon as={FiAlertTriangle} color="#F87171" boxSize={4} flexShrink={0} />
                <Box>
                  <Text fontSize="xs" fontWeight="700" color="#F87171">Policy Conflict Detected</Text>
                  <Text fontSize="xs" color="text.secondary">
                    Conflicts with: <Text as="span" color="text.primary" fontWeight="600">{conflict.title}</Text>
                  </Text>
                </Box>
              </HStack>
            </Box>
          )}

          {/* Not escalated alert */}
          {!dec.escalatedToCTO && (
            <Box
              bg="rgba(251,191,36,0.08)"
              border="1px solid"
              borderColor="rgba(251,191,36,0.25)"
              borderRadius="lg"
              p={3}
              mb={4}
            >
              <HStack spacing={2}>
                <Icon as={FiAlertTriangle} color="#FBBF24" boxSize={4} flexShrink={0} />
                <Text fontSize="xs" color="text.secondary">
                  <Text as="span" fontWeight="700" color="#FBBF24">Not escalated to CTO.</Text>{' '}
                  Grace Liu has no visibility into this decision.
                </Text>
              </HStack>
            </Box>
          )}

          {/* Summary */}
          <Box mb={4}>
            <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">
              Summary
            </Text>
            <Text fontSize="sm" color="text.secondary" lineHeight="1.7">{dec.summary}</Text>
          </Box>

          {/* Rationale */}
          <Box mb={4}>
            <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">
              Rationale
            </Text>
            <Text fontSize="sm" color="text.muted" lineHeight="1.7">{dec.rationale}</Text>
          </Box>

          <Divider mb={4} borderColor="border.subtle" />

          {/* People */}
          <SimpleGrid columns={2} gap={4} mb={4}>
            {maker && (
              <Box>
                <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">
                  Decision Maker
                </Text>
                <HStack spacing={2}>
                  <Avatar size="sm" name={maker.name} bg="brand.600" color="white" />
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="text.primary">{maker.name}</Text>
                    <Text fontSize="10px" color="text.muted">{maker.role}</Text>
                  </Box>
                </HStack>
              </Box>
            )}
            {approver && (
              <Box>
                <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">
                  Approved By
                </Text>
                <HStack spacing={2}>
                  <Avatar size="sm" name={approver.name} bg="brand.700" color="white" />
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="text.primary">{approver.name}</Text>
                    <Text fontSize="10px" color="text.muted">{approver.role}</Text>
                  </Box>
                </HStack>
              </Box>
            )}
          </SimpleGrid>

          {/* Linked tickets */}
          {dec.linkedTickets.length > 0 && (
            <Box mb={4}>
              <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">
                Linked Tickets ({dec.linkedTickets.length})
              </Text>
              <VStack spacing={1.5} align="stretch">
                {dec.linkedTickets.map(key => {
                  const t = jiraTickets.find(t => t.key === key);
                  const isConflict = t?.isConflict;
                  return (
                    <Flex
                      key={key}
                      justify="space-between"
                      align="center"
                      bg={isConflict ? 'rgba(248,113,113,0.08)' : 'background.raised'}
                      borderRadius="lg"
                      px={3}
                      py={2}
                      border="1px solid"
                      borderColor={isConflict ? 'rgba(248,113,113,0.25)' : 'border.subtle'}
                    >
                      <HStack spacing={2}>
                        <Text fontSize="xs" fontFamily="mono" color="semantic.decision" fontWeight="700">{key}</Text>
                        {t && <Text fontSize="xs" color="text.secondary" noOfLines={1}>{t.title}</Text>}
                      </HStack>
                      {t && (
                        <Box
                          bg={t.status === 'done' ? 'rgba(52,211,153,0.12)' : t.status === 'blocked' ? 'rgba(248,113,113,0.12)' : 'rgba(167,139,250,0.12)'}
                          border="1px solid"
                          borderColor={t.status === 'done' ? 'rgba(52,211,153,0.3)' : t.status === 'blocked' ? 'rgba(248,113,113,0.3)' : 'rgba(167,139,250,0.3)'}
                          borderRadius="full"
                          px={2}
                          py={0.5}
                          flexShrink={0}
                          ml={2}
                        >
                          <Text
                            fontSize="9px"
                            fontWeight="700"
                            color={t.status === 'done' ? '#34D399' : t.status === 'blocked' ? '#F87171' : '#A78BFA'}
                            textTransform="uppercase"
                            letterSpacing="0.04em"
                          >
                            {t.status}
                          </Text>
                        </Box>
                      )}
                    </Flex>
                  );
                })}
              </VStack>
            </Box>
          )}

          {/* Teams */}
          <Box>
            <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">
              Affected Teams
            </Text>
            <HStack flexWrap="wrap" gap={2}>
              {dec.affectedTeams.map(t => (
                <HStack
                  key={t}
                  spacing={1.5}
                  bg="background.raised"
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  <Icon as={FiUsers} color="text.muted" boxSize={3} />
                  <Text fontSize="xs" color="text.secondary" fontWeight="600">{t}</Text>
                </HStack>
              ))}
            </HStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function DecisionsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | DecisionStatus>('all');
  const [impactFilter, setImpactFilter] = useState<'all' | DecisionImpact>('all');
  const [selectedDec, setSelectedDec]   = useState<OrgDecision | null>(null);
  const [approvedIds, setApprovedIds]   = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds]   = useState<Set<string>>(new Set());
  const { isOpen, onOpen, onClose }     = useDisclosure();

  function openDec(dec: OrgDecision) {
    setSelectedDec(dec);
    onOpen();
  }

  function handleApprove(id: string) {
    setApprovedIds(prev => new Set([...prev, id]));
    setRejectedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  function handleReject(id: string) {
    setRejectedIds(prev => new Set([...prev, id]));
    setApprovedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }

  const activePending = pendingApprovals.filter(d => !approvedIds.has(d.id) && !rejectedIds.has(d.id));

  const filtered = decisions.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (impactFilter !== 'all' && d.impact !== impactFilter) return false;
    return true;
  });

  const confirmed   = decisions.filter(d => d.status === 'confirmed').length;
  const conflicts   = decisions.filter(d => d.isConflict).length;
  const unescalated = decisions.filter(d => !d.escalatedToCTO).length;

  const stats = [
    {
      label: 'Total Decisions',
      value: decisions.length,
      accent: '#A78BFA',
      bg: 'rgba(167,139,250,0.08)',
      border: 'rgba(167,139,250,0.2)',
    },
    {
      label: 'Confirmed',
      value: confirmed,
      accent: '#34D399',
      bg: 'rgba(52,211,153,0.08)',
      border: 'rgba(52,211,153,0.2)',
    },
    {
      label: 'Policy Conflicts',
      value: conflicts,
      accent: '#F87171',
      bg: 'rgba(248,113,113,0.08)',
      border: 'rgba(248,113,113,0.2)',
    },
    {
      label: 'Not Escalated',
      value: unescalated,
      accent: '#FBBF24',
      bg: 'rgba(251,191,36,0.08)',
      border: 'rgba(251,191,36,0.2)',
    },
  ];

  return (
    <AppLayout>
      <Box pb={12}>

        {/* ── Header ── */}
        <Flex justify="space-between" align="flex-start" mb={7} flexWrap="wrap" gap={3}>
          <Box>
            <Heading
              size="lg"
              fontWeight="800"
              color="text.primary"
              letterSpacing="-0.03em"
            >
              Decisions
            </Heading>
            <Text color="text.muted" fontSize="sm" mt={1}>
              Organisational decisions extracted from communications, tickets, and PRs
            </Text>
          </Box>
          {unescalated > 0 && (
            <HStack
              bg="rgba(251,191,36,0.08)"
              border="1px solid"
              borderColor="rgba(251,191,36,0.25)"
              borderRadius="xl"
              px={4}
              py={2.5}
              spacing={2}
            >
              <Icon as={FiAlertTriangle} color="#FBBF24" boxSize={4} />
              <Text fontSize="sm" color="#FBBF24" fontWeight="700">
                {unescalated} decision{unescalated > 1 ? 's' : ''} made without CTO visibility
              </Text>
            </HStack>
          )}
        </Flex>

        {/* ── Stats ── */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={7}>
          {stats.map(s => (
            <Box
              key={s.label}
              bg={s.bg}
              border="1px solid"
              borderColor={s.border}
              borderRadius="xl"
              p={5}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="2px"
                bg={`linear-gradient(to right, ${s.accent}, transparent)`}
              />
              <Text
                fontSize="3xl"
                fontWeight="800"
                color={s.accent}
                lineHeight="1"
                letterSpacing="-0.04em"
              >
                {s.value}
              </Text>
              <Text
                fontSize="xs"
                color="text.secondary"
                fontWeight="600"
                mt={2}
                letterSpacing="0.01em"
              >
                {s.label}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* ── Pending Your Approval ── */}
        {activePending.length > 0 && (
          <Box mb={8}>
            <Flex align="center" gap={3} mb={4}>
              <Box
                bg="rgba(251,191,36,0.12)"
                border="1px solid rgba(251,191,36,0.3)"
                borderRadius="lg"
                p={1.5}
              >
                <Icon as={FiClock} color="#FBBF24" boxSize={4} />
              </Box>
              <Box>
                <Text fontWeight="800" fontSize="md" color="text.primary" letterSpacing="-0.02em">
                  Pending Your Approval
                </Text>
                <Text fontSize="xs" color="text.muted">
                  {activePending.length} decision{activePending.length > 1 ? 's' : ''} escalated to you — action required
                </Text>
              </Box>
              <Box ml="auto">
                <Box
                  bg="rgba(251,191,36,0.1)"
                  border="1px solid rgba(251,191,36,0.3)"
                  borderRadius="full"
                  px={3} py={1}
                >
                  <Text fontSize="12px" fontWeight="800" color="#FBBF24">{activePending.length} pending</Text>
                </Box>
              </Box>
            </Flex>

            <VStack spacing={3} align="stretch">
              {activePending.map(dec => (
                <DecisionCard
                  key={dec.id}
                  dec={dec}
                  onClick={() => openDec(dec)}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </VStack>

            {(approvedIds.size > 0 || rejectedIds.size > 0) && (
              <Flex gap={3} mt={3} flexWrap="wrap">
                {[...approvedIds].map(id => {
                  const d = pendingApprovals.find(p => p.id === id);
                  return d ? (
                    <HStack key={id} bg="rgba(52,211,153,0.08)" border="1px solid rgba(52,211,153,0.25)"
                      borderRadius="lg" px={3} py={2} spacing={2}>
                      <Icon as={FiCheckCircle} color="#34D399" boxSize={3.5} />
                      <Text fontSize="xs" color="#34D399" fontWeight="600">Approved: {d.title.slice(0, 40)}…</Text>
                    </HStack>
                  ) : null;
                })}
                {[...rejectedIds].map(id => {
                  const d = pendingApprovals.find(p => p.id === id);
                  return d ? (
                    <HStack key={id} bg="rgba(248,113,113,0.08)" border="1px solid rgba(248,113,113,0.25)"
                      borderRadius="lg" px={3} py={2} spacing={2}>
                      <Icon as={FiAlertTriangle} color="#F87171" boxSize={3.5} />
                      <Text fontSize="xs" color="#F87171" fontWeight="600">Rejected: {d.title.slice(0, 40)}…</Text>
                    </HStack>
                  ) : null;
                })}
              </Flex>
            )}

            <Box h="1px" bg="border.subtle" mt={8} mb={7} />
          </Box>
        )}

        {/* ── Filters ── */}
        <HStack spacing={3} mb={6} flexWrap="wrap">
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            maxW="180px"
            size="sm"
            borderRadius="lg"
            bg="background.raised"
            borderColor="border.subtle"
            color="text.primary"
            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #8B5CF6' }}
          >
            <option value="all" style={{ background: '#18181F' }}>All Status</option>
            <option value="confirmed" style={{ background: '#18181F' }}>Confirmed</option>
            <option value="proposed" style={{ background: '#18181F' }}>Proposed</option>
            <option value="conflicted" style={{ background: '#18181F' }}>Conflicted</option>
            <option value="superseded" style={{ background: '#18181F' }}>Superseded</option>
          </Select>
          <Select
            value={impactFilter}
            onChange={e => setImpactFilter(e.target.value as any)}
            maxW="180px"
            size="sm"
            borderRadius="lg"
            bg="background.raised"
            borderColor="border.subtle"
            color="text.primary"
            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #8B5CF6' }}
          >
            <option value="all" style={{ background: '#18181F' }}>All Impact</option>
            <option value="critical" style={{ background: '#18181F' }}>Critical</option>
            <option value="high" style={{ background: '#18181F' }}>High</option>
            <option value="medium" style={{ background: '#18181F' }}>Medium</option>
            <option value="low" style={{ background: '#18181F' }}>Low</option>
          </Select>
          <Text fontSize="sm" color="text.muted">
            {filtered.length} decision{filtered.length !== 1 ? 's' : ''}
          </Text>
        </HStack>

        {/* ── Decision cards ── */}
        <VStack spacing={3} align="stretch">
          {filtered.map(dec => (
            <DecisionCard key={dec.id} dec={dec} onClick={() => openDec(dec)} />
          ))}

          {filtered.length === 0 && (
            <Flex
              justify="center"
              align="center"
              py={16}
              bg="background.surface"
              borderRadius="xl"
              border="1px solid"
              borderColor="border.subtle"
            >
              <VStack spacing={2}>
                <Icon as={FiGitPullRequest} boxSize={8} color="text.disabled" />
                <Text color="text.muted" fontSize="sm">No decisions match the selected filters</Text>
              </VStack>
            </Flex>
          )}
        </VStack>

      </Box>

      <DecisionModal dec={selectedDec} isOpen={isOpen} onClose={onClose} />
    </AppLayout>
  );
}
