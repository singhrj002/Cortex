'use client';

import { useState } from 'react';
import {
  Box, Heading, Text, Flex, Card, CardBody, Badge, Button,
  HStack, VStack, SimpleGrid, Select, Tag, TagLabel,
  Alert, AlertIcon, Icon, Tooltip, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, ModalFooter,
  Tabs, TabList, TabPanels, Tab, TabPanel,
  Stat, StatLabel, StatNumber, Progress, Avatar, AvatarGroup,
  Grid, Divider,
} from '@chakra-ui/react';
import {
  FiAlertTriangle, FiCheck, FiClock, FiFilter, FiInfo,
  FiGitPullRequest, FiExternalLink, FiZap,
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import {
  shadowDecisions, getMemberById,
} from '@/data/mockData';

// ── Data ─────────────────────────────────────────────────────

const mockConflicts = [
  {
    id: 'conflict-001',
    title: 'OAuth 2.0 vs Basic Auth — Security Policy Violation',
    description: 'Security team mandated OAuth 2.0 (SEC-001, policy SEC-STD-012) for all APIs. Frontend team shipped Basic Auth to 3 production endpoints (WEB-045, WEB-046, WEB-047) without awareness of the policy. Currently live in production.',
    status: 'reviewing',
    severity: 'critical',
    affectedTeams: ['Security', 'Frontend', 'Leadership'],
    detectedVia: 'Security Audit SEC-002',
    createdAt: '2026-02-28T08:00:00Z',
    linkedTickets: ['SEC-001', 'SEC-007', 'WEB-045', 'WEB-046', 'WEB-047'],
    linkedPRs: [267, 268, 271, 294],
    shadowCount: 3,
    entities: [
      { type: 'Decision', name: 'SEC-001: OAuth 2.0 mandatory standard', id: 'SEC-001' },
      { type: 'Claim',    name: 'Basic Auth violates SEC-STD-012',         id: 'SEC-007' },
      { type: 'PR',       name: 'PR #267: Basic Auth merged to production', id: 'PR-267' },
    ],
    resolution: null,
    persons: ['u-015', 'u-016', 'u-008', 'u-001'],
  },
  {
    id: 'conflict-002',
    title: 'Redis vs Memcached — Infrastructure Standards Conflict',
    description: 'Backend team (Alice) proposed Redis for caching with 40% performance gain confirmed by QA. DevOps team (Bob) has Memcached as the infrastructure standard (INFRA-023). Both proposals have been escalated to CTO Grace Liu — awaiting final decision. DevOps also merged a Memcached pool optimization (PR #291) during review, signalling continued commitment to Memcached.',
    status: 'reviewing',
    severity: 'high',
    affectedTeams: ['Backend Platform', 'Infrastructure', 'QA'],
    detectedVia: 'Cross-team communications analysis',
    createdAt: '2026-02-10T09:00:00Z',
    linkedTickets: ['CORE-078', 'CORE-079', 'INFRA-023', 'INFRA-024', 'QA-034'],
    linkedPRs: [289, 291, 292],
    shadowCount: 0,
    entities: [
      { type: 'Decision', name: 'CORE-078: Redis caching layer — awaiting CTO approval', id: 'CORE-078' },
      { type: 'Decision', name: 'INFRA-023: Memcached as infra standard',                id: 'INFRA-023' },
      { type: 'Claim',    name: 'QA-034: Redis 40% faster under prod load',              id: 'QA-034' },
    ],
    resolution: null,
    persons: ['u-004', 'u-012', 'u-017', 'u-001'],
  },
  {
    id: 'conflict-003',
    title: 'Jack\'s Silent OAuth Remediation — Unescalated Fix',
    description: 'Jack Williams opened draft PR #294 to fix the Basic Auth violation (SEC-007) without linking it to the SEC-007 ticket, without informing Irene Garcia (Security Lead), and without escalating to CTO. The fix is in progress but completely invisible to leadership and security.',
    status: 'open',
    severity: 'high',
    affectedTeams: ['Frontend', 'Security', 'Leadership'],
    detectedVia: 'Git activity analysis — draft PR cross-reference',
    createdAt: '2026-02-26T11:00:00Z',
    linkedTickets: ['WEB-051', 'SEC-007'],
    linkedPRs: [294],
    shadowCount: 1,
    entities: [
      { type: 'PR',       name: 'PR #294 (DRAFT): OAuth migration — not escalated', id: 'PR-294' },
      { type: 'Claim',    name: 'SEC-007: Basic Auth violation unresolved',          id: 'SEC-007' },
    ],
    resolution: null,
    persons: ['u-008', 'u-015', 'u-001'],
  },
  {
    id: 'conflict-004',
    title: 'Memcached Optimization Merged Alongside Redis Migration',
    description: 'Bob Martinez merged PR #291 (Memcached pool size increase) while Alice\'s Redis migration PR #289 is actively under review. This signals Infrastructure\'s continued commitment to Memcached even as the CTO is being asked to approve Redis — creating architectural drift.',
    status: 'open',
    severity: 'medium',
    affectedTeams: ['Infrastructure', 'Backend Platform'],
    detectedVia: 'Cross-repo PR analysis',
    createdAt: '2026-02-21T15:00:00Z',
    linkedTickets: ['INFRA-023', 'CORE-079'],
    linkedPRs: [289, 291],
    shadowCount: 1,
    entities: [
      { type: 'PR',       name: 'PR #291: Memcached pool increase (merged)',      id: 'PR-291' },
      { type: 'PR',       name: 'PR #289: Redis caching layer (open, blocked)',   id: 'PR-289' },
      { type: 'Decision', name: 'CORE-079: Redis migration (blocked by INFRA)',   id: 'CORE-079' },
    ],
    resolution: null,
    persons: ['u-012', 'u-004', 'u-005'],
  },
];

// ── Helpers ──────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  open: 'red', reviewing: 'orange', resolved: 'green',
};
const severityColor: Record<string, string> = {
  critical: 'red', high: 'orange', medium: 'yellow', low: 'gray',
};

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function getSuggestedActions(conflict: typeof mockConflicts[0]) {
  const common = [
    { id: 'schedule_meeting', title: 'Schedule Resolution Meeting',  description: 'Bring all affected teams together to resolve the conflict.', icon: FiClock,  color: 'blue' },
    { id: 'create_task',      title: 'Create Action Items in JIRA',  description: 'Break resolution into specific tasks with owners.',            icon: FiCheck, color: 'green' },
  ];
  if (conflict.severity === 'critical') return [
    { id: 'implement_oauth', title: 'Migrate to OAuth 2.0 immediately', description: 'Assign Jack to complete PR #294 and merge before Friday release.', icon: FiZap,   color: 'red' },
    { id: 'security_review', title: 'Request Security Sign-off',        description: 'Irene Garcia must review and approve the OAuth migration.',        icon: FiInfo, color: 'purple' },
    ...common,
  ];
  return common;
}

// ── Cache Decision Modal ──────────────────────────────────────

function CacheDecisionModal({ isOpen, onClose, onDecide }: {
  isOpen: boolean;
  onClose: () => void;
  onDecide: (choice: 'redis' | 'memcached') => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.800" />
      <ModalContent bg="#111116" borderRadius="2xl" border="1px solid rgba(255,255,255,0.08)" overflow="hidden">
        <Box h="2px" bgGradient="linear(to-r, #34D399, #FBBF24, #60A5FA)" />

        <ModalHeader pb={2}>
          <HStack spacing={3}>
            <Box bg="rgba(251,191,36,0.12)" border="1px solid rgba(251,191,36,0.3)" borderRadius="lg" p={2} flexShrink={0}>
              <Icon as={FiZap} color="#FBBF24" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="md" fontWeight="800" color="white" letterSpacing="-0.02em">
                Caching Standard Decision
              </Text>
              <Text fontSize="xs" color="rgba(255,255,255,0.35)" fontWeight="400" mt={0.5}>
                Redis vs Memcached — your choice sets the company standard and closes this conflict
              </Text>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top={4} right={4} color="rgba(255,255,255,0.4)" _hover={{ bg: 'rgba(255,255,255,0.06)' }} />

        <ModalBody pb={6}>
          {/* Context banner */}
          <Box bg="rgba(251,191,36,0.06)" border="1px solid rgba(251,191,36,0.15)" borderRadius="lg" p={3} mb={5}>
            <Text fontSize="xs" color="rgba(251,191,36,0.9)" lineHeight="1.7">
              QA data (QA-034) confirms Redis delivers <Text as="span" fontWeight="700">43% P99 latency improvement</Text> under burst load.
              Infrastructure team has INFRA-023 — Memcached as the current company standard.
              Both proposals are escalated. Make the call.
            </Text>
          </Box>

          {/* Side-by-side */}
          <Grid templateColumns="1fr auto 1fr" gap={3} mb={5}>

            {/* Option A — Redis */}
            <Box bg="rgba(52,211,153,0.05)" border="1px solid rgba(52,211,153,0.2)" borderRadius="xl" p={5}>
              <HStack mb={3} spacing={2}>
                <Box w="8px" h="8px" borderRadius="full" bg="#34D399" flexShrink={0} />
                <Text fontSize="10px" fontWeight="800" color="#34D399" textTransform="uppercase" letterSpacing="0.1em">Option A</Text>
              </HStack>
              <Text fontSize="lg" fontWeight="800" color="white" letterSpacing="-0.03em" mb={0.5}>Redis</Text>
              <Text fontSize="11px" color="rgba(255,255,255,0.35)" mb={4}>Alice Chen · Backend Platform · 20d ago</Text>

              <VStack align="stretch" spacing={2.5} mb={4}>
                {[
                  { pro: true,  text: '43% P99 latency improvement — QA-034 confirmed' },
                  { pro: true,  text: 'Sorted sets, pub/sub, streams for real-time roadmap' },
                  { pro: true,  text: 'PR #289 implementation complete and ready' },
                  { pro: false, text: 'New DevOps runbooks + Redis training required' },
                  { pro: false, text: 'INFRA-023 policy must be formally updated' },
                ].map((item, i) => (
                  <HStack key={i} align="flex-start" spacing={2}>
                    <Box
                      w="15px" h="15px" borderRadius="full" flexShrink={0} mt="1px"
                      bg={item.pro ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.1)'}
                      display="flex" alignItems="center" justifyContent="center"
                    >
                      <Icon as={item.pro ? FiCheck : FiAlertTriangle} color={item.pro ? '#34D399' : '#F87171'} boxSize={2.5} />
                    </Box>
                    <Text fontSize="11px" color={item.pro ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)'} lineHeight="1.5">
                      {item.text}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Box
                as="button"
                w="full" py={2.5} borderRadius="lg"
                bg="rgba(52,211,153,0.12)" border="1px solid rgba(52,211,153,0.35)"
                color="#34D399" fontSize="13px" fontWeight="700"
                cursor="pointer"
                _hover={{ bg: 'rgba(52,211,153,0.22)', borderColor: '#34D399', boxShadow: '0 0 16px rgba(52,211,153,0.2)' }}
                transition="all 0.15s"
                display="flex" alignItems="center" justifyContent="center" gap={2}
                onClick={() => onDecide('redis')}
              >
                <Icon as={FiCheck} boxSize={3.5} />
                Approve Redis
              </Box>
            </Box>

            {/* VS divider */}
            <Flex direction="column" align="center" justify="center" py={4}>
              <Box flex={1} w="1px" bg="rgba(255,255,255,0.06)" />
              <Box
                bg="#1A1A24" border="1px solid rgba(255,255,255,0.08)"
                borderRadius="full" px={2} py={1} my={2}
              >
                <Text fontSize="10px" fontWeight="800" color="rgba(255,255,255,0.2)" letterSpacing="0.12em">VS</Text>
              </Box>
              <Box flex={1} w="1px" bg="rgba(255,255,255,0.06)" />
            </Flex>

            {/* Option B — Memcached */}
            <Box bg="rgba(96,165,250,0.05)" border="1px solid rgba(96,165,250,0.2)" borderRadius="xl" p={5}>
              <HStack mb={3} spacing={2}>
                <Box w="8px" h="8px" borderRadius="full" bg="#60A5FA" flexShrink={0} />
                <Text fontSize="10px" fontWeight="800" color="#60A5FA" textTransform="uppercase" letterSpacing="0.1em">Option B</Text>
              </HStack>
              <Text fontSize="lg" fontWeight="800" color="white" letterSpacing="-0.03em" mb={0.5}>Memcached</Text>
              <Text fontSize="11px" color="rgba(255,255,255,0.35)" mb={4}>Bob Martinez · Infrastructure · 18d ago</Text>

              <VStack align="stretch" spacing={2.5} mb={4}>
                {[
                  { pro: true,  text: 'Existing INFRA-023 standard — zero policy change' },
                  { pro: true,  text: 'Full SLAs, monitoring, and runbooks in place' },
                  { pro: true,  text: 'No migration cost or operational disruption' },
                  { pro: false, text: 'Forfeits 43% latency gain under burst load' },
                  { pro: false, text: 'Blocks pub/sub real-time feature roadmap' },
                ].map((item, i) => (
                  <HStack key={i} align="flex-start" spacing={2}>
                    <Box
                      w="15px" h="15px" borderRadius="full" flexShrink={0} mt="1px"
                      bg={item.pro ? 'rgba(96,165,250,0.12)' : 'rgba(248,113,113,0.1)'}
                      display="flex" alignItems="center" justifyContent="center"
                    >
                      <Icon as={item.pro ? FiCheck : FiAlertTriangle} color={item.pro ? '#60A5FA' : '#F87171'} boxSize={2.5} />
                    </Box>
                    <Text fontSize="11px" color={item.pro ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)'} lineHeight="1.5">
                      {item.text}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Box
                as="button"
                w="full" py={2.5} borderRadius="lg"
                bg="rgba(96,165,250,0.12)" border="1px solid rgba(96,165,250,0.35)"
                color="#60A5FA" fontSize="13px" fontWeight="700"
                cursor="pointer"
                _hover={{ bg: 'rgba(96,165,250,0.22)', borderColor: '#60A5FA', boxShadow: '0 0 16px rgba(96,165,250,0.2)' }}
                transition="all 0.15s"
                display="flex" alignItems="center" justifyContent="center" gap={2}
                onClick={() => onDecide('memcached')}
              >
                <Icon as={FiCheck} boxSize={3.5} />
                Retain Memcached
              </Box>
            </Box>
          </Grid>

          <Text fontSize="10px" color="rgba(255,255,255,0.2)" textAlign="center" letterSpacing="0.04em">
            Decision will be logged, timestamped, and propagated to Backend Platform, Infrastructure, and QA teams.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function ConflictsPage() {
  const [filter, setFilter]               = useState('all');
  const [selected, setSelected]           = useState<typeof mockConflicts[0] | null>(null);
  const [cacheDecision, setCacheDecision] = useState<'redis' | 'memcached' | null>(null);
  const { isOpen, onOpen, onClose }       = useDisclosure();
  const { isOpen: isActionOpen, onOpen: onActionOpen, onClose: onActionClose } = useDisclosure();
  const { isOpen: isDecideOpen, onOpen: onDecideOpen, onClose: onDecideClose } = useDisclosure();

  function handleCacheDecide(choice: 'redis' | 'memcached') {
    setCacheDecision(choice);
    onDecideClose();
  }

  const filtered = filter === 'all' ? mockConflicts : mockConflicts.filter(c => c.status === filter);

  const stats = {
    total:    mockConflicts.length,
    open:     mockConflicts.filter(c => c.status === 'open').length,
    reviewing:mockConflicts.filter(c => c.status === 'reviewing').length,
    resolved: mockConflicts.filter(c => c.status === 'resolved').length,
    critical: mockConflicts.filter(c => c.severity === 'critical').length,
    shadow:   shadowDecisions.length,
  };

  function openDetail(c: typeof mockConflicts[0]) { setSelected(c); onOpen(); }
  function openAction(c: typeof mockConflicts[0]) { setSelected(c); onActionOpen(); }

  return (
    <AppLayout>
      <Box p={6}>

        {/* Header */}
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" mb={1} color="text.primary">Conflicts Dashboard</Heading>
            <Text color="text.muted" fontSize="sm">
              Nexus Technologies · Detected contradictions, policy violations, and shadow decisions
            </Text>
          </Box>
          <HStack>
            <Icon as={FiFilter} color="text.muted" />
            <Select value={filter} onChange={e => setFilter(e.target.value)} w="160px" size="sm" bg="background.raised">
              <option value="all">All conflicts</option>
              <option value="open">Open</option>
              <option value="reviewing">Reviewing</option>
              <option value="resolved">Resolved</option>
            </Select>
          </HStack>
        </Flex>

        {/* Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          {[
            { label: 'Total',          value: stats.total,     color: 'blue',   pct: 100 },
            { label: 'Open',           value: stats.open,      color: 'red',    pct: (stats.open / stats.total) * 100 },
            { label: 'Reviewing',      value: stats.reviewing, color: 'orange', pct: (stats.reviewing / stats.total) * 100 },
            { label: 'Resolved',       value: stats.resolved,  color: 'green',  pct: (stats.resolved / stats.total) * 100 },
          ].map(s => (
            <Stat key={s.label} bg="#1A202C" p={4} borderRadius="lg" borderWidth="1px" borderColor="#2D3748">
              <StatLabel color="#E2E8F0" fontSize="sm">{s.label}</StatLabel>
              <StatNumber color="#F7FAFC" fontSize="2xl">{s.value}</StatNumber>
              <Progress value={s.pct} colorScheme={s.color} size="sm" mt={3} borderRadius="full" bg="#2D3748" />
            </Stat>
          ))}
        </SimpleGrid>

        {/* Critical alert */}
        {stats.critical > 0 && (
          <Box bg="#2D3748" p={4} mb={6} borderRadius="lg" borderLeft="4px solid #F56565">
            <HStack>
              <Icon as={FiAlertTriangle} color="red.400" boxSize={5} />
              <Box>
                <Text fontWeight="bold" color="#F7FAFC">
                  {stats.critical} Critical Conflict · {stats.shadow} Unescalated Decisions Detected
                </Text>
                <Text color="#E2E8F0" fontSize="sm">
                  OAuth 2.0 violation is live in production. Jack is silently fixing it without escalation.
                  Grace has not been informed.
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

        {/* Conflict Cards */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
          {filtered.map(conflict => (
            <Card
              key={conflict.id}
              bg="#1A202C"
              borderWidth="1px"
              borderColor={
                conflict.id === 'conflict-002' && !cacheDecision ? 'rgba(251,191,36,0.5)'
                : conflict.severity === 'critical' ? 'red.600'
                : conflict.shadowCount > 0 ? 'orange.600'
                : '#2D3748'
              }
              borderRadius="lg"
              variant="outline"
              overflow="hidden"
              position="relative"
            >
              {conflict.id === 'conflict-002' && !cacheDecision && (
                <Box h="2px" bgGradient="linear(to-r, #34D399, #FBBF24, #60A5FA)" />
              )}
              <CardBody>
                <Flex justify="space-between" mb={3} align="flex-start">
                  <HStack align="flex-start" flex="1" mr={2}>
                    <Icon as={FiAlertTriangle} color={`${severityColor[conflict.severity]}.400`} boxSize={5} mt="1px" flexShrink={0} />
                    <Text fontWeight="700" color="#F7FAFC" fontSize="sm" lineHeight="1.4">{conflict.title}</Text>
                  </HStack>
                  <VStack spacing={1} align="flex-end" flexShrink={0}>
                    <Badge colorScheme={conflict.id === 'conflict-002' && cacheDecision ? 'green' : statusColor[conflict.status]}>
                      {conflict.id === 'conflict-002' && cacheDecision ? 'Resolved' : cap(conflict.status)}
                    </Badge>
                    {conflict.shadowCount > 0 && (
                      <Badge colorScheme="orange" fontSize="9px">{conflict.shadowCount} unescalated</Badge>
                    )}
                  </VStack>
                </Flex>

                <Text color="#A0AEC0" fontSize="sm" mb={3} noOfLines={3}>{conflict.description}</Text>

                <HStack spacing={2} mb={3} flexWrap="wrap">
                  <Badge colorScheme={severityColor[conflict.severity]}>{cap(conflict.severity)}</Badge>
                  {conflict.affectedTeams.map(t => (
                    <Tag key={t} size="sm" colorScheme="gray"><TagLabel>{t}</TagLabel></Tag>
                  ))}
                </HStack>

                <HStack spacing={1} mb={3} flexWrap="wrap">
                  {conflict.linkedTickets.slice(0, 4).map(t => (
                    <Tag key={t} size="sm" colorScheme="blue" fontFamily="mono" fontSize="9px">{t}</Tag>
                  ))}
                  {conflict.linkedPRs.slice(0, 3).map(p => (
                    <Tag key={p} size="sm" colorScheme="purple" fontFamily="mono" fontSize="9px">
                      <Icon as={FiGitPullRequest} mr={1} /> #{p}
                    </Tag>
                  ))}
                </HStack>

                {/* ── CTO Decision CTA ── */}
                {conflict.id === 'conflict-002' && !cacheDecision && (
                  <Box
                    bg="rgba(251,191,36,0.07)" border="1px solid rgba(251,191,36,0.2)"
                    borderRadius="lg" p={3} mb={3}
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={2}>
                        <Icon as={FiZap} color="#FBBF24" boxSize={3.5} />
                        <Box>
                          <Text fontSize="xs" fontWeight="700" color="#FBBF24">CTO Decision Required</Text>
                          <Text fontSize="10px" color="rgba(251,191,36,0.55)" mt={0.5}>
                            Redis (43% faster) vs Memcached (existing standard) — make the call
                          </Text>
                        </Box>
                      </HStack>
                      <Box
                        as="button"
                        px={3} py={1.5} borderRadius="md"
                        bg="rgba(251,191,36,0.15)" border="1px solid rgba(251,191,36,0.4)"
                        color="#FBBF24" fontSize="12px" fontWeight="700"
                        cursor="pointer"
                        _hover={{ bg: 'rgba(251,191,36,0.25)', borderColor: '#FBBF24' }}
                        transition="all 0.15s"
                        onClick={onDecideOpen}
                        display="flex" alignItems="center" gap={1.5}
                      >
                        <Icon as={FiZap} boxSize={3} />
                        Decide Now
                      </Box>
                    </Flex>
                  </Box>
                )}

                {/* ── Post-decision confirmation ── */}
                {conflict.id === 'conflict-002' && cacheDecision && (
                  <Box
                    bg="rgba(52,211,153,0.07)" border="1px solid rgba(52,211,153,0.2)"
                    borderRadius="lg" p={3} mb={3}
                  >
                    <HStack spacing={2}>
                      <Icon as={FiCheck} color="#34D399" boxSize={3.5} />
                      <Text fontSize="xs" fontWeight="700" color="#34D399">
                        Decision logged:{' '}
                        <Text as="span" color="white" fontWeight="500">
                          {cacheDecision === 'redis'
                            ? 'Redis approved as company caching standard'
                            : 'Memcached retained as company caching standard'}
                        </Text>
                      </Text>
                    </HStack>
                  </Box>
                )}

                <Flex justify="space-between" align="center">
                  <HStack>
                    <AvatarGroup size="xs" max={3}>
                      {conflict.persons.map(id => {
                        const m = getMemberById(id);
                        return m ? <Avatar key={id} name={m.name} /> : null;
                      })}
                    </AvatarGroup>
                    <Text fontSize="xs" color="text.muted">
                      via {conflict.detectedVia}
                    </Text>
                  </HStack>
                  <Button size="sm" variant="outline" colorScheme="blue" onClick={() => openDetail(conflict)}>
                    View Details
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Unescalated Decisions Section */}
        <Heading size="sm" mt={10} mb={1} color="text.primary">
          Decisions Without Leadership Visibility
        </Heading>
        <Text fontSize="sm" color="text.muted" mb={4}>
          Actions taken across JIRA and Git that bypassed the CTO escalation path — surfaced by AI Chief of Staff.
        </Text>
        <VStack spacing={3} align="stretch">
          {shadowDecisions.map(sd => {
            const by = getMemberById(sd.madeById);
            return (
              <Box key={sd.id} bg="rgba(251,191,36,0.08)" border="1px solid" borderColor="rgba(251,191,36,0.25)" borderRadius="lg" p={4}>
                <Flex justify="space-between" align="flex-start">
                  <Box flex="1" mr={4}>
                    <HStack mb={1}>
                      <Badge colorScheme={severityColor[sd.severity]}>{cap(sd.severity)}</Badge>
                      <Badge colorScheme="blue" fontSize="9px" textTransform="uppercase">Not Escalated</Badge>
                      <Badge colorScheme={sd.escalatedToCTO ? 'green' : 'red'} fontSize="9px">
                        {sd.escalatedToCTO ? 'CTO Informed' : 'CTO Not Informed'}
                      </Badge>
                    </HStack>
                    <Text fontWeight="700" color="#FBBF24" fontSize="sm" mb={1}>{sd.title}</Text>
                    <Text fontSize="xs" color="#FBBF24" opacity={0.85} mb={2}>{sd.description}</Text>
                    <HStack fontSize="xs" color="#60A5FA" spacing={3}>
                      {by && (
                        <HStack>
                          <Avatar size="xs" name={by.name} />
                          <Text>{by.name} ({by.role})</Text>
                        </HStack>
                      )}
                      <Text>Detected via: {sd.detectedVia}</Text>
                      <Text>{sd.detectedDaysAgo === 0 ? 'Today' : `${sd.detectedDaysAgo}d ago`}</Text>
                    </HStack>
                  </Box>
                  <Flex gap={2} flexWrap="wrap" maxW="200px">
                    {sd.linkedTickets.map(t => (
                      <Tag key={t} size="sm" colorScheme="orange" fontFamily="mono" fontSize="9px">{t}</Tag>
                    ))}
                    {sd.linkedPRs.map(p => (
                      <Tag key={p} size="sm" colorScheme="purple" fontFamily="mono" fontSize="9px">PR #{p}</Tag>
                    ))}
                  </Flex>
                </Flex>
              </Box>
            );
          })}
        </VStack>

      </Box>

      {/* Detail Modal */}
      {selected && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent bg="background.surface">
            <ModalHeader>
              <HStack>
                <Icon as={FiAlertTriangle} color={`${severityColor[selected.severity]}.500`} />
                <Badge colorScheme={severityColor[selected.severity]}>{cap(selected.severity)}</Badge>
                <Badge colorScheme={statusColor[selected.status]}>{cap(selected.status)}</Badge>
              </HStack>
              <Text mt={1} fontSize="lg" fontWeight="700">{selected.title}</Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                  <Tab>Overview</Tab>
                  <Tab>Entities</Tab>
                  {selected.status === 'resolved' && <Tab>Resolution</Tab>}
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <Text color="text.secondary" lineHeight="1.7">{selected.description}</Text>
                      <SimpleGrid columns={2} gap={4}>
                        <Box>
                          <Text fontSize="xs" color="text.muted" mb={1}>AFFECTED TEAMS</Text>
                          <Flex gap={1} flexWrap="wrap">
                            {selected.affectedTeams.map(t => (
                              <Tag key={t} size="sm" colorScheme="purple">{t}</Tag>
                            ))}
                          </Flex>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="text.muted" mb={1}>DETECTED VIA</Text>
                          <Text fontSize="sm" color="text.secondary">{selected.detectedVia}</Text>
                        </Box>
                      </SimpleGrid>
                      <Box>
                        <Text fontSize="xs" color="text.muted" mb={2}>LINKED JIRA TICKETS</Text>
                        <Flex gap={2} flexWrap="wrap">
                          {selected.linkedTickets.map(t => (
                            <Tag key={t} colorScheme="blue" fontFamily="mono">{t}</Tag>
                          ))}
                        </Flex>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="text.muted" mb={2}>LINKED PULL REQUESTS</Text>
                        <Flex gap={2} flexWrap="wrap">
                          {selected.linkedPRs.map(p => (
                            <HStack key={p} as={Tag} colorScheme="purple">
                              <Icon as={FiGitPullRequest} />
                              <Text fontFamily="mono">#{p}</Text>
                            </HStack>
                          ))}
                        </Flex>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="text.muted" mb={2}>PEOPLE INVOLVED</Text>
                        <HStack>
                          {selected.persons.map(id => {
                            const m = getMemberById(id);
                            return m ? (
                              <Tooltip key={id} label={`${m.name} — ${m.role}`}>
                                <Avatar size="sm" name={m.name} />
                              </Tooltip>
                            ) : null;
                          })}
                        </HStack>
                      </Box>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack align="stretch" spacing={3}>
                      {selected.entities.map((e, i) => (
                        <Card key={i} variant="outline">
                          <CardBody py={3}>
                            <Flex align="center" justify="space-between">
                              <HStack>
                                <Badge colorScheme={e.type === 'Decision' ? 'green' : e.type === 'PR' ? 'purple' : 'orange'}>
                                  {e.type}
                                </Badge>
                                <Text fontWeight="600" fontSize="sm">{e.name}</Text>
                              </HStack>
                              <Icon as={FiExternalLink} color="text.muted" boxSize={4} />
                            </Flex>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </TabPanel>

                  {selected.status === 'resolved' && selected.resolution && (
                    <TabPanel>
                      <Box p={4} bg="rgba(52,211,153,0.08)" borderRadius="md" mb={4}>
                        <HStack mb={2}>
                          <Icon as={FiCheck} color="#34D399" boxSize={5} />
                          <Text fontWeight="700" color="#34D399">Resolved</Text>
                        </HStack>
                        <Text fontSize="sm" color="#34D399" opacity={0.85} lineHeight="1.7">{selected.resolution}</Text>
                      </Box>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>Close</Button>
              {selected.status !== 'resolved' && (
                <Button colorScheme="blue" onClick={() => { onClose(); openAction(selected); }}>
                  Take Action
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Action Modal */}
      {selected && (
        <Modal isOpen={isActionOpen} onClose={onActionClose} size="lg">
          <ModalOverlay />
          <ModalContent bg="background.surface">
            <ModalHeader>
              <HStack>
                <Icon as={FiAlertTriangle} color="semantic.decision" />
                <Text>Take Action: {selected.title}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Alert status="info" borderRadius="md" mb={4}>
                <AlertIcon />
                <Text fontSize="sm">Select an action. This will create tasks, schedule meetings, or escalate.</Text>
              </Alert>
              <VStack spacing={3} align="stretch">
                {getSuggestedActions(selected).map(action => (
                  <Card key={action.id} variant="outline" cursor="pointer"
                    _hover={{ bg: 'background.raised', borderColor: 'border.default' }}>
                    <CardBody py={3}>
                      <HStack align="flex-start">
                        <Icon as={action.icon} color={`${action.color}.500`} boxSize={5} mt="2px" flexShrink={0} />
                        <Box>
                          <Text fontWeight="700" fontSize="sm">{action.title}</Text>
                          <Text fontSize="xs" color="text.muted">{action.description}</Text>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={onActionClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
      <CacheDecisionModal
        isOpen={isDecideOpen}
        onClose={onDecideClose}
        onDecide={handleCacheDecide}
      />
    </AppLayout>
  );
}
