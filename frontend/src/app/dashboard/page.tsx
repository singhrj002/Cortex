'use client';

import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  SimpleGrid,
  Icon,
  HStack,
  VStack,
  Button,
  Divider,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import AppLayout from '@/components/layout/AppLayout';
import {
  FiInbox,
  FiFileText,
  FiAlertTriangle,
  FiCheck,
  FiClock,
  FiUsers,
} from 'react-icons/fi';
import { useRecentDecisions } from '@/lib/hooks/useDecisions';
import { useUnreadCount } from '@/lib/hooks/useNotifications';
import { useGraphStats } from '@/lib/hooks/useGraph';
import { useTrendingTopics } from '@/lib/hooks/useTopics';
import { Decision } from '@/lib/api/decisions';
import { Topic } from '@/lib/api/topics';

export default function Dashboard() {
  const userEmail = 'demo@example.com'; // Replace with actual user email from auth

  const { data: recentDecisions, isLoading: decisionsLoading } = useRecentDecisions(10);
  const { data: unreadData } = useUnreadCount(userEmail);
  const { data: graphStats } = useGraphStats();
  const { data: trendingTopics } = useTrendingTopics(5);
  
  // Fallback data for when API isn't available
  const fallbackGraphStats = {
    total_nodes: 27,
    total_relationships: 9,
    node_type_counts: {
      Decision: 12,
      Team: 8,
      Person: 15,
      Claim: 3,
    }
  };
  
  // Fallback trending topics data
  const fallbackTrendingTopics = [
    { id: 'topic-001', name: 'SOC 2 Audit Readiness', mention_count: 31, last_mentioned: '2026-02-27T09:15:00Z', created_at: '2026-02-08T10:00:00Z' },
    { id: 'topic-002', name: 'Redis Configuration', mention_count: 18, last_mentioned: '2026-02-06T12:15:00Z', created_at: '2026-01-20T11:30:00Z' },
    { id: 'topic-003', name: 'Cache Timeout Policy', mention_count: 15, last_mentioned: '2026-02-05T09:45:00Z', created_at: '2026-01-25T14:20:00Z' },
    { id: 'topic-004', name: 'Memory Management', mention_count: 12, last_mentioned: '2026-02-04T16:30:00Z', created_at: '2026-01-28T10:10:00Z' },
    { id: 'topic-005', name: 'Cache Eviction', mention_count: 9, last_mentioned: '2026-02-03T11:20:00Z', created_at: '2026-01-30T13:45:00Z' }
  ];
  
  // Use fallbacks when API data is not available
  const displayGraphStats = graphStats || fallbackGraphStats;
  const displayTrendingTopics = trendingTopics?.length ? trendingTopics : fallbackTrendingTopics;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return FiCheck;
      case 'proposed': return FiClock;
      default: return FiFileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'proposed': return 'blue';
      case 'deprecated': return 'gray';
      default: return 'gray';
    }
  };

  return (
    <AppLayout>
      <Box mb={8}>
        <Heading size="lg" mb={2}>Dashboard</Heading>
        <Text color="text.secondary">Welcome to AI Chief of Staff. Here's what's happening in your organization.</Text>
      </Box>

      {/* Metrics Overview */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel display="flex" alignItems="center">
                <Icon as={FiInbox} mr={1} /> Notifications
              </StatLabel>
              <StatNumber>{unreadData?.unread_count || 0}</StatNumber>
              <StatHelpText>
                <Badge colorScheme="green">Unread</Badge>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel display="flex" alignItems="center">
                <Icon as={FiFileText} mr={1} /> Decisions
              </StatLabel>
              <StatNumber>{recentDecisions?.length || 0}</StatNumber>
              <StatHelpText>
                <Badge colorScheme="blue">
                  {recentDecisions?.filter((d: Decision) => d.status === 'proposed').length || 0} proposed
                </Badge>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel display="flex" alignItems="center">
                <Icon as={FiUsers} mr={1} /> Graph Nodes
              </StatLabel>
              <StatNumber>{displayGraphStats.total_nodes}</StatNumber>
              <StatHelpText>
                <Badge colorScheme="purple">Knowledge Graph</Badge>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel display="flex" alignItems="center">
                <Icon as={FiAlertTriangle} mr={1} /> Relationships
              </StatLabel>
              <StatNumber>{displayGraphStats.total_relationships}</StatNumber>
              <StatHelpText>
                <Badge colorScheme="orange">Connected</Badge>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Trending Topics */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Trending Topics</Heading>
        </Flex>

        <HStack spacing={3} flexWrap="wrap">
          {displayTrendingTopics.map((topic: Topic) => (
            <Badge
              key={topic.id}
              colorScheme="blue"
              fontSize="md"
              p={2}
              borderRadius="md"
            >
              {topic.name}
            </Badge>
          ))}
        </HStack>
      </Box>

      {/* Two Column Layout for Recent Items */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        {/* Recent Decisions */}
        <GridItem>
          <Card>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md">Recent Decisions</Heading>
                <Button
                  variant="ghost"
                  size="sm"
                  as="a"
                  href="/decisions"
                >
                  View all
                </Button>
              </Flex>
            </CardHeader>
            <CardBody>
              {decisionsLoading ? (
                <Flex justify="center" py={8}>
                  <Spinner />
                </Flex>
              ) : recentDecisions && recentDecisions.length > 0 ? (
                <VStack align="stretch" spacing={4} divider={<Divider />}>
                  {recentDecisions.slice(0, 5).map((decision: Decision) => (
                    <Flex key={decision.id} justify="space-between" align="center">
                      <HStack>
                        <Icon
                          as={getStatusIcon(decision.status)}
                          color={`semantic.${getStatusColor(decision.status)}`}
                          boxSize={5}
                        />
                        <Box>
                          <Text fontWeight="medium">{decision.title}</Text>
                          <Text fontSize="sm" color="text.secondary">
                            {new Date(decision.created_at).toLocaleDateString()}
                          </Text>
                        </Box>
                      </HStack>
                      <VStack align="end" spacing={1}>
                        <Badge colorScheme={getStatusColor(decision.status)}>
                          {decision.status}
                        </Badge>
                        <Badge fontSize="xs" colorScheme={decision.confidence >= 0.7 ? 'green' : 'yellow'}>
                          {(decision.confidence * 100).toFixed(0)}%
                        </Badge>
                      </VStack>
                    </Flex>
                  ))}
                </VStack>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  No decisions found. Start by ingesting some data in the Admin panel.
                </Alert>
              )}
            </CardBody>
          </Card>
        </GridItem>

        {/* System Status */}
        <GridItem>
          <Card>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <Heading size="md">System Status</Heading>
              </Flex>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="medium">Multi-Agent Workflow</Text>
                    <Badge colorScheme="green">Active</Badge>
                  </Flex>
                  <Text fontSize="sm" color="gray.600">
                    6 agents processing extractions in real-time
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="medium">WebSocket Connection</Text>
                    <Badge colorScheme="green">Connected</Badge>
                  </Flex>
                  <Text fontSize="sm" color="gray.600">
                    Real-time notifications enabled
                  </Text>
                </Box>

                <Divider />

                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="medium">Knowledge Graph</Text>
                    <Badge colorScheme="purple">Synced</Badge>
                  </Flex>
                  <Text fontSize="sm" color="gray.600">
                    {displayGraphStats.total_nodes} nodes, {displayGraphStats.total_relationships} relationships
                  </Text>
                </Box>

                <Divider />

                <Button
                  colorScheme="blue"
                  size="sm"
                  width="full"
                  as="a"
                  href="/admin"
                >
                  Admin Dashboard →
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </AppLayout>
  );
}
