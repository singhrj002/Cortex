'use client';

import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, Badge, HStack, VStack,
  SimpleGrid, Icon, Progress, Divider, Avatar,
} from '@chakra-ui/react';
import {
  FiTrendingDown, FiTrendingUp, FiMinus, FiAlertTriangle,
  FiActivity, FiMessageSquare, FiLink, FiZap, FiClock,
  FiCheckSquare, FiGitPullRequest, FiHeart, FiUsers, FiShield,
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────
interface EmployeePulse {
  id: string;
  name: string;
  role: string;
  team: string;
  teamColor: string;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'at-risk' | 'overloaded' | 'disengaged';
  velocityScore: number;
  ticketsResolved: number;
  avgCloseTimeDays: number;
  prReviews: number;
  communicationScore: number;
  hoursThisWeek: number;
  blockedTickets: number;
  sparkline: number[];
  insight: string;
}

// ─────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────
const BASE_ORG_SCORE = 68;

const PILLARS = [
  {
    label: 'Conflict Rate', value: 'HIGH', score: 28,
    trend: 'down' as const, trendText: '↑ 23% this week', color: '#FC8181',
    icon: FiAlertTriangle,
    detail: '7 active conflicts — Security ↔ Frontend, Backend ↔ Infra',
  },
  {
    label: 'Decision Velocity', value: 'SLOW', score: 42,
    trend: 'down' as const, trendText: 'avg 8 days to close', color: '#F6AD55',
    icon: FiZap,
    detail: '3 decisions pending >14 days; 2 blocked on cross-team approval',
  },
  {
    label: 'Communication', value: 'GOOD', score: 74,
    trend: 'stable' as const, trendText: 'steady for 2 weeks', color: '#68D391',
    icon: FiMessageSquare,
    detail: 'Teams responding within 4 h; DevOps slightly delayed',
  },
  {
    label: 'Knowledge Density', value: 'LOW', score: 35,
    trend: 'down' as const, trendText: 'silos forming in DevOps', color: '#F6AD55',
    icon: FiLink,
    detail: '40% of Infra decisions undocumented; Redis/Memcached conflict unresolved',
  },
  {
    label: 'Execution Cadence', value: 'MODERATE', score: 61,
    trend: 'up' as const, trendText: '↑ 8% from last sprint', color: '#63B3ED',
    icon: FiActivity,
    detail: 'Frontend on track; Backend blocked by pending Infra decisions',
  },
];

const TENSIONS = [
  { teamA: 'Security', teamB: 'Frontend', level: 'critical' as const, reason: '3 production endpoints violating OAuth 2.0 mandate (SEC-STD-012)' },
  { teamA: 'Backend', teamB: 'Infrastructure', level: 'high' as const, reason: 'Redis vs Memcached — conflicting active standards CORE-078 vs INFRA-023' },
  { teamA: 'Frontend', teamB: 'Leadership', level: 'medium' as const, reason: 'Jack Williams has not escalated SEC-007 to CTO Grace Liu' },
  { teamA: 'Infrastructure', teamB: 'QA', level: 'medium' as const, reason: 'Cache benchmark (QA-034) contradicts INFRA-STD-001 Memcached policy' },
  { teamA: 'Backend', teamB: 'QA', level: 'low' as const, reason: 'Redis staging merge (CORE-082) without formal QA sign-off' },
  { teamA: 'Security', teamB: 'Leadership', level: 'low' as const, reason: 'SEC-007 open 14 days without CTO awareness or escalation' },
];

const TENSION_CFG = {
  critical: { bg: 'rgba(127,29,29,0.6)', border: '#FC8181', text: '#FCA5A5', label: 'CRITICAL' },
  high:     { bg: 'rgba(124,45,18,0.6)', border: '#F97316', text: '#FDBA74', label: 'HIGH' },
  medium:   { bg: 'rgba(120,53,15,0.5)', border: '#F59E0B', text: '#FCD34D', label: 'MEDIUM' },
  low:      { bg: 'rgba(30,58,95,0.5)',  border: '#60A5FA', text: '#93C5FD', label: 'LOW' },
};

const EMPLOYEES: EmployeePulse[] = [
  {
    id: 'u-008', name: 'Jack Williams', role: 'Frontend Lead', team: 'Frontend', teamColor: '#48BB78',
    overallScore: 41, trend: 'down', status: 'at-risk',
    velocityScore: 55, ticketsResolved: 4, avgCloseTimeDays: 11, prReviews: 2,
    communicationScore: 38, hoursThisWeek: 52, blockedTickets: 2,
    sparkline: [72, 68, 65, 60, 55, 48, 41],
    insight: 'Shadow work detected — opened WEB-051 draft fix without informing Security Lead or escalating to CTO.',
  },
  {
    id: 'u-013', name: 'Carlos Rodriguez', role: 'Senior DevOps Eng', team: 'Infrastructure', teamColor: '#F6AD55',
    overallScore: 58, trend: 'down', status: 'overloaded',
    velocityScore: 50, ticketsResolved: 3, avgCloseTimeDays: 12, prReviews: 2,
    communicationScore: 46, hoursThisWeek: 56, blockedTickets: 3,
    sparkline: [70, 68, 65, 63, 61, 59, 58],
    insight: 'Carrying INFRA-024 + INFRA-025, both blocked by policy deadlock. 56h week — burnout risk rising.',
  },
  {
    id: 'u-012', name: 'Bob Martinez', role: 'DevOps Lead', team: 'Infrastructure', teamColor: '#F6AD55',
    overallScore: 54, trend: 'down', status: 'at-risk',
    velocityScore: 48, ticketsResolved: 3, avgCloseTimeDays: 14, prReviews: 3,
    communicationScore: 51, hoursThisWeek: 47, blockedTickets: 3,
    sparkline: [65, 62, 60, 58, 56, 55, 54],
    insight: 'Memcached recommendation conflicts with Backend Redis proposal. 3 INFRA tickets blocked for 14+ days.',
  },
  {
    id: 'u-015', name: 'Irene Garcia', role: 'Security Lead', team: 'Security', teamColor: '#FC8181',
    overallScore: 62, trend: 'stable', status: 'at-risk',
    velocityScore: 70, ticketsResolved: 5, avgCloseTimeDays: 6, prReviews: 4,
    communicationScore: 58, hoursThisWeek: 44, blockedTickets: 1,
    sparkline: [63, 64, 62, 63, 61, 62, 62],
    insight: 'Actively investigating SEC-007 but blocked by Frontend non-cooperation. Escalation chain not flowing.',
  },
  {
    id: 'u-002', name: 'Michael Park', role: 'VP Engineering', team: 'Leadership', teamColor: '#9F7AEA',
    overallScore: 69, trend: 'down', status: 'healthy',
    velocityScore: 65, ticketsResolved: 2, avgCloseTimeDays: 3, prReviews: 8,
    communicationScore: 74, hoursThisWeek: 50, blockedTickets: 0,
    sparkline: [78, 76, 74, 72, 71, 70, 69],
    insight: '3 cross-team conflicts awaiting VP intervention for 7+ days. Review cadence strong; escalation slow.',
  },
  {
    id: 'u-004', name: 'Alice Chen', role: 'Backend Lead', team: 'Backend Platform', teamColor: '#4299E1',
    overallScore: 73, trend: 'stable', status: 'healthy',
    velocityScore: 78, ticketsResolved: 7, avgCloseTimeDays: 5, prReviews: 6,
    communicationScore: 80, hoursThisWeek: 41, blockedTickets: 1,
    sparkline: [70, 71, 72, 73, 72, 73, 73],
    insight: 'Redis proposal (CORE-078) well executed. Blocked on Infra approval — not own output. Clear communicator.',
  },
  {
    id: 'u-005', name: 'David Kim', role: 'Senior Backend Eng', team: 'Backend Platform', teamColor: '#4299E1',
    overallScore: 77, trend: 'up', status: 'healthy',
    velocityScore: 82, ticketsResolved: 8, avgCloseTimeDays: 4, prReviews: 5,
    communicationScore: 76, hoursThisWeek: 40, blockedTickets: 0,
    sparkline: [71, 72, 74, 75, 76, 77, 77],
    insight: 'Strong sprint. Redis migration scripts (PR #292) progressing well. External blockers only.',
  },
  {
    id: 'u-009', name: 'Sarah Chen', role: 'Senior Frontend Eng', team: 'Frontend', teamColor: '#48BB78',
    overallScore: 82, trend: 'up', status: 'healthy',
    velocityScore: 88, ticketsResolved: 9, avgCloseTimeDays: 3, prReviews: 7,
    communicationScore: 85, hoursThisWeek: 38, blockedTickets: 0,
    sparkline: [74, 75, 77, 79, 80, 81, 82],
    insight: 'Sprint MVP this cycle. Fastest ticket closure in Frontend. Excellent cross-team communication.',
  },
  {
    id: 'u-017', name: 'Leo Zhang', role: 'QA Lead', team: 'QA', teamColor: '#F6E05E',
    overallScore: 79, trend: 'stable', status: 'healthy',
    velocityScore: 75, ticketsResolved: 6, avgCloseTimeDays: 4, prReviews: 9,
    communicationScore: 82, hoursThisWeek: 39, blockedTickets: 0,
    sparkline: [78, 79, 79, 78, 79, 79, 79],
    insight: 'QA-034 benchmark + QA-037 auth regression both delivered on time. High PR review participation.',
  },
  {
    id: 'u-016', name: 'Marcus Thompson', role: 'Security Engineer', team: 'Security', teamColor: '#FC8181',
    overallScore: 71, trend: 'up', status: 'healthy',
    velocityScore: 73, ticketsResolved: 5, avgCloseTimeDays: 5, prReviews: 4,
    communicationScore: 68, hoursThisWeek: 42, blockedTickets: 1,
    sparkline: [65, 66, 68, 69, 70, 71, 71],
    insight: 'SEC-002 audit found all 3 Basic Auth violations independently. Strong technical output.',
  },
  {
    id: 'u-018', name: 'Emma Wilson', role: 'QA Engineer', team: 'QA', teamColor: '#F6E05E',
    overallScore: 76, trend: 'up', status: 'healthy',
    velocityScore: 74, ticketsResolved: 7, avgCloseTimeDays: 3, prReviews: 5,
    communicationScore: 77, hoursThisWeek: 37, blockedTickets: 0,
    sparkline: [70, 71, 72, 73, 74, 75, 76],
    insight: 'Effective auth regression (QA-037). Fast turnaround. Good Security team collaboration.',
  },
  {
    id: 'u-001', name: 'Grace Liu', role: 'CTO', team: 'Leadership', teamColor: '#9F7AEA',
    overallScore: 85, trend: 'stable', status: 'healthy',
    velocityScore: 80, ticketsResolved: 0, avgCloseTimeDays: 1, prReviews: 12,
    communicationScore: 90, hoursThisWeek: 45, blockedTickets: 0,
    sparkline: [84, 85, 85, 86, 85, 85, 85],
    insight: 'Key gap: unaware of WEB-051 draft fix and full scope of the Basic Auth violation.',
  },
];

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  // Stroke width proportional to size so small rings look clean
  const sw = size > 80 ? 10 : Math.max(4, Math.round(size * 0.09));
  const r = (size / 2) - sw - 1;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#68D391' : score >= 50 ? '#F6AD55' : '#FC8181';
  return (
    <Box position="relative" w={`${size}px`} h={`${size}px`} flexShrink={0}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#27272A" strokeWidth={sw} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <Flex position="absolute" inset="0" align="center" justify="center" direction="column" gap={0}>
        <Text fontSize={size > 80 ? '34px' : '13px'} fontWeight="900" color={color} lineHeight="1">{score}</Text>
        <Text fontSize={size > 80 ? '11px' : '9px'} color="text.disabled">/100</Text>
      </Flex>
    </Box>
  );
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const W = 56, H = 22;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`
  ).join(' ');
  return (
    <svg width={W} height={H}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
    </svg>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up')   return <Icon as={FiTrendingUp}   color="green.400" boxSize={3.5} />;
  if (trend === 'down') return <Icon as={FiTrendingDown} color="red.400"   boxSize={3.5} />;
  return                       <Icon as={FiMinus}        color="text.disabled"  boxSize={3.5} />;
}

const STATUS_CFG = {
  healthy:    { bg: '#052e16', border: '#166534', text: '#86efac', label: '● Healthy' },
  'at-risk':  { bg: '#431407', border: '#9a3412', text: '#fb923c', label: '⚠ At Risk' },
  overloaded: { bg: '#450a0a', border: '#991b1b', text: '#fca5a5', label: '🔥 Overloaded' },
  disengaged: { bg: '#1c1917', border: '#44403c', text: '#a8a29e', label: '◌ Disengaged' },
} as const;

function StatRow({ label, value, max, color, suffix = '' }: { label: string; value: number; max: number; color: string; suffix?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <Box>
      <Flex justify="space-between" mb="3px">
        <Text fontSize="10px" color="text.muted" fontWeight="500">{label}</Text>
        <Text fontSize="10px" fontWeight="700" color="text.secondary">{value}{suffix}</Text>
      </Flex>
      <Box h="3px" bg="background.raised" borderRadius="full">
        <Box h="3px" w={`${pct}%`} bg={color} borderRadius="full" />
      </Box>
    </Box>
  );
}

function EmployeeCard({ e }: { e: EmployeePulse }) {
  const sc = STATUS_CFG[e.status];
  const scoreColor = e.overallScore >= 75 ? '#68D391' : e.overallScore >= 55 ? '#F6AD55' : '#FC8181';
  return (
    <Box bg="background.surface" border="1px solid" borderColor="border.subtle" borderRadius="xl"
      boxShadow="sm"
      _hover={{ bg: 'background.raised', borderColor: 'border.default' }} transition="all 0.15s">

      {/* Accent bar — radius only on top so no overflow:hidden needed on parent */}
      <Box h="3px" bg={e.teamColor} borderTopLeftRadius="xl" borderTopRightRadius="xl" />

      <Box p={4}>
        {/* Header row */}
        <Flex align="flex-start" gap={3} mb={3}>
          <Avatar name={e.name} size="sm" bg={e.teamColor} color="gray.900" fontWeight="800" flexShrink={0} />
          <Box flex={1} minW={0}>
            <Flex align="center" gap={1.5} mb={0.5}>
              <Text fontSize="sm" fontWeight="700" color="text.primary" noOfLines={1}>{e.name}</Text>
              <TrendIcon trend={e.trend} />
            </Flex>
            <Text fontSize="11px" color="text.muted" noOfLines={1}>{e.role}</Text>
            <Box
              display="inline-block" mt={1} px={2} py={0.5} borderRadius="full"
              bg={sc.bg} border="1px solid" borderColor={sc.border}
            >
              <Text fontSize="10px" fontWeight="700" color={sc.text}>{sc.label}</Text>
            </Box>
          </Box>
          <VStack spacing={1} align="center" flexShrink={0}>
            <ScoreRing score={e.overallScore} size={64} />
            <Spark data={e.sparkline} color={scoreColor} />
          </VStack>
        </Flex>

        <Divider mb={3} borderColor="border.subtle" />

        {/* Metric bars */}
        <VStack spacing={2.5} align="stretch" mb={3}>
          <StatRow label="⚡ Sprint Velocity"    value={e.velocityScore}     max={100} color="#63B3ED" suffix="/100" />
          <StatRow label="✅ Tickets Resolved"   value={e.ticketsResolved}   max={15}  color="#68D391" />
          <StatRow label="💬 Communication"      value={e.communicationScore} max={100} color="#B794F4" suffix="/100" />
          <StatRow label="🔀 PR Reviews"         value={e.prReviews}         max={15}  color="#9AE6B4" />
        </VStack>

        {/* Inline stats */}
        <SimpleGrid columns={3} gap={2} mb={3}>
          {[
            { icon: FiClock,       val: `${e.avgCloseTimeDays}d`,  label: 'Avg Close',  warn: e.avgCloseTimeDays > 7 },
            { icon: FiUsers,       val: `${e.hoursThisWeek}h`,     label: 'This Week',  warn: e.hoursThisWeek > 50 },
            { icon: FiAlertTriangle, val: `${e.blockedTickets}`,   label: 'Blocked',    warn: e.blockedTickets > 0 },
          ].map(s => (
            <Box key={s.label} textAlign="center" bg="background.raised" borderRadius="lg" p={2}>
              <Icon as={s.icon} color={s.warn ? 'orange.400' : 'text.disabled'} boxSize={3} mb={0.5} />
              <Text fontSize="13px" fontWeight="800" color={s.warn ? 'orange.400' : 'text.secondary'}>{s.val}</Text>
              <Text fontSize="9px" color="text.disabled" textTransform="uppercase">{s.label}</Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Insight */}
        <Box bg="background.raised" borderRadius="lg" p={2.5} borderLeft="3px solid" borderColor={e.teamColor}>
          <Text fontSize="10px" color="text.secondary" lineHeight="1.5">
            <Text as="span" fontWeight="700" color="text.primary">Insight: </Text>
            {e.insight}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────
export default function HealthPage() {
  const [orgScore, setOrgScore] = useState(BASE_ORG_SCORE);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [filter, setFilter] = useState<'all' | 'at-risk' | 'overloaded' | 'healthy'>('all');

  useEffect(() => {
    const scoreInterval = setInterval(() => {
      setOrgScore(prev => Math.max(62, Math.min(76, prev + Math.floor(Math.random() * 5) - 2)));
      setSecondsAgo(0);
    }, 9000);
    const tickInterval = setInterval(() => setSecondsAgo(s => s + 1), 1000);
    return () => { clearInterval(scoreInterval); clearInterval(tickInterval); };
  }, []);

  const filteredEmployees = EMPLOYEES.filter(e =>
    filter === 'all' ? true : e.status === filter
  );

  const counts = {
    all: EMPLOYEES.length,
    'at-risk': EMPLOYEES.filter(e => e.status === 'at-risk').length,
    overloaded: EMPLOYEES.filter(e => e.status === 'overloaded').length,
    healthy: EMPLOYEES.filter(e => e.status === 'healthy').length,
  };

  const avgScore = Math.round(EMPLOYEES.reduce((s, e) => s + e.overallScore, 0) / EMPLOYEES.length);

  return (
    <AppLayout>
      <Box pb={10}>

        {/* ── Header ─────────────────────────────────────────── */}
        <Flex justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={3}>
          <Box>
            <HStack spacing={2} mb={1}>
              <Icon as={FiHeart} color="red.400" boxSize={5} />
              <Heading size="lg" fontWeight="800" color="text.primary">Organisation Health</Heading>
              {/* LIVE indicator */}
              <HStack spacing={1.5} px={2} py={0.5} borderRadius="full"
                bg="rgba(52,211,153,0.08)" border="1px solid" borderColor="rgba(52,211,153,0.25)">
                <Box w={1.5} h={1.5} borderRadius="full" bg="green.400"
                  sx={{ animation: 'pulse 2s infinite',
                    '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
                <Text fontSize="10px" color="#34D399" fontWeight="700">LIVE</Text>
              </HStack>
            </HStack>
            <Text color="text.muted" fontSize="sm">
              Nexus Technologies · Q1 2026 · Updated {secondsAgo === 0 ? 'just now' : `${secondsAgo}s ago`}
            </Text>
          </Box>
          <HStack spacing={2}>
            <Badge colorScheme="red" borderRadius="full" px={3} py={1} fontSize="xs">
              <HStack spacing={1.5}><Icon as={FiAlertTriangle} boxSize={3} /><Text>7 conflicts active</Text></HStack>
            </Badge>
            <Badge colorScheme="orange" borderRadius="full" px={3} py={1} fontSize="xs">
              <HStack spacing={1.5}><Icon as={FiAlertTriangle} boxSize={3} /><Text>4 not escalated</Text></HStack>
            </Badge>
          </HStack>
        </Flex>

        {/* ── Org Score Banner ────────────────────────────────── */}
        <Box bg="gray.900" borderRadius="2xl" p={6} mb={5}
          bgGradient="linear(to-r, gray.900, #1a1a3e)"
          border="1px solid" borderColor="whiteAlpha.100"
          boxShadow="0 4px 24px rgba(0,0,0,0.25)">
          <Flex gap={8} align="center" flexWrap="wrap">

            {/* Score ring */}
            <VStack spacing={2} flexShrink={0}>
              <ScoreRing score={orgScore} size={160} />
              <HStack spacing={1.5}>
                <Icon as={FiTrendingDown} color="red.400" boxSize={4} />
                <Text fontSize="12px" color="red.400" fontWeight="700">TRENDING DOWN</Text>
              </HStack>
            </VStack>

            {/* Label + subtitle */}
            <Box flex={1} minW="180px">
              <Text fontSize="11px" color="whiteAlpha.500" fontWeight="700"
                textTransform="uppercase" letterSpacing="wider" mb={1}>
                Organisational Health Score
              </Text>
              <Heading size="xl" color="whiteAlpha.900" fontWeight="900" mb={1}>
                {orgScore} / 100
              </Heading>
              <HStack spacing={2} mb={4}>
                <Box w={2} h={2} borderRadius="full" bg="red.400" />
                <Text fontSize="sm" color="whiteAlpha.600">
                  Below healthy threshold · Multiple conflicts unresolved
                </Text>
              </HStack>
              <SimpleGrid columns={3} gap={3}>
                {[
                  { label: 'Teams',     val: '6',   icon: FiUsers },
                  { label: 'Avg Pulse', val: `${avgScore}`, icon: FiHeart },
                  { label: 'At Risk',   val: `${counts['at-risk'] + counts.overloaded}`, icon: FiAlertTriangle },
                ].map(s => (
                  <Box key={s.label} bg="whiteAlpha.50" borderRadius="lg" p={3} textAlign="center">
                    <Icon as={s.icon} color="whiteAlpha.500" boxSize={4} mb={1} />
                    <Text fontSize="20px" fontWeight="900" color="whiteAlpha.900" lineHeight="1">{s.val}</Text>
                    <Text fontSize="10px" color="whiteAlpha.400" textTransform="uppercase" mt={0.5}>{s.label}</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            {/* Pillar scores */}
            <VStack spacing={2} align="stretch" flex={1} minW="220px">
              {PILLARS.map(p => (
                <Box key={p.label}>
                  <Flex justify="space-between" mb="4px" align="center">
                    <HStack spacing={1.5}>
                      <Icon as={p.icon} color={p.color} boxSize={3} />
                      <Text fontSize="11px" color="whiteAlpha.700" fontWeight="600">{p.label}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <TrendIcon trend={p.trend} />
                      <Text fontSize="11px" color={p.color} fontWeight="800">{p.value}</Text>
                    </HStack>
                  </Flex>
                  <Box h="5px" bg="whiteAlpha.100" borderRadius="full">
                    <Box h="5px" w={`${p.score}%`} bg={p.color} borderRadius="full" transition="width 1s ease" />
                  </Box>
                </Box>
              ))}
            </VStack>
          </Flex>
        </Box>

        {/* ── Metric Detail Cards ─────────────────────────────── */}
        <SimpleGrid columns={{ base: 2, md: 5 }} gap={3} mb={5}>
          {PILLARS.map(p => (
            <Box key={p.label} bg="background.surface" border="1px solid" borderColor="border.subtle"
              borderRadius="xl" p={4} boxShadow="sm"
              borderTop="3px solid" style={{ borderTopColor: p.color }}>
              <HStack justify="space-between" mb={2}>
                <Icon as={p.icon} color={p.color} boxSize={4} />
                <HStack spacing={1}><TrendIcon trend={p.trend} />
                  <Text fontSize="9px" color="text.disabled">{p.trendText}</Text>
                </HStack>
              </HStack>
              <Text fontSize="xs" fontWeight="700" color="text.muted" textTransform="uppercase"
                letterSpacing="wide" mb={0.5}>{p.label}</Text>
              <Text fontSize="lg" fontWeight="800" color="text.primary" mb={2}
                style={{ color: p.color }}>{p.value}</Text>
              <Box h="4px" bg="background.raised" borderRadius="full" mb={2}>
                <Box h="4px" w={`${p.score}%`} borderRadius="full" style={{ background: p.color }} />
              </Box>
              <Text fontSize="10px" color="text.muted" lineHeight="1.5">{p.detail}</Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* ── Tension Hotspots ────────────────────────────────── */}
        <Box bg="background.surface" border="1px solid" borderColor="border.subtle"
          borderRadius="xl" p={5} mb={5} boxShadow="sm">
          <HStack mb={4} spacing={2}>
            <Box w={2} h={2} borderRadius="full" bg="red.500"
              sx={{ animation: 'pulse 1.5s infinite',
                '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
            <Text fontSize="xs" fontWeight="700" color="text.disabled" textTransform="uppercase" letterSpacing="wider">
              Active Tension Hotspots
            </Text>
          </HStack>
          <VStack spacing={2} align="stretch">
            {TENSIONS.map((t, i) => {
              const cfg = TENSION_CFG[t.level];
              return (
                <Flex key={i} align="center" gap={3} p={3} borderRadius="lg"
                  bg={cfg.bg} border="1px solid" borderColor={cfg.border}
                  style={{ background: cfg.bg }}>
                  <Box px={2} py={0.5} borderRadius="md"
                    border="1px solid" style={{ borderColor: cfg.border }}
                    bg="transparent">
                    <Text fontSize="9px" fontWeight="800"
                      style={{ color: cfg.text }}>{cfg.label}</Text>
                  </Box>
                  <HStack spacing={2} flex={1} flexWrap="wrap">
                    <Text fontSize="12px" fontWeight="700" style={{ color: cfg.text }}>
                      {t.teamA}
                    </Text>
                    <Text fontSize="11px" style={{ color: cfg.text }} opacity={0.7}>↔</Text>
                    <Text fontSize="12px" fontWeight="700" style={{ color: cfg.text }}>
                      {t.teamB}
                    </Text>
                    <Text fontSize="11px" style={{ color: cfg.text }} opacity={0.7}>—</Text>
                    <Text fontSize="11px" style={{ color: cfg.text }} opacity={0.8}>{t.reason}</Text>
                  </HStack>
                </Flex>
              );
            })}
          </VStack>
        </Box>

        {/* ── Employee Pulse ───────────────────────────────────── */}
        <Box>
          <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={3}>
            <Box>
              <HStack spacing={2} mb={0.5}>
                <Icon as={FiUsers} color="purple.400" boxSize={4} />
                <Text fontSize="sm" fontWeight="700" color="text.primary">Employee Pulse</Text>
              </HStack>
              <Text fontSize="xs" color="text.muted">Individual performance & well-being — Sprint 3, Q1 2026</Text>
            </Box>

            {/* Filter tabs */}
            <HStack spacing={2} flexWrap="wrap">
              {([
                { key: 'all',       label: 'All',        color: 'gray' },
                { key: 'at-risk',   label: '⚠ At Risk',  color: 'orange' },
                { key: 'overloaded',label: '🔥 Overloaded', color: 'red' },
                { key: 'healthy',   label: '● Healthy',  color: 'green' },
              ] as const).map(f => (
                <Box
                  key={f.key}
                  as="button"
                  onClick={() => setFilter(f.key)}
                  px={3} py={1.5}
                  borderRadius="full"
                  border="1px solid"
                  borderColor={filter === f.key ? `${f.color}.500` : 'border.default'}
                  bg={filter === f.key ? `rgba(0,0,0,0.2)` : 'background.surface'}
                  cursor="pointer"
                  transition="all 0.15s"
                  _hover={{ borderColor: `${f.color}.500`, bg: 'background.raised' }}
                >
                  <HStack spacing={1.5}>
                    <Text fontSize="12px" fontWeight={filter === f.key ? '700' : '500'}
                      color={filter === f.key ? `${f.color}.300` : 'text.secondary'}>
                      {f.label}
                    </Text>
                    <Box px={1.5} py={0.5} borderRadius="full"
                      bg={filter === f.key ? `${f.color}.900` : 'background.raised'}>
                      <Text fontSize="10px" fontWeight="700"
                        color={filter === f.key ? `${f.color}.300` : 'text.muted'}>
                        {counts[f.key]}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </HStack>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={4}>
            {filteredEmployees.map(e => <EmployeeCard key={e.id} e={e} />)}
          </SimpleGrid>
        </Box>

      </Box>
    </AppLayout>
  );
}
