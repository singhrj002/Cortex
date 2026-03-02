'use client';

import { useState } from 'react';
import {
  Box, Flex, Text, Heading, Badge, Avatar, HStack, VStack,
  Icon, SimpleGrid, Tooltip, Divider,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure,
} from '@chakra-ui/react';
import {
  FiMail, FiAlertTriangle, FiShield, FiCode, FiServer,
  FiCheckSquare, FiBriefcase, FiSettings,
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import { members, teams, getMemberById, jiraTickets, pullRequests } from '@/data/mockData';

// ─────────────────────────────────────────────────────────────
// Team & Tier Configuration
// ─────────────────────────────────────────────────────────────

const TEAM_CONFIG: Record<string, {
  color: string; lightBg: string; scheme: string; icon: any; border: string;
}> = {
  'Leadership':        { color: '#805AD5', lightBg: '#FAF5FF', scheme: 'purple', icon: FiBriefcase,   border: '#D6BCFA' },
  'Backend Platform':  { color: '#3182CE', lightBg: '#EBF8FF', scheme: 'blue',   icon: FiServer,      border: '#90CDF4' },
  'Frontend':          { color: '#38A169', lightBg: '#F0FFF4', scheme: 'green',  icon: FiCode,        border: '#9AE6B4' },
  'Infrastructure':    { color: '#DD6B20', lightBg: '#FFFAF0', scheme: 'orange', icon: FiSettings,    border: '#FBD38D' },
  'Security':          { color: '#E53E3E', lightBg: '#FFF5F5', scheme: 'red',    icon: FiShield,      border: '#FEB2B2' },
  'QA':                { color: '#D69E2E', lightBg: '#FFFFF0', scheme: 'yellow', icon: FiCheckSquare, border: '#F6E05E' },
};

function getTier(role: string): 'executive' | 'vp' | 'lead' | 'senior' | 'engineer' {
  if (role === 'CTO') return 'executive';
  if (role === 'VP Engineering' || role === 'Head of Product') return 'vp';
  if (role.endsWith('Lead')) return 'lead';
  if (role.startsWith('Senior')) return 'senior';
  return 'engineer';
}

const TIER_LABEL: Record<string, string> = {
  executive: 'C-SUITE', vp: 'VP', lead: 'LEAD', senior: 'SENIOR', engineer: 'ENG',
};

type TierKey = 'executive' | 'vp' | 'lead' | 'senior' | 'engineer';

const TIER_BADGE: Record<TierKey, { scheme: string; variant: 'solid' | 'subtle' }> = {
  executive: { scheme: 'purple', variant: 'solid'  },
  vp:        { scheme: 'purple', variant: 'subtle' },
  lead:      { scheme: 'blue',   variant: 'solid'  },
  senior:    { scheme: 'cyan',   variant: 'subtle' },
  engineer:  { scheme: 'gray',   variant: 'subtle' },
};

// ─────────────────────────────────────────────────────────────
// Stats helpers
// ─────────────────────────────────────────────────────────────

function getMemberStats(memberId: string) {
  const openTickets     = jiraTickets.filter(t => t.assigneeId === memberId && t.status !== 'done').length;
  const conflictTickets = jiraTickets.filter(t => t.assigneeId === memberId && t.isConflict).length;
  const unescalated     = jiraTickets.filter(t => t.assigneeId === memberId && t.isShadowDecision).length;
  const openPRs         = pullRequests.filter(p => p.authorId === memberId && (p.status === 'open' || p.status === 'draft')).length;
  return { openTickets, conflictTickets, unescalated, openPRs };
}

// ─────────────────────────────────────────────────────────────
// MemberCard component
// ─────────────────────────────────────────────────────────────

function MemberCard({
  memberId,
  size = 'normal',
  onClick,
}: {
  memberId: string;
  size?: 'large' | 'normal' | 'compact';
  onClick: () => void;
}) {
  const m     = getMemberById(memberId);
  if (!m) return null;
  const stats  = getMemberStats(memberId);
  const tc     = TEAM_CONFIG[m.team] ?? TEAM_CONFIG['Backend Platform'];
  const tier   = getTier(m.role) as TierKey;
  const tb     = TIER_BADGE[tier];
  const hasAlert = stats.conflictTickets > 0 || stats.unescalated > 0;

  const cardW      = size === 'large' ? '196px' : size === 'compact' ? '144px' : '168px';
  const avatarSize = size === 'large' ? 'md' : 'sm';
  const pad        = size === 'compact' ? 2 : 3;

  return (
    <Box
      position="relative"
      bg="background.surface"
      borderRadius="xl"
      boxShadow={hasAlert ? '0 2px 8px rgba(237,137,54,0.18)' : '0 1px 6px rgba(0,0,0,0.08)'}
      border="1px solid"
      borderColor={hasAlert ? 'rgba(251,191,36,0.25)' : 'border.subtle'}
      overflow="hidden"
      cursor="pointer"
      w={cardW}
      userSelect="none"
      flexShrink={0}
      transition="all 0.18s ease"
      _hover={{
        boxShadow: '0 6px 20px rgba(0,0,0,0.13)',
        transform: 'translateY(-3px)',
        borderColor: tc.border,
      }}
      onClick={onClick}
    >
      {/* Coloured top accent bar */}
      <Box h="3px" bg={tc.color} />

      <Box p={pad}>
        <HStack spacing={2} mb={2} align="flex-start">
          <Avatar
            size={avatarSize}
            name={m.name}
            bg={tc.color}
            color="white"
            fontWeight="800"
            flexShrink={0}
          />
          <Box flex={1} minW={0}>
            <Text
              fontWeight="700"
              fontSize={size === 'compact' ? '10px' : 'xs'}
              color="text.primary"
              noOfLines={1}
              lineHeight="1.4"
            >
              {m.name}
            </Text>
            <Text fontSize="9px" color="text.disabled" noOfLines={1} lineHeight="1.3">
              {m.role}
            </Text>
          </Box>
          {hasAlert && (
            <Tooltip
              label={[
                stats.unescalated     > 0 ? `${stats.unescalated} not escalated` : '',
                stats.conflictTickets > 0 ? `${stats.conflictTickets} active conflict${stats.conflictTickets > 1 ? 's' : ''}` : '',
              ].filter(Boolean).join(' · ')}
              fontSize="xs"
              hasArrow
            >
              <Box flexShrink={0} pt="1px">
                <Icon as={FiAlertTriangle} color="orange.400" boxSize={3} />
              </Box>
            </Tooltip>
          )}
        </HStack>

        <Flex align="center" justify="space-between">
          <Badge
            fontSize="7px"
            colorScheme={tb.scheme}
            variant={tb.variant}
            borderRadius="full"
            px={1.5}
            py={0.5}
            letterSpacing="0.06em"
          >
            {TIER_LABEL[tier]}
          </Badge>
          {size !== 'compact' && (stats.openTickets > 0 || stats.openPRs > 0) && (
            <HStack spacing={1.5}>
              {stats.openTickets > 0 && (
                <Text fontSize="8px" color="text.disabled" fontWeight="600">{stats.openTickets}T</Text>
              )}
              {stats.openPRs > 0 && (
                <Text fontSize="8px" color="purple.400" fontWeight="600">{stats.openPRs}PR</Text>
              )}
            </HStack>
          )}
        </Flex>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// Connector helpers
// ─────────────────────────────────────────────────────────────

const LINE = 'border.subtle';

function VLine({ h = '28px' }: { h?: string }) {
  return <Box w="2px" h={h} bg={LINE} mx="auto" flexShrink={0} />;
}

// ─────────────────────────────────────────────────────────────
// TeamColumn — Lead → Senior(s) → Engineers
// compact card width = 144px, gap between siblings = 12px (gap={3})
// ─────────────────────────────────────────────────────────────

const COMPACT_W    = 144;
const ENG_GAP_PX   = 12;  // px — matches gap={3} in Chakra (3 * 4px)
const ENG_GAP_UNIT = 3;   // Chakra spacing unit

function TeamColumn({
  teamName,
  leadId,
  onMemberClick,
}: {
  teamName: string;
  leadId: string;
  onMemberClick: (id: string) => void;
}) {
  const tc      = TEAM_CONFIG[teamName] ?? TEAM_CONFIG['Backend Platform'];
  const teamObj = teams.find(t => t.name === teamName);
  if (!teamObj) return null;

  const otherIds  = teamObj.memberIds.filter(id => id !== leadId);
  const seniors   = otherIds.filter(id => getMemberById(id)?.role.startsWith('Senior'));
  const engineers = otherIds.filter(id => !getMemberById(id)?.role.startsWith('Senior'));

  // Horizontal bar width: center-of-first to center-of-last engineer
  // Each compact card = 144px, gap = 12px → center-to-center = 144 + 12 = 156px per step
  const engBarW = engineers.length > 1
    ? `${(engineers.length - 1) * (COMPACT_W + ENG_GAP_PX)}px`
    : '0px';

  // Minimum column width: wide enough to show all engineers side-by-side
  const colMinW = Math.max(
    168,
    engineers.length * COMPACT_W + Math.max(0, engineers.length - 1) * ENG_GAP_PX
  );

  return (
    <Flex direction="column" align="center" minW={`${colMinW}px`}>

      {/* ── Team badge pill ── */}
      <HStack
        spacing={1.5}
        bg="background.raised"
        border="1px solid"
        borderColor="border.subtle"
        borderRadius="full"
        px={3}
        py={1}
        mb={3}
        flexShrink={0}
      >
        <Icon as={tc.icon} color={tc.color} boxSize={3} />
        <Text fontSize="xs" fontWeight="700" color={tc.color} whiteSpace="nowrap">
          {teamName}
        </Text>
      </HStack>

      {/* ── Lead ── */}
      <MemberCard memberId={leadId} onClick={() => onMemberClick(leadId)} />

      {/* ── Seniors ── */}
      {seniors.map(sid => (
        <Flex key={sid} direction="column" align="center">
          <VLine h="18px" />
          <MemberCard memberId={sid} onClick={() => onMemberClick(sid)} />
        </Flex>
      ))}

      {/* ── Engineers ── */}
      {engineers.length > 0 && (
        <Flex direction="column" align="center">
          <VLine h="18px" />

          {engineers.length > 1 ? (
            /* Multiple engineers: T-branch connector */
            <>
              {/* Horizontal bar from first-eng-center to last-eng-center */}
              <Box w={engBarW} h="2px" bg={LINE} />

              {/* Engineer cards, each with a short drop line */}
              <Flex gap={ENG_GAP_UNIT} justify="center">
                {engineers.map(eid => (
                  <Flex key={eid} direction="column" align="center">
                    <Box w="2px" h="14px" bg={LINE} />
                    <MemberCard memberId={eid} size="compact" onClick={() => onMemberClick(eid)} />
                  </Flex>
                ))}
              </Flex>
            </>
          ) : (
            /* Single engineer: straight drop */
            engineers.map(eid => (
              <MemberCard key={eid} memberId={eid} size="compact" onClick={() => onMemberClick(eid)} />
            ))
          )}
        </Flex>
      )}
    </Flex>
  );
}

// ─────────────────────────────────────────────────────────────
// Member detail modal
// ─────────────────────────────────────────────────────────────

function MemberModal({
  memberId, isOpen, onClose,
}: {
  memberId: string | null; isOpen: boolean; onClose: () => void;
}) {
  if (!memberId) return null;
  const m = getMemberById(memberId);
  if (!m) return null;

  const stats     = getMemberStats(memberId);
  const tc        = TEAM_CONFIG[m.team] ?? TEAM_CONFIG['Backend Platform'];
  const myTickets = jiraTickets.filter(t => t.assigneeId === memberId);
  const myPRs     = pullRequests.filter(p => p.authorId === memberId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.400" />
      <ModalContent bg="background.surface" borderRadius="2xl" overflow="hidden" boxShadow="2xl">
        <Box h="4px" bg={tc.color} />

        <ModalHeader pb={2}>
          <HStack spacing={4}>
            <Avatar size="lg" name={m.name} bg={tc.color} color="white" fontWeight="800" />
            <Box flex={1}>
              <Text fontSize="xl" fontWeight="800" color="text.primary">{m.name}</Text>
              <Text fontSize="sm" color="text.muted" mb={1}>{m.role}</Text>
              <HStack flexWrap="wrap" gap={2}>
                <Badge colorScheme={tc.scheme} borderRadius="full" px={2} fontSize="xs">
                  {m.team}
                </Badge>
                <HStack spacing={1}>
                  <Icon as={FiMail} boxSize={3} color="text.disabled" />
                  <Text fontSize="xs" color="text.muted">{m.email}</Text>
                </HStack>
              </HStack>
            </Box>
          </HStack>
        </ModalHeader>
        <ModalCloseButton top={5} right={5} />

        <ModalBody pb={6}>
          {/* Stats row */}
          <SimpleGrid columns={4} gap={3} mb={5}>
            {[
              { label: 'Open Tickets',   value: stats.openTickets,     color: 'blue'   },
              { label: 'Conflicts',      value: stats.conflictTickets, color: 'red'    },
              { label: 'Not Escalated',  value: stats.unescalated,     color: 'orange' },
              { label: 'Open PRs',       value: stats.openPRs,         color: 'purple' },
            ].map(s => (
              <Box key={s.label} textAlign="center" bg="background.raised" borderRadius="xl" p={3}>
                <Text fontSize="2xl" fontWeight="800" color={`${s.color}.400`} lineHeight="1">
                  {s.value}
                </Text>
                <Text fontSize="9px" color="text.muted" mt={1} fontWeight="600">{s.label}</Text>
              </Box>
            ))}
          </SimpleGrid>

          <Divider mb={4} borderColor="border.subtle" />

          {/* Assigned tickets */}
          {myTickets.length > 0 && (
            <Box mb={4}>
              <Text fontSize="xs" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="wider">
                Assigned Tickets ({myTickets.length})
              </Text>
              <VStack spacing={1.5} align="stretch">
                {myTickets.map(t => (
                  <Flex
                    key={t.id}
                    justify="space-between"
                    align="center"
                    bg={t.isShadowDecision ? 'rgba(251,191,36,0.08)' : t.isConflict ? 'rgba(248,113,113,0.08)' : 'background.raised'}
                    borderRadius="lg"
                    px={3}
                    py={2}
                    border="1px solid"
                    borderColor={t.isShadowDecision ? 'rgba(251,191,36,0.25)' : t.isConflict ? 'rgba(248,113,113,0.25)' : 'border.subtle'}
                  >
                    <HStack spacing={2} flex={1} minW={0}>
                      <Text fontSize="xs" fontFamily="mono" color="semantic.decision" fontWeight="700" flexShrink={0}>
                        {t.key}
                      </Text>
                      <Text fontSize="xs" color="text.secondary" noOfLines={1}>{t.title}</Text>
                    </HStack>
                    <HStack spacing={1} flexShrink={0} ml={2}>
                      <Badge
                        fontSize="8px"
                        colorScheme={t.status === 'done' ? 'green' : t.status === 'blocked' ? 'red' : t.status === 'in_progress' ? 'blue' : 'gray'}
                        borderRadius="full"
                      >
                        {t.status}
                      </Badge>
                      {t.isConflict     && <Badge fontSize="8px" colorScheme="red"    borderRadius="full">Conflict</Badge>}
                      {t.isShadowDecision && <Badge fontSize="8px" colorScheme="orange" borderRadius="full">Not Escalated</Badge>}
                    </HStack>
                  </Flex>
                ))}
              </VStack>
            </Box>
          )}

          {/* Pull requests */}
          {myPRs.length > 0 && (
            <Box>
              <Text fontSize="xs" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="wider">
                Pull Requests ({myPRs.length})
              </Text>
              <VStack spacing={1.5} align="stretch">
                {myPRs.map(pr => (
                  <Flex
                    key={pr.id}
                    justify="space-between"
                    align="center"
                    bg={pr.isShadowDecision ? 'rgba(251,191,36,0.08)' : 'background.raised'}
                    borderRadius="lg"
                    px={3}
                    py={2}
                    border="1px solid"
                    borderColor={pr.isShadowDecision ? 'rgba(251,191,36,0.25)' : 'border.subtle'}
                  >
                    <HStack spacing={2} flex={1} minW={0}>
                      <Text fontSize="xs" fontFamily="mono" color="purple.400" fontWeight="700" flexShrink={0}>
                        #{pr.number}
                      </Text>
                      <Text fontSize="xs" color="text.secondary" noOfLines={1}>{pr.title}</Text>
                    </HStack>
                    <HStack spacing={1} flexShrink={0} ml={2}>
                      <Badge
                        fontSize="8px"
                        colorScheme={pr.status === 'merged' ? 'purple' : pr.status === 'draft' ? 'gray' : pr.status === 'open' ? 'blue' : 'gray'}
                        borderRadius="full"
                      >
                        {pr.status}
                      </Badge>
                      {pr.isShadowDecision && <Badge fontSize="8px" colorScheme="orange" borderRadius="full">Not Escalated</Badge>}
                    </HStack>
                  </Flex>
                ))}
              </VStack>
            </Box>
          )}

          {myTickets.length === 0 && myPRs.length === 0 && (
            <Flex justify="center" align="center" py={8}>
              <Text fontSize="sm" color="text.disabled">No assigned tickets or open PRs</Text>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Engineering team → lead mapping
// ─────────────────────────────────────────────────────────────

const ENGINEERING_TEAMS = [
  { teamName: 'Backend Platform', leadId: 'u-004' },
  { teamName: 'Frontend',         leadId: 'u-008' },
  { teamName: 'Infrastructure',   leadId: 'u-012' },
  { teamName: 'Security',         leadId: 'u-015' },
  { teamName: 'QA',               leadId: 'u-017' },
];

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default function OrgMapPage() {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const { isOpen, onOpen, onClose }         = useDisclosure();

  function openMember(id: string) {
    setSelectedMember(id);
    onOpen();
  }

  const totalConflicts = jiraTickets.filter(t => t.isConflict).length;
  const alertCount     = members.filter(m => {
    const s = getMemberStats(m.id);
    return s.conflictTickets > 0 || s.unescalated > 0;
  }).length;

  return (
    <AppLayout>
      <Box pb={12}>

        {/* ── Header ── */}
        <Flex justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={4}>
          <Box>
            <Heading size="lg" fontWeight="800" color="text.primary">Org Chart</Heading>
            <Text color="text.muted" fontSize="sm" mt={0.5}>
              Nexus Technologies · {members.length} people across {teams.length - 1} engineering teams
            </Text>
          </Box>
          <HStack spacing={2} flexWrap="wrap">
            <HStack spacing={1.5} bg="rgba(251,191,36,0.08)" border="1px solid" borderColor="rgba(251,191,36,0.25)" borderRadius="full" px={3} py={1.5}>
              <Icon as={FiAlertTriangle} color="#FBBF24" boxSize={3} />
              <Text fontSize="xs" color="#FBBF24" fontWeight="600">Orange border = active alert</Text>
            </HStack>
            <Text fontSize="xs" color="text.disabled" px={1}>Click any card to view activity</Text>
          </HStack>
        </Flex>

        {/* ── Summary stats ── */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
          {[
            { label: 'Total People',        value: members.length,     color: 'blue',   bg: 'rgba(96,165,250,0.08)',   border: 'rgba(96,165,250,0.25)' },
            { label: 'Engineering Teams',   value: teams.length - 1,   color: 'purple', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)' },
            { label: 'Active Conflicts',    value: totalConflicts,      color: 'red',    bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)' },
            { label: 'Members with Alerts', value: alertCount,          color: 'orange', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.25)' },
          ].map(s => (
            <Box
              key={s.label}
              bg={s.bg}
              border="1px solid"
              borderColor={s.border}
              borderRadius="xl"
              p={4}
            >
              <Text fontSize="3xl" fontWeight="800" color={`${s.color}.400`} lineHeight="1">{s.value}</Text>
              <Text fontSize="xs" color={`${s.color}.300`} fontWeight="600" mt={1.5}>{s.label}</Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* ── Main org chart container ── */}
        <Box
          bg="background.surface"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          boxShadow="0 2px 12px rgba(0,0,0,0.06)"
          p={8}
          overflowX="auto"
          mb={8}
        >

          {/* ── Level 1: CTO ── */}
          <Flex direction="column" align="center">
            <MemberCard memberId="u-001" size="large" onClick={() => openMember('u-001')} />

            {/* VLine down to horizontal bar */}
            <VLine h="32px" />

            {/* ── Level 2: VP Eng + Head of Product ── */}
            {/* 400px wide container: bar + two cards at extremes */}
            <Box position="relative" w="400px">
              {/* Horizontal connector bar */}
              <Box position="absolute" top="0" left="0" right="0" h="2px" bg={LINE} />

              <Flex justify="space-between">
                {/* VP Engineering */}
                <Flex direction="column" align="center">
                  <VLine h="24px" />
                  <MemberCard memberId="u-002" onClick={() => openMember('u-002')} />
                </Flex>
                {/* Head of Product */}
                <Flex direction="column" align="center">
                  <VLine h="24px" />
                  <MemberCard memberId="u-003" onClick={() => openMember('u-003')} />
                </Flex>
              </Flex>
            </Box>
          </Flex>

          {/* ── Section divider: Engineering Teams ── */}
          <Flex align="center" mt={10} mb={8} gap={4}>
            <Box flex={1} h="1px" bg="border.subtle" />
            <HStack
              spacing={2}
              bg="rgba(96,165,250,0.08)"
              border="1px solid"
              borderColor="rgba(96,165,250,0.25)"
              borderRadius="full"
              px={5}
              py={2}
              flexShrink={0}
            >
              <Avatar size="2xs" name="Michael Park" bg="#3182CE" color="white" fontWeight="800" />
              <Text fontSize="xs" fontWeight="700" color="semantic.info" whiteSpace="nowrap">
                Engineering Teams · Reports to Michael Park, VP Engineering
              </Text>
            </HStack>
            <Box flex={1} h="1px" bg="border.subtle" />
          </Flex>

          {/* ── Level 3–5: 5 Team Columns ── */}
          <Flex gap={8} justify="center" align="flex-start" overflowX="auto" pb={2}>
            {ENGINEERING_TEAMS.map(({ teamName, leadId }) => (
              <TeamColumn
                key={teamName}
                teamName={teamName}
                leadId={leadId}
                onMemberClick={openMember}
              />
            ))}
          </Flex>

          {/* ── Tier legend ── */}
          <Flex justify="center" gap={3} mt={8} flexWrap="wrap">
            {([
              { tier: 'lead' as TierKey,     label: 'Team Lead',      desc: 'Department head' },
              { tier: 'senior' as TierKey,   label: 'Senior Engineer', desc: '5+ years exp' },
              { tier: 'engineer' as TierKey, label: 'Engineer',        desc: 'Individual contributor' },
            ] as Array<{ tier: TierKey; label: string; desc: string }>).map(({ tier, label, desc }) => (
              <Tooltip key={tier} label={desc} hasArrow fontSize="xs">
                <HStack
                  spacing={1.5}
                  bg="background.raised"
                  border="1px solid"
                  borderColor="border.default"
                  borderRadius="full"
                  px={3}
                  py={1}
                >
                  <Badge
                    fontSize="7px"
                    colorScheme={TIER_BADGE[tier].scheme}
                    variant={TIER_BADGE[tier].variant}
                    borderRadius="full"
                    px={1.5}
                    py={0.5}
                  >
                    {TIER_LABEL[tier]}
                  </Badge>
                  <Text fontSize="xs" color="text.muted" fontWeight="500">{label}</Text>
                </HStack>
              </Tooltip>
            ))}
            <HStack spacing={1.5} bg="rgba(251,191,36,0.08)" border="1px solid" borderColor="rgba(251,191,36,0.25)" borderRadius="full" px={3} py={1}>
              <Icon as={FiAlertTriangle} color="#FBBF24" boxSize={3} />
              <Text fontSize="xs" color="#FBBF24" fontWeight="500">Active alert</Text>
            </HStack>
          </Flex>

        </Box>

        {/* ── Team overview grid ── */}
        <Heading size="sm" mb={4} color="text.secondary" fontWeight="700">Team Overview</Heading>
        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
          {teams.filter(t => t.name !== 'Leadership').map(team => {
            const tc     = TEAM_CONFIG[team.name] ?? TEAM_CONFIG['Backend Platform'];
            const lead   = getMemberById(team.lead);
            const conflicts   = jiraTickets.filter(t2 => team.memberIds.includes(t2.assigneeId) && t2.isConflict).length;
            const unescalated = jiraTickets.filter(t2 => team.memberIds.includes(t2.assigneeId) && t2.isShadowDecision).length;
            const hasIssues   = conflicts > 0 || unescalated > 0;

            return (
              <Box
                key={team.id}
                bg="background.surface"
                border="1px solid"
                borderColor={hasIssues ? 'rgba(251,191,36,0.25)' : 'border.subtle'}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="sm"
                cursor="pointer"
                transition="all 0.15s"
                _hover={{ bg: 'background.raised', transform: 'translateY(-2px)' }}
                onClick={() => openMember(team.lead)}
              >
                <Box h="3px" bg={tc.color} />
                <Box p={3}>
                  <HStack mb={1.5} spacing={1.5}>
                    <Icon as={tc.icon} color={tc.color} boxSize={3.5} />
                    <Text fontWeight="700" fontSize="xs" color="text.primary" noOfLines={1}>{team.name}</Text>
                  </HStack>
                  <Text fontSize="xs" color="text.disabled" mb={2}>{team.memberIds.length} members</Text>
                  {lead && (
                    <HStack mb={2} spacing={1.5}>
                      <Avatar size="xs" name={lead.name} bg={tc.color} color="white" />
                      <Text fontSize="xs" color="text.secondary" noOfLines={1}>{lead.name}</Text>
                    </HStack>
                  )}
                  <HStack flexWrap="wrap" gap={1}>
                    {conflicts   > 0 && <Badge colorScheme="red"    fontSize="7px" borderRadius="full">{conflicts} conflicts</Badge>}
                    {unescalated > 0 && <Badge colorScheme="orange" fontSize="7px" borderRadius="full">{unescalated} unescalated</Badge>}
                    {!hasIssues       && <Badge colorScheme="green"  fontSize="7px" borderRadius="full">Clear</Badge>}
                  </HStack>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>

      </Box>

      <MemberModal memberId={selectedMember} isOpen={isOpen} onClose={onClose} />
    </AppLayout>
  );
}
