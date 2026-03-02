'use client';

import { useState } from 'react';
import {
  Box, Flex, Text, Heading, Badge, Avatar, HStack, VStack,
  SimpleGrid, Card, CardBody, Select, Input, Icon, Tag,
  Tabs, TabList, Tab, TabPanels, TabPanel, Divider,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure, Tooltip,
  Progress, AvatarGroup,
} from '@chakra-ui/react';
import {
  FiAlertTriangle, FiCheck, FiClock, FiSearch,
  FiLock, FiGitPullRequest, FiZap, FiFilter,
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import {
  jiraTickets, jiraProjects, jiraEpics, currentSprint,
  members, teams, getMemberById, getTicketsByProject,
  type JiraTicket,
} from '@/data/mockData';

// ── Helpers ─────────────────────────────────────────────────

const priorityColor: Record<string, string> = {
  critical: 'red', high: 'orange', medium: 'yellow', low: 'gray',
};

const statusColor: Record<string, string> = {
  todo: 'gray', in_progress: 'blue', done: 'green', blocked: 'red',
};

const statusLabel: Record<string, string> = {
  todo: 'To Do', in_progress: 'In Progress', done: 'Done', blocked: 'Blocked',
};

function PriorityIcon({ priority }: { priority: string }) {
  if (priority === 'critical') return <Icon as={FiAlertTriangle} color="red.500" />;
  if (priority === 'high')     return <Icon as={FiZap} color="orange.400" />;
  if (priority === 'medium')   return <Icon as={FiClock} color="yellow.500" />;
  return <Icon as={FiCheck} color="text.disabled" />;
}

// ── Ticket Card ──────────────────────────────────────────────

function TicketCard({ ticket, onClick }: { ticket: JiraTicket; onClick: () => void }) {
  const assignee = getMemberById(ticket.assigneeId);
  return (
    <Box
      bg="background.surface"
      border="1px solid"
      borderColor={ticket.isConflict ? 'rgba(248,113,113,0.25)' : ticket.isShadowDecision ? 'rgba(251,191,36,0.25)' : 'border.default'}
      borderRadius="md"
      p={3}
      cursor="pointer"
      _hover={{ bg: 'background.raised', borderColor: 'border.default' }}
      onClick={onClick}
      position="relative"
    >
      {ticket.isShadowDecision && (
        <Box position="absolute" top={2} right={2}>
          <Tooltip label="Ticket actioned without CTO visibility">
            <Badge colorScheme="orange" fontSize="9px">NOT ESCALATED</Badge>
          </Tooltip>
        </Box>
      )}
      {ticket.isConflict && !ticket.isShadowDecision && (
        <Box position="absolute" top={2} right={2}>
          <Badge colorScheme="red" fontSize="9px">CONFLICT</Badge>
        </Box>
      )}

      <HStack mb={2} spacing={2} align="center">
        <PriorityIcon priority={ticket.priority} />
        <Text fontSize="xs" color="text.muted" fontFamily="mono">{ticket.key}</Text>
        <Badge colorScheme={priorityColor[ticket.priority]} fontSize="9px" textTransform="capitalize">
          {ticket.priority}
        </Badge>
      </HStack>

      <Text fontSize="sm" fontWeight="600" color="text.primary" noOfLines={2} mb={2} pr={ticket.isShadowDecision ? 8 : 0}>
        {ticket.title}
      </Text>

      {ticket.labels && (
        <Flex flexWrap="wrap" gap={1} mb={2}>
          {ticket.labels.slice(0, 3).map(l => (
            <Tag key={l} size="sm" colorScheme="gray" fontSize="9px">{l}</Tag>
          ))}
        </Flex>
      )}

      <Flex justify="space-between" align="center" mt={2}>
        <HStack spacing={1}>
          {assignee && (
            <Tooltip label={assignee.name}>
              <Avatar size="xs" name={assignee.name} />
            </Tooltip>
          )}
          <Text fontSize="xs" color="text.disabled">{ticket.updatedDaysAgo === 0 ? 'Today' : `${ticket.updatedDaysAgo}d ago`}</Text>
        </HStack>
        {ticket.storyPoints && (
          <Badge variant="outline" fontSize="9px">{ticket.storyPoints} pts</Badge>
        )}
      </Flex>
    </Box>
  );
}

// ── Sprint Board Column ──────────────────────────────────────

function BoardColumn({ title, tickets, color, onSelect }: {
  title: string; tickets: JiraTicket[]; color: string; onSelect: (t: JiraTicket) => void;
}) {
  return (
    <Box minW="0" flex="1">
      <HStack mb={3}>
        <Box w={2} h={2} borderRadius="full" bg={color} />
        <Text fontSize="sm" fontWeight="700" color="text.secondary" textTransform="uppercase" letterSpacing="wider">
          {title}
        </Text>
        <Badge colorScheme="gray" fontSize="10px">{tickets.length}</Badge>
      </HStack>
      <VStack spacing={2} align="stretch">
        {tickets.map(t => (
          <TicketCard key={t.id} ticket={t} onClick={() => onSelect(t)} />
        ))}
        {tickets.length === 0 && (
          <Box bg="background.raised" borderRadius="md" p={4} textAlign="center">
            <Text fontSize="xs" color="text.disabled">No tickets</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

// ── Ticket Detail Modal ──────────────────────────────────────

function TicketModal({ ticket, isOpen, onClose }: {
  ticket: JiraTicket | null; isOpen: boolean; onClose: () => void;
}) {
  if (!ticket) return null;
  const assignee  = getMemberById(ticket.assigneeId);
  const reporter  = getMemberById(ticket.reporterId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="background.surface">
        <ModalHeader pb={2}>
          <HStack>
            <PriorityIcon priority={ticket.priority} />
            <Text fontFamily="mono" fontSize="sm" color="text.muted">{ticket.key}</Text>
            <Badge colorScheme={statusColor[ticket.status]}>{statusLabel[ticket.status]}</Badge>
            {ticket.isShadowDecision && <Badge colorScheme="orange">Not Escalated</Badge>}
            {ticket.isConflict && <Badge colorScheme="red">Conflict</Badge>}
          </HStack>
          <Text mt={1} fontSize="lg" fontWeight="700">{ticket.title}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <SimpleGrid columns={2} gap={4} mb={4}>
            <Box>
              <Text fontSize="xs" color="text.muted" mb={1}>ASSIGNEE</Text>
              <HStack>
                <Avatar size="xs" name={assignee?.name} />
                <Text fontSize="sm">{assignee?.name}</Text>
              </HStack>
            </Box>
            <Box>
              <Text fontSize="xs" color="text.muted" mb={1}>REPORTER</Text>
              <HStack>
                <Avatar size="xs" name={reporter?.name} />
                <Text fontSize="sm">{reporter?.name}</Text>
              </HStack>
            </Box>
            <Box>
              <Text fontSize="xs" color="text.muted" mb={1}>PRIORITY</Text>
              <Badge colorScheme={priorityColor[ticket.priority]} textTransform="capitalize">
                {ticket.priority}
              </Badge>
            </Box>
            <Box>
              <Text fontSize="xs" color="text.muted" mb={1}>AFFECTED TEAMS</Text>
              <Flex flexWrap="wrap" gap={1}>
                {ticket.affectedTeams.map(t => (
                  <Tag key={t} size="sm" colorScheme="purple">{t}</Tag>
                ))}
              </Flex>
            </Box>
          </SimpleGrid>

          <Divider mb={4} borderColor="border.subtle" />

          <Text fontSize="xs" color="text.muted" mb={2}>DESCRIPTION</Text>
          <Text fontSize="sm" color="text.secondary" whiteSpace="pre-wrap" lineHeight="1.7">
            {ticket.description}
          </Text>

          {ticket.linkedTickets && ticket.linkedTickets.length > 0 && (
            <Box mt={4}>
              <Text fontSize="xs" color="text.muted" mb={2}>LINKED TICKETS</Text>
              <Flex gap={2} flexWrap="wrap">
                {ticket.linkedTickets.map(t => (
                  <Tag key={t} colorScheme="blue" fontFamily="mono" size="sm">{t}</Tag>
                ))}
              </Flex>
            </Box>
          )}

          {ticket.linkedPR && (
            <Box mt={4}>
              <Text fontSize="xs" color="text.muted" mb={2}>LINKED PR</Text>
              <HStack>
                <Icon as={FiGitPullRequest} color="purple.400" />
                <Text fontSize="sm" color="purple.400" fontFamily="mono">{ticket.linkedPR}</Text>
              </HStack>
            </Box>
          )}

          {ticket.labels && (
            <Box mt={4}>
              <Text fontSize="xs" color="text.muted" mb={2}>LABELS</Text>
              <Flex gap={2} flexWrap="wrap">
                {ticket.labels.map(l => (
                  <Tag key={l} size="sm" colorScheme="gray">{l}</Tag>
                ))}
              </Flex>
            </Box>
          )}

          {ticket.isShadowDecision && (
            <Box mt={4} p={3} bg="rgba(251,191,36,0.08)" borderRadius="md" border="1px solid" borderColor="rgba(251,191,36,0.25)">
              <Text fontSize="sm" fontWeight="700" color="#FBBF24" mb={1}>
                Not Escalated to Leadership
              </Text>
              <Text fontSize="xs" color="#60A5FA">
                This ticket was actioned and merged to production without CTO sign-off.
                Surfaced by AI Chief of Staff via {ticket.linkedPR ? 'Git cross-reference analysis' : 'communications analysis'}.
              </Text>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function JiraPage() {
  const [selectedProject, setSelectedProject] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket]   = useState<JiraTicket | null>(null);
  const [filterStatus, setFilterStatus]       = useState<string>('ALL');
  const { isOpen, onOpen, onClose }           = useDisclosure();

  const shadowCount   = jiraTickets.filter(t => t.isShadowDecision).length;
  const conflictCount = jiraTickets.filter(t => t.isConflict).length;
  const blockedCount  = jiraTickets.filter(t => t.status === 'blocked').length;
  const criticalCount = jiraTickets.filter(t => t.priority === 'critical').length;

  const filtered = jiraTickets.filter(t => {
    const matchProject = selectedProject === 'ALL' || t.projectKey === selectedProject;
    const matchStatus  = filterStatus === 'ALL' || t.status === filterStatus;
    return matchProject && matchStatus;
  });

  const byStatus = (s: string) => filtered.filter(t => t.status === s);

  function openTicket(t: JiraTicket) {
    setSelectedTicket(t);
    onOpen();
  }

  return (
    <AppLayout>
      <Box maxW="full">

        {/* Header */}
        <Flex justify="space-between" align="flex-start" mb={6}>
          <Box>
            <Heading size="lg" color="text.primary">JIRA Board</Heading>
            <Text color="text.muted" fontSize="sm" mt={1}>
              Nexus Technologies · {currentSprint.name}
            </Text>
          </Box>
          <HStack spacing={3}>
            <Select
              size="sm"
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              w="180px"
              bg="background.raised"
            >
              <option value="ALL">All Projects</option>
              {jiraProjects.map(p => (
                <option key={p.key} value={p.key}>{p.key} — {p.name}</option>
              ))}
            </Select>
            <Select
              size="sm"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              w="160px"
              bg="background.raised"
            >
              <option value="ALL">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </Select>
          </HStack>
        </Flex>

        {/* Alert — Unescalated tickets */}
        {shadowCount > 0 && (
          <Box mb={5} p={4} bg="rgba(251,191,36,0.08)" border="1px solid" borderColor="rgba(251,191,36,0.25)" borderRadius="lg">
            <HStack>
              <Icon as={FiAlertTriangle} color="#FBBF24" />
              <Text fontSize="sm" fontWeight="700" color="#FBBF24">
                {shadowCount} tickets actioned without CTO visibility
              </Text>
              <Text fontSize="sm" color="#60A5FA">
                — merged to production without leadership sign-off. Highlighted in orange below.
              </Text>
            </HStack>
          </Box>
        )}

        {/* Stats */}
        <SimpleGrid columns={4} spacing={4} mb={6}>
          {[
            { label: 'Total Tickets',        value: jiraTickets.length, color: 'blue',   icon: FiFilter },
            { label: 'Critical Priority',    value: criticalCount,      color: 'red',    icon: FiAlertTriangle },
            { label: 'Blocked',              value: blockedCount,       color: 'orange', icon: FiLock },
            { label: 'Not Escalated to CTO', value: shadowCount,        color: 'purple', icon: FiZap },
          ].map(s => (
            <Box key={s.label} bg="background.surface" border="1px solid" borderColor="border.subtle" borderRadius="lg" p={3}>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="xs" color="text.muted">{s.label}</Text>
                  <Text fontSize="2xl" fontWeight="800" color={`${s.color}.400`}>{s.value}</Text>
                </Box>
                <Icon as={s.icon} boxSize={6} color={`${s.color}.600`} />
              </HStack>
            </Box>
          ))}
        </SimpleGrid>

        {/* Sprint Progress */}
        <Box mb={6} bg="background.surface" border="1px solid" borderColor="border.subtle" borderRadius="lg" p={4}>
          <Flex justify="space-between" align="center" mb={3}>
            <Box>
              <Text fontWeight="700" color="text.primary">{currentSprint.name}</Text>
              <Text fontSize="xs" color="text.muted">
                {currentSprint.startDate} → {currentSprint.endDate} · Goal: {currentSprint.goal}
              </Text>
            </Box>
            <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
              {currentSprint.completedPoints} / {currentSprint.committedPoints} pts
            </Badge>
          </Flex>
          <Progress
            value={(currentSprint.completedPoints / currentSprint.committedPoints) * 100}
            colorScheme="blue"
            borderRadius="full"
            size="sm"
          />
          <Text fontSize="xs" color="text.disabled" mt={1}>
            {Math.round((currentSprint.completedPoints / currentSprint.committedPoints) * 100)}% complete
          </Text>
        </Box>

        {/* Board */}
        <Flex gap={4} align="flex-start" overflowX="auto" pb={4}>
          <BoardColumn title="To Do"      tickets={byStatus('todo')}        color="gray.500"   onSelect={openTicket} />
          <BoardColumn title="In Progress" tickets={byStatus('in_progress')} color="blue.400"   onSelect={openTicket} />
          <BoardColumn title="Blocked"    tickets={byStatus('blocked')}     color="red.500"    onSelect={openTicket} />
          <BoardColumn title="Done"       tickets={byStatus('done')}        color="green.500"  onSelect={openTicket} />
        </Flex>

        {/* Projects Overview */}
        <Heading size="sm" mt={8} mb={4} color="text.secondary">Projects & Teams</Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {jiraProjects.map(proj => {
            const projTickets = getTicketsByProject(proj.key);
            const team = teams.find(t => t.id === proj.teamId);
            const done = projTickets.filter(t => t.status === 'done').length;
            return (
              <Box key={proj.id} bg="background.surface" border="1px solid" borderColor="border.subtle" borderRadius="lg" p={4}>
                <HStack mb={2}>
                  <Box w={3} h={3} borderRadius="sm" bg={proj.color} />
                  <Text fontWeight="700" fontSize="sm" color="text.primary">{proj.name}</Text>
                  <Badge fontFamily="mono" colorScheme="gray" fontSize="xs">{proj.key}</Badge>
                </HStack>
                <Text fontSize="xs" color="text.muted" mb={3}>{proj.description}</Text>
                <Flex justify="space-between" fontSize="xs" color="text.secondary" mb={2}>
                  <Text>{projTickets.length} tickets</Text>
                  <Text>{done} done</Text>
                </Flex>
                <Progress
                  value={projTickets.length ? (done / projTickets.length) * 100 : 0}
                  size="xs"
                  colorScheme="green"
                  borderRadius="full"
                  mb={3}
                />
                {team && (
                  <HStack>
                    <AvatarGroup size="xs" max={4}>
                      {team.memberIds.map(id => {
                        const m = getMemberById(id);
                        return m ? <Avatar key={id} name={m.name} /> : null;
                      })}
                    </AvatarGroup>
                    <Text fontSize="xs" color="text.muted">{team.name}</Text>
                  </HStack>
                )}
              </Box>
            );
          })}
        </SimpleGrid>

      </Box>

      <TicketModal ticket={selectedTicket} isOpen={isOpen} onClose={onClose} />
    </AppLayout>
  );
}
