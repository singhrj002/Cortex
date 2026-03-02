'use client';

import { useState } from 'react';
import {
  Box, Flex, Text, Heading, Badge, Avatar, HStack, VStack,
  SimpleGrid, Icon, Divider, Tooltip,
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, useDisclosure, Select,
} from '@chakra-ui/react';
import {
  FiGitPullRequest, FiGitMerge, FiGitBranch, FiAlertTriangle,
  FiCode, FiStar, FiMessageSquare,
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';
import {
  gitRepos, pullRequests, getMemberById, getPRsByRepo,
  teams, type PullRequest,
} from '@/data/mockData';

// ── Helpers ─────────────────────────────────────────────────

const PR_STATUS: Record<string, { color: string; bg: string; border: string; label: string }> = {
  open:   { color: '#A78BFA', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.3)', label: 'Open'   },
  merged: { color: '#C084FC', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.3)', label: 'Merged' },
  draft:  { color: '#71717A', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.3)', label: 'Draft'  },
  closed: { color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', label: 'Closed' },
};

const REVIEW_STATUS: Record<string, { color: string; label: string }> = {
  approved:          { color: '#34D399', label: 'Approved' },
  changes_requested: { color: '#F87171', label: 'Changes Requested' },
  pending:           { color: '#A1A1AA', label: 'Review Pending' },
  merged:            { color: '#C084FC', label: 'Merged' },
};

function PRStatusIcon({ status }: { status: string }) {
  if (status === 'merged') return <Icon as={FiGitMerge}      color="#C084FC" boxSize={4} />;
  if (status === 'draft')  return <Icon as={FiGitBranch}     color="#71717A" boxSize={4} />;
  return                          <Icon as={FiGitPullRequest} color="#A78BFA" boxSize={4} />;
}

// ── PR Card ──────────────────────────────────────────────────

function PRCard({ pr, onClick }: { pr: PullRequest; onClick: () => void }) {
  const author  = getMemberById(pr.authorId);
  const prs     = PR_STATUS[pr.status] ?? PR_STATUS.open;
  const rev     = REVIEW_STATUS[pr.reviewStatus] ?? REVIEW_STATUS.pending;

  const borderColor = pr.isConflict
    ? 'rgba(248,113,113,0.35)'
    : pr.isShadowDecision
    ? 'rgba(251,191,36,0.3)'
    : 'border.subtle';

  return (
    <Box
      bg="background.surface"
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      cursor="pointer"
      transition="all 0.16s ease"
      _hover={{
        bg: 'background.raised',
        borderColor: pr.isConflict ? 'rgba(248,113,113,0.6)' : pr.isShadowDecision ? 'rgba(251,191,36,0.5)' : 'border.default',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
      onClick={onClick}
      position="relative"
      overflow="hidden"
    >
      {/* Left accent stripe */}
      <Box
        position="absolute"
        left={0}
        top={0}
        bottom={0}
        w="3px"
        bg={pr.isConflict ? '#F87171' : pr.isShadowDecision ? '#FBBF24' : prs.color}
        borderRadius="3px 0 0 3px"
      />

      <Box pl={2}>
        <Flex justify="space-between" align="flex-start" mb={2.5}>
          <HStack spacing={2} flex="1" mr={2}>
            <PRStatusIcon status={pr.status} />
            <Text fontSize="sm" fontWeight="700" color="text.primary" noOfLines={2} letterSpacing="-0.01em">
              {pr.title}
            </Text>
          </HStack>
          <HStack spacing={1.5} flexShrink={0}>
            {pr.isShadowDecision && (
              <Tooltip label="Merged without CTO sign-off" hasArrow>
                <Box
                  bg="rgba(251,191,36,0.1)"
                  border="1px solid"
                  borderColor="rgba(251,191,36,0.3)"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                >
                  <Text fontSize="9px" fontWeight="700" color="#FBBF24" textTransform="uppercase" letterSpacing="0.05em">
                    Not Escalated
                  </Text>
                </Box>
              </Tooltip>
            )}
            {pr.isConflict && (
              <Tooltip label="Conflicts with another change or policy" hasArrow>
                <Box
                  bg="rgba(248,113,113,0.1)"
                  border="1px solid"
                  borderColor="rgba(248,113,113,0.3)"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                >
                  <Text fontSize="9px" fontWeight="700" color="#F87171" textTransform="uppercase" letterSpacing="0.05em">
                    Conflict
                  </Text>
                </Box>
              </Tooltip>
            )}
          </HStack>
        </Flex>

        {/* Status row */}
        <HStack mb={3} spacing={2} flexWrap="wrap">
          <Box bg={prs.bg} border="1px solid" borderColor={prs.border} borderRadius="full" px={2} py={0.5}>
            <Text fontSize="10px" fontWeight="700" color={prs.color} textTransform="capitalize">
              {prs.label}
            </Text>
          </Box>
          <Box bg="background.overlay" border="1px solid" borderColor="border.subtle" borderRadius="full" px={2} py={0.5}>
            <Text fontSize="10px" fontWeight="600" color={rev.color}>{rev.label}</Text>
          </Box>
          <Text fontSize="xs" color="text.disabled" fontFamily="mono">#{pr.number}</Text>
        </HStack>

        {/* Footer */}
        <Flex align="center" justify="space-between">
          <HStack spacing={3}>
            <HStack spacing={1.5}>
              <Avatar size="xs" name={author?.name} bg="brand.600" color="white" />
              <Text fontSize="xs" color="text.muted">{author?.name}</Text>
            </HStack>
            <Text fontSize="xs" color="text.disabled">
              {pr.status === 'merged' ? `Merged ${pr.mergedDaysAgo}d ago` : `${pr.createdDaysAgo}d ago`}
            </Text>
          </HStack>
          <HStack spacing={3} fontSize="xs">
            <Text color="#34D399" fontWeight="700">+{pr.additions}</Text>
            <Text color="#F87171" fontWeight="700">−{pr.deletions}</Text>
            {pr.comments > 0 && (
              <HStack spacing={1} color="text.muted">
                <Icon as={FiMessageSquare} boxSize={3} />
                <Text>{pr.comments}</Text>
              </HStack>
            )}
          </HStack>
        </Flex>

        {pr.linkedTickets.length > 0 && (
          <Flex gap={1.5} mt={2.5} flexWrap="wrap">
            {pr.linkedTickets.map(t => (
              <Box
                key={t}
                bg="rgba(167,139,250,0.1)"
                border="1px solid"
                borderColor="rgba(167,139,250,0.25)"
                borderRadius="md"
                px={2}
                py={0.5}
              >
                <Text fontSize="9px" fontFamily="mono" color="#A78BFA" fontWeight="700">{t}</Text>
              </Box>
            ))}
          </Flex>
        )}
      </Box>
    </Box>
  );
}

// ── PR Detail Modal ──────────────────────────────────────────

function PRModal({ pr, isOpen, onClose }: {
  pr: PullRequest | null; isOpen: boolean; onClose: () => void;
}) {
  if (!pr) return null;
  const author    = getMemberById(pr.authorId);
  const reviewers = pr.reviewerIds.map(getMemberById).filter(Boolean);
  const prs       = PR_STATUS[pr.status] ?? PR_STATUS.open;
  const rev       = REVIEW_STATUS[pr.reviewStatus] ?? REVIEW_STATUS.pending;

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
        <Box h="2px" bg={pr.isConflict ? '#F87171' : pr.isShadowDecision ? '#FBBF24' : prs.color} />

        <ModalHeader pb={2} color="text.primary">
          <HStack mb={2} spacing={2} flexWrap="wrap">
            <PRStatusIcon status={pr.status} />
            <Text fontFamily="mono" fontSize="sm" color="text.disabled">#{pr.number}</Text>
            <Box bg={prs.bg} border="1px solid" borderColor={prs.border} borderRadius="full" px={2} py={0.5}>
              <Text fontSize="10px" fontWeight="700" color={prs.color} textTransform="capitalize">{prs.label}</Text>
            </Box>
            {pr.isShadowDecision && (
              <Box bg="rgba(251,191,36,0.1)" border="1px solid" borderColor="rgba(251,191,36,0.3)" borderRadius="full" px={2} py={0.5}>
                <Text fontSize="10px" fontWeight="700" color="#FBBF24" textTransform="uppercase">Not Escalated</Text>
              </Box>
            )}
            {pr.isConflict && (
              <Box bg="rgba(248,113,113,0.1)" border="1px solid" borderColor="rgba(248,113,113,0.3)" borderRadius="full" px={2} py={0.5}>
                <Text fontSize="10px" fontWeight="700" color="#F87171" textTransform="uppercase">Policy Conflict</Text>
              </Box>
            )}
          </HStack>
          <Text fontSize="md" fontWeight="800" color="text.primary" lineHeight="1.35" letterSpacing="-0.02em">
            {pr.title}
          </Text>
          <HStack mt={1.5} spacing={1.5}>
            <Icon as={FiGitBranch} boxSize={3} color="text.muted" />
            <Text fontSize="xs" color="text.muted" fontFamily="mono">
              {pr.branch} → {pr.targetBranch}
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton color="text.muted" _hover={{ bg: 'background.raised', color: 'text.primary' }} />

        <ModalBody pb={6}>
          <SimpleGrid columns={2} gap={4} mb={5}>
            <Box>
              <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">Author</Text>
              <HStack spacing={2}>
                <Avatar size="xs" name={author?.name} bg="brand.600" color="white" />
                <Box>
                  <Text fontSize="sm" fontWeight="600" color="text.primary">{author?.name}</Text>
                  <Text fontSize="xs" color="text.muted">{author?.role}</Text>
                </Box>
              </HStack>
            </Box>
            <Box>
              <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">Reviewers</Text>
              {reviewers.length > 0 ? (
                <HStack spacing={1}>
                  {reviewers.map(r => r && (
                    <Tooltip key={r.id} label={r.name} hasArrow>
                      <Avatar size="xs" name={r.name} bg="brand.700" color="white" />
                    </Tooltip>
                  ))}
                </HStack>
              ) : (
                <Text fontSize="xs" color="text.disabled" fontStyle="italic">No reviewers assigned</Text>
              )}
            </Box>
            <Box>
              <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">Changes</Text>
              <HStack spacing={3}>
                <Text fontSize="sm" color="#34D399" fontWeight="700">+{pr.additions}</Text>
                <Text fontSize="sm" color="#F87171" fontWeight="700">−{pr.deletions}</Text>
              </HStack>
            </Box>
            <Box>
              <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">Review Status</Text>
              <Box bg="background.raised" border="1px solid" borderColor="border.subtle" borderRadius="full" px={2.5} py={0.5} display="inline-flex">
                <Text fontSize="10px" fontWeight="700" color={rev.color}>{rev.label}</Text>
              </Box>
            </Box>
          </SimpleGrid>

          <Divider mb={4} borderColor="border.subtle" />

          <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">Description</Text>
          <Text fontSize="sm" color="text.secondary" whiteSpace="pre-wrap" lineHeight="1.7" mb={4}>
            {pr.description}
          </Text>

          {pr.linkedTickets.length > 0 && (
            <Box mb={4}>
              <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">
                Linked Jira Tickets
              </Text>
              <Flex gap={2} flexWrap="wrap">
                {pr.linkedTickets.map(t => (
                  <Box
                    key={t}
                    bg="rgba(167,139,250,0.1)"
                    border="1px solid"
                    borderColor="rgba(167,139,250,0.25)"
                    borderRadius="md"
                    px={2.5}
                    py={1}
                  >
                    <Text fontSize="xs" fontFamily="mono" color="#A78BFA" fontWeight="700">{t}</Text>
                  </Box>
                ))}
              </Flex>
            </Box>
          )}

          {pr.labels && (
            <Box mb={4}>
              <Text fontSize="10px" fontWeight="700" color="text.disabled" mb={2} textTransform="uppercase" letterSpacing="0.08em">Labels</Text>
              <Flex gap={2} flexWrap="wrap">
                {pr.labels.map(l => (
                  <Box
                    key={l}
                    bg="background.raised"
                    border="1px solid"
                    borderColor="border.subtle"
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                  >
                    <Text fontSize="xs" color="text.secondary" fontWeight="500">{l}</Text>
                  </Box>
                ))}
              </Flex>
            </Box>
          )}

          {pr.isShadowDecision && (
            <Box
              p={3}
              bg="rgba(251,191,36,0.07)"
              borderRadius="lg"
              border="1px solid"
              borderColor="rgba(251,191,36,0.22)"
              mb={3}
            >
              <Text fontSize="sm" fontWeight="700" color="#FBBF24" mb={1}>
                Not Escalated to Leadership
              </Text>
              <Text fontSize="xs" color="text.secondary" lineHeight="1.6">
                This PR was merged to production without CTO sign-off.
                Surfaced by AI Chief of Staff via cross-reference of Git activity and org policy data.
              </Text>
            </Box>
          )}

          {pr.isConflict && (
            <Box
              p={3}
              bg="rgba(248,113,113,0.07)"
              borderRadius="lg"
              border="1px solid"
              borderColor="rgba(248,113,113,0.22)"
            >
              <Text fontSize="sm" fontWeight="700" color="#F87171" mb={1}>
                Policy Conflict Detected
              </Text>
              <Text fontSize="xs" color="text.secondary" lineHeight="1.6">
                This PR conflicts with another active change or organizational policy.
                Review linked tickets for full context.
              </Text>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function GitPage() {
  const [selectedRepo, setSelectedRepo] = useState<string>('ALL');
  const [selectedPR, setSelectedPR]     = useState<PullRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const { isOpen, onOpen, onClose }     = useDisclosure();

  const shadowCount   = pullRequests.filter(p => p.isShadowDecision).length;
  const conflictCount = pullRequests.filter(p => p.isConflict).length;
  const openCount     = pullRequests.filter(p => p.status === 'open').length;
  const draftCount    = pullRequests.filter(p => p.status === 'draft').length;

  const filteredPRs = pullRequests.filter(p => {
    const matchRepo   = selectedRepo === 'ALL' || p.repoName === selectedRepo;
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchRepo && matchStatus;
  });

  function openPR(pr: PullRequest) {
    setSelectedPR(pr);
    onOpen();
  }

  const stats = [
    { label: 'Open PRs',             value: openCount,     color: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', icon: FiGitPullRequest },
    { label: 'Draft PRs',            value: draftCount,    color: '#71717A', bg: 'rgba(113,113,122,0.08)', border: 'rgba(113,113,122,0.2)', icon: FiGitBranch },
    { label: 'Policy Conflicts',     value: conflictCount, color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', icon: FiAlertTriangle },
    { label: 'Not Escalated to CTO', value: shadowCount,   color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)',  icon: FiCode },
  ];

  return (
    <AppLayout>
      <Box maxW="full">

        {/* Header */}
        <Flex justify="space-between" align="flex-start" mb={7}>
          <Box>
            <Heading size="lg" color="text.primary" fontWeight="800" letterSpacing="-0.03em">
              Git Activity
            </Heading>
            <Text color="text.muted" fontSize="sm" mt={1}>
              nexus-tech · 4 repositories · {pullRequests.length} pull requests
            </Text>
          </Box>
          <HStack spacing={3}>
            <Select
              size="sm"
              value={selectedRepo}
              onChange={e => setSelectedRepo(e.target.value)}
              w="200px"
              bg="background.raised"
              borderColor="border.subtle"
              color="text.primary"
              borderRadius="lg"
              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #8B5CF6' }}
            >
              <option value="ALL" style={{ background: '#18181F' }}>All Repositories</option>
              {gitRepos.map(r => (
                <option key={r.id} value={r.name} style={{ background: '#18181F' }}>{r.name}</option>
              ))}
            </Select>
            <Select
              size="sm"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              w="140px"
              bg="background.raised"
              borderColor="border.subtle"
              color="text.primary"
              borderRadius="lg"
              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #8B5CF6' }}
            >
              <option value="ALL"    style={{ background: '#18181F' }}>All PRs</option>
              <option value="open"   style={{ background: '#18181F' }}>Open</option>
              <option value="merged" style={{ background: '#18181F' }}>Merged</option>
              <option value="draft"  style={{ background: '#18181F' }}>Draft</option>
            </Select>
          </HStack>
        </Flex>

        {/* Unescalated PR Alert */}
        {shadowCount > 0 && (
          <Box
            mb={6}
            p={4}
            bg="rgba(96,165,250,0.07)"
            border="1px solid"
            borderColor="rgba(96,165,250,0.25)"
            borderRadius="xl"
          >
            <HStack spacing={2}>
              <Icon as={FiAlertTriangle} color="#60A5FA" boxSize={4} />
              <Text fontSize="sm" fontWeight="700" color="#60A5FA">
                {shadowCount} PRs merged without leadership visibility
              </Text>
              <Text fontSize="sm" color="text.secondary">
                — code reached production without CTO sign-off. Highlighted with colored borders below.
              </Text>
            </HStack>
          </Box>
        )}

        {/* Stats */}
        <SimpleGrid columns={4} spacing={4} mb={7}>
          {stats.map(s => (
            <Box
              key={s.label}
              bg={s.bg}
              border="1px solid"
              borderColor={s.border}
              borderRadius="xl"
              p={4}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0} left={0} right={0}
                h="2px"
                bg={`linear-gradient(to right, ${s.color}, transparent)`}
              />
              <HStack justify="space-between" align="flex-start">
                <Box>
                  <Text fontSize="xs" color="text.muted" mb={1} fontWeight="500">{s.label}</Text>
                  <Text fontSize="2xl" fontWeight="800" color={s.color} letterSpacing="-0.03em">{s.value}</Text>
                </Box>
                <Icon as={s.icon} boxSize={5} color={s.color} opacity={0.5} />
              </HStack>
            </Box>
          ))}
        </SimpleGrid>

        {/* Repositories */}
        <Text
          fontSize="xs"
          fontWeight="700"
          color="text.muted"
          textTransform="uppercase"
          letterSpacing="0.08em"
          mb={3}
        >
          Repositories
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3} mb={8}>
          {gitRepos.map(repo => {
            const repoPRs   = getPRsByRepo(repo.name);
            const shadowPRs = repoPRs.filter(p => p.isShadowDecision).length;
            const isActive  = selectedRepo === repo.name;
            return (
              <Box
                key={repo.id}
                bg={isActive ? 'background.raised' : 'background.surface'}
                border="1px solid"
                borderColor={shadowPRs > 0 ? 'rgba(251,191,36,0.25)' : isActive ? 'brand.600' : 'border.subtle'}
                borderRadius="xl"
                p={4}
                cursor="pointer"
                transition="all 0.16s ease"
                _hover={{
                  bg: 'background.raised',
                  borderColor: shadowPRs > 0 ? 'rgba(251,191,36,0.45)' : 'border.default',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
                onClick={() => setSelectedRepo(repo.name === selectedRepo ? 'ALL' : repo.name)}
                position="relative"
                overflow="hidden"
              >
                <Box
                  position="absolute"
                  top={0} left={0} right={0}
                  h="2px"
                  bg={shadowPRs > 0 ? 'linear-gradient(to right, #FBBF24, transparent)' : 'linear-gradient(to right, #A78BFA, transparent)'}
                />
                <Flex justify="space-between" align="flex-start" mb={2}>
                  <HStack spacing={1.5}>
                    <Icon as={FiCode} color="text.muted" boxSize={4} />
                    <Text fontWeight="700" fontSize="sm" color="semantic.decision">{repo.name}</Text>
                  </HStack>
                  {shadowPRs > 0 && (
                    <Box bg="rgba(251,191,36,0.1)" border="1px solid" borderColor="rgba(251,191,36,0.3)" borderRadius="full" px={2} py={0.5}>
                      <Text fontSize="9px" fontWeight="700" color="#FBBF24" textTransform="uppercase" letterSpacing="0.04em">
                        {shadowPRs} unescalated
                      </Text>
                    </Box>
                  )}
                </Flex>
                <Text fontSize="xs" color="text.muted" mb={3} lineHeight="1.5">{repo.description}</Text>
                <HStack justify="space-between" fontSize="xs" color="text.disabled">
                  <HStack spacing={1}>
                    <Icon as={FiGitPullRequest} boxSize={3} />
                    <Text>{repo.openPRs} open PRs</Text>
                  </HStack>
                  <HStack spacing={1}>
                    <Icon as={FiStar} boxSize={3} />
                    <Text>{repo.stars}</Text>
                  </HStack>
                </HStack>
                <Flex justify="space-between" align="center" mt={2}>
                  <Box bg="background.overlay" border="1px solid" borderColor="border.subtle" borderRadius="full" px={2} py={0.5}>
                    <Text fontSize="9px" color="text.disabled" fontWeight="600" textTransform="uppercase" letterSpacing="0.04em">
                      {repo.language}
                    </Text>
                  </Box>
                  <Text fontSize="xs" color="text.disabled">{repo.lastActivity}</Text>
                </Flex>
              </Box>
            );
          })}
        </SimpleGrid>

        {/* Pull Requests */}
        <Flex justify="space-between" align="center" mb={4}>
          <Text
            fontSize="xs"
            fontWeight="700"
            color="text.muted"
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            Pull Requests {selectedRepo !== 'ALL' && `· ${selectedRepo}`}
          </Text>
          <Text fontSize="xs" color="text.disabled">{filteredPRs.length} results</Text>
        </Flex>

        <VStack spacing={2.5} align="stretch">
          {filteredPRs.map(pr => (
            <PRCard key={pr.id} pr={pr} onClick={() => openPR(pr)} />
          ))}
        </VStack>

      </Box>

      <PRModal pr={selectedPR} isOpen={isOpen} onClose={onClose} />
    </AppLayout>
  );
}
