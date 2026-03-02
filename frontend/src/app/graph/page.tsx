'use client';

import {
  Box, Flex, Text, Heading, Badge, HStack, VStack,
  Icon, SimpleGrid, Divider,
} from '@chakra-ui/react';
import {
  FiUsers, FiGitPullRequest, FiAlertTriangle, FiCheckSquare,
  FiGitCommit, FiShield, FiPackage, FiActivity,
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';

// ─────────────────────────────────────────────────────────────
// Static stats (match the generated graph)
// ─────────────────────────────────────────────────────────────
const GRAPH_STATS = [
  { label: 'Nodes',         value: 48,  color: 'blue',   icon: FiActivity },
  { label: 'Relationships', value: 93,  color: 'purple', icon: FiGitCommit },
  { label: 'People',        value: 18,  color: 'teal',   icon: FiUsers },
  { label: 'JIRA Tickets',  value: 15,  color: 'blue',   icon: FiCheckSquare },
  { label: 'Pull Requests', value: 8,   color: 'green',  icon: FiGitPullRequest },
  { label: 'Projects',      value: 5,   color: 'purple', icon: FiPackage },
  { label: 'Conflicts',     value: 7,   color: 'red',    icon: FiAlertTriangle },
  { label: 'Not Escalated', value: 4,   color: 'orange', icon: FiShield },
];

const NODE_TYPES = [
  { label: 'Leadership',    color: '#9F7AEA', shape: 'circle',   desc: 'CTO, VP, Head of Product' },
  { label: 'Backend',       color: '#4299E1', shape: 'circle',   desc: 'Backend Platform team' },
  { label: 'Frontend',      color: '#48BB78', shape: 'circle',   desc: 'Frontend team' },
  { label: 'Infrastructure',color: '#F6AD55', shape: 'circle',   desc: 'DevOps & Infra team' },
  { label: 'Security',      color: '#FC8181', shape: 'circle',   desc: 'Security team' },
  { label: 'QA',            color: '#F6E05E', shape: 'circle',   desc: 'Quality Assurance team' },
  { label: 'Ticket (normal)',color: '#63B3ED', shape: 'square',  desc: 'Active JIRA ticket' },
  { label: 'Ticket (conflict)',color:'#FC8181',shape: 'square',  desc: 'Policy conflict detected' },
  { label: 'Ticket (not escalated)',color:'#F6AD55',shape:'square',desc:'Not escalated to CTO' },
  { label: 'PR Open',       color: '#68D391', shape: 'triangle', desc: 'Open pull request' },
  { label: 'PR Merged',     color: '#B794F4', shape: 'triangle', desc: 'Merged pull request' },
  { label: 'Policy',        color: '#6B46C1', shape: 'hexagon',  desc: 'Company policy/standard' },
  { label: 'Project',       color: '#4299E1', shape: 'ellipse',  desc: 'JIRA project / team scope' },
];

const EDGE_TYPES = [
  { label: 'REPORTS_TO',       color: '#334155', dash: false },
  { label: 'ASSIGNED_TO',      color: '#4299E1', dash: false },
  { label: 'AUTHORED_BY',      color: '#48BB78', dash: false },
  { label: 'REVIEWED_BY',      color: '#9AE6B4', dash: false },
  { label: 'VIOLATES',         color: '#FC8181', dash: true  },
  { label: 'CONFLICTS_WITH',   color: '#F56565', dash: false },
  { label: 'SUPPORTS',         color: '#9AE6B4', dash: false },
  { label: 'DEPENDS_ON',       color: '#F6AD55', dash: true  },
  { label: 'LINKED_TO',        color: '#475569', dash: true  },
  { label: 'PART_OF',          color: '#1E293B', dash: true  },
];

function ShapeIcon({ shape, color }: { shape: string; color: string }) {
  if (shape === 'circle')   return <Box w="10px" h="10px" borderRadius="full" bg={color} flexShrink={0} />;
  if (shape === 'square')   return <Box w="10px" h="10px" borderRadius="2px" bg={color} flexShrink={0} />;
  if (shape === 'hexagon')  return (
    <Box w="12px" h="10px" bg={color} flexShrink={0}
      style={{ clipPath: 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)' }} />
  );
  if (shape === 'ellipse')  return <Box w="14px" h="9px" borderRadius="full" bg={color} flexShrink={0} />;
  if (shape === 'triangle') return (
    <Box flexShrink={0}
      style={{ width:0, height:0,
               borderLeft:'5px solid transparent', borderRight:'5px solid transparent',
               borderBottom:`9px solid ${color}` }} />
  );
  return <Box w="10px" h="10px" bg={color} flexShrink={0} />;
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function GraphPage() {
  return (
    <AppLayout>
      <Box pb={8}>

        {/* ── Header ── */}
        <Flex justify="space-between" align="flex-start" mb={5} flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="lg" fontWeight="800" color="gray.900">Knowledge Graph</Heading>
            <Text color="gray.500" fontSize="sm" mt={0.5}>
              Force-directed organisational intelligence graph &bull; Nexus Technologies Q1 2026
            </Text>
          </Box>
          <HStack spacing={2} flexWrap="wrap">
            <Badge colorScheme="red" borderRadius="full" px={3} py={1} fontSize="xs">
              <HStack spacing={1.5}>
                <Icon as={FiAlertTriangle} boxSize={3} />
                <Text>7 conflicts detected</Text>
              </HStack>
            </Badge>
            <Badge colorScheme="orange" borderRadius="full" px={3} py={1} fontSize="xs">
              <HStack spacing={1.5}>
                <Icon as={FiAlertTriangle} boxSize={3} />
                <Text>4 not escalated to CTO</Text>
              </HStack>
            </Badge>
          </HStack>
        </Flex>

        {/* ── Stats row ── */}
        <SimpleGrid columns={{ base: 4, md: 8 }} gap={3} mb={5}>
          {GRAPH_STATS.map(s => (
            <Box
              key={s.label}
              bg="white"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="xl"
              p={3}
              textAlign="center"
              boxShadow="sm"
            >
              <Icon as={s.icon} color={`${s.color}.500`} boxSize={4} mb={1} />
              <Text fontSize="xl" fontWeight="800" color={`${s.color}.600`} lineHeight="1">{s.value}</Text>
              <Text fontSize="8px" color="gray.400" fontWeight="600" mt={0.5}
                    textTransform="uppercase" letterSpacing="wide" lineHeight="1.3">
                {s.label}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* ── Main: iframe + sidebar ── */}
        <Flex gap={4} align="flex-start">

          {/* Graph iframe */}
          <Box
            flex={1}
            minH="680px"
            borderRadius="2xl"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.200"
            boxShadow="0 4px 24px rgba(0,0,0,0.12)"
            bg="#0F172A"
          >
            <Box as="iframe"
              src="/knowledge_graph.html"
              w="100%"
              h="680px"
              border="none"
              title="Nexus Technologies Knowledge Graph"
            />
          </Box>

          {/* Right sidebar: legend */}
          <Box
            w="220px"
            flexShrink={0}
            display={{ base: 'none', xl: 'block' }}
          >
            {/* Node types */}
            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="xl"
              p={4}
              mb={3}
              boxShadow="sm"
            >
              <Text fontSize="xs" fontWeight="700" color="gray.400" mb={3}
                    textTransform="uppercase" letterSpacing="wider">
                Node Types
              </Text>
              <VStack spacing={1.5} align="stretch">
                {NODE_TYPES.map(n => (
                  <HStack key={n.label} spacing={2}>
                    <ShapeIcon shape={n.shape} color={n.color} />
                    <Box flex={1} minW={0}>
                      <Text fontSize="10px" color="gray.700" fontWeight="600" noOfLines={1}>{n.label}</Text>
                      <Text fontSize="9px" color="gray.400" noOfLines={1}>{n.desc}</Text>
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Edge types */}
            <Box
              bg="white"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="xl"
              p={4}
              boxShadow="sm"
            >
              <Text fontSize="xs" fontWeight="700" color="gray.400" mb={3}
                    textTransform="uppercase" letterSpacing="wider">
                Relationships
              </Text>
              <VStack spacing={1.5} align="stretch">
                {EDGE_TYPES.map(e => (
                  <HStack key={e.label} spacing={2}>
                    <Box
                      w="18px"
                      h="2px"
                      bg={e.color}
                      flexShrink={0}
                      style={e.dash ? {
                        background: 'none',
                        borderTop: `2px dashed ${e.color}`,
                        height: 0,
                      } : {}}
                    />
                    <Text fontSize="9px" color="gray.600" fontWeight="600"
                          fontFamily="mono">{e.label}</Text>
                  </HStack>
                ))}
              </VStack>

              <Divider my={3} />

              <Text fontSize="9px" color="gray.400" lineHeight="1.6">
                <b style={{ color: '#718096' }}>Controls:</b><br />
                Scroll — zoom in/out<br />
                Drag — pan canvas<br />
                Hover — node details<br />
                Drag node — reposition<br />
                Multi-select — Ctrl+click
              </Text>
            </Box>
          </Box>
        </Flex>

        {/* ── Story context ── */}
        <Box
          mt={5}
          bg="white"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="xl"
          p={5}
          boxShadow="sm"
        >
          <Text fontSize="xs" fontWeight="700" color="gray.400" mb={3}
                textTransform="uppercase" letterSpacing="wider">
            What the Graph Reveals
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            {[
              {
                title: 'Security Policy Violation',
                color: 'red',
                text: 'SEC-STD-012 mandated OAuth 2.0 for all APIs. Tickets WEB-045, WEB-046, WEB-047 and their PRs all show VIOLATES → pol-001 edges — 3 production endpoints deployed with Basic Auth.',
              },
              {
                title: 'Redis vs Memcached Conflict',
                color: 'orange',
                text: 'Backend (Alice) and Infrastructure (Bob) made conflicting technology decisions. CORE-078 proposes Redis while INFRA-023 recommends Memcached — both active, blocking the migration chain.',
              },
              {
                title: 'Hidden Remediation in Progress',
                color: 'yellow',
                text: 'Jack Williams opened WEB-051 / PR #294 (draft) to fix the auth violation but has not linked it to SEC-007, not informed Irene (Security Lead), and not escalated to Grace (CTO).',
              },
            ].map(i => (
              <Box
                key={i.title}
                bg={`${i.color}.50`}
                border="1px solid"
                borderColor={`${i.color}.200`}
                borderRadius="lg"
                p={4}
              >
                <HStack mb={2} spacing={2}>
                  <Icon as={FiAlertTriangle} color={`${i.color}.500`} boxSize={4} />
                  <Text fontSize="sm" fontWeight="700" color={`${i.color}.800`}>{i.title}</Text>
                </HStack>
                <Text fontSize="xs" color={`${i.color}.700`} lineHeight="1.7">{i.text}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

      </Box>
    </AppLayout>
  );
}
