'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box, 
  Heading, 
  Text, 
  Flex, 
  Card, 
  CardBody, 
  SimpleGrid,
  Badge, 
  Button,
  HStack,
  VStack,
  Divider,
  Icon,
  Tag,
  TagLabel,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import {
  FiAlertCircle,
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiFilter,
  FiInfo,
  FiPlus,
  FiUsers,
  FiTrendingUp,
  FiPieChart,
} from 'react-icons/fi';
import AppLayout from '@/components/layout/AppLayout';

// Sample shadow topics data
const mockShadowTopics = [
  {
    id: 'shadow-001',
    name: 'SOC 2 Audit Readiness',
    score: 96,
    status: 'emerging',
    age: 19, // days until audit
    teamsInvolved: ['Security Team', 'Backend Platform', 'Leadership'],
    supportingEvents: [
      {
        id: 'event-001',
        type: 'slack',
        sender: 'Marcus Webb',
        content: 'Has anyone checked if our rate limiting controls are documented for the audit? March 20 is coming fast.',
        timestamp: '2026-02-24T10:30:00Z'
      },
      {
        id: 'event-002',
        type: 'email',
        sender: 'Irene Garcia',
        content: 'SOC 2 auditors flagged absence of rate limiting as a control gap. We need SEC-011 closed before the 20th.',
        timestamp: '2026-02-25T15:45:00Z'
      },
      {
        id: 'event-003',
        type: 'slack',
        sender: 'Carlos Rodriguez',
        content: 'Are we collecting audit evidence for the auth endpoints? SEC-007 is still open.',
        timestamp: '2026-02-26T14:30:00Z'
      },
      {
        id: 'event-004',
        type: 'email',
        sender: 'Irene Garcia',
        content: 'No formal readiness checklist exists. Audit is 19 days away and Grace hasn\'t been briefed on the gaps.',
        timestamp: '2026-02-27T09:15:00Z'
      }
    ],
    keywords: ['SOC 2', 'audit', 'compliance', 'controls', 'March 20', 'rate limiting', 'SEC-007', 'evidence'],
    insight: 'SOC 2 Type II audit is 19 days away. Security team is flagging control gaps in Slack DMs — no formal readiness checklist, no DRI assigned, and CTO has not been briefed on the risk.',
    recommendation: 'Create a formal SOC 2 readiness taskforce immediately. Assign Irene Garcia as DRI. Close SEC-007 and SEC-011 before March 15th.'
  },
  {
    id: 'shadow-002',
    name: 'Infra Change Approval Process',
    score: 87,
    status: 'implicit policy',
    age: 30, // days
    teamsInvolved: ['Backend Team', 'Infra Team', 'Security Team'],
    supportingEvents: [
      {
        id: 'event-005',
        type: 'slack',
        sender: 'Dave Johnson',
        content: 'We usually get CTO approval for infra changes.',
        timestamp: '2023-08-15T11:20:00Z'
      },
      {
        id: 'event-006',
        type: 'email',
        sender: 'Emma Wilson',
        content: 'Did we get sign-off for the load balancer change?',
        timestamp: '2023-08-18T14:30:00Z'
      },
      {
        id: 'event-007',
        type: 'meeting',
        sender: 'Team Meeting',
        content: 'Infra changes need approval, right?',
        timestamp: '2023-08-25T10:00:00Z'
      }
    ],
    keywords: ['approval', 'sign-off', 'process', 'changes', 'infrastructure'],
    insight: 'There appears to be an undocumented policy about infra change approval that multiple teams follow.',
    recommendation: 'Document this policy formally and establish clear ownership.'
  },
  {
    id: 'shadow-003',
    name: 'Caching Ownership',
    score: 78,
    status: 'ownership ambiguity',
    age: 7, // days
    teamsInvolved: ['Backend Team', 'Infra Team'],
    supportingEvents: [
      {
        id: 'event-008',
        type: 'slack',
        sender: 'Alice Chen',
        content: 'Infra should fix caching.',
        timestamp: '2023-09-06T13:45:00Z'
      },
      {
        id: 'event-009',
        type: 'slack',
        sender: 'Bob Smith',
        content: 'Backend owns caching config.',
        timestamp: '2023-09-06T14:00:00Z'
      },
      {
        id: 'event-010',
        type: 'email',
        sender: 'Carol Jones',
        content: 'Who owns caching?',
        timestamp: '2023-09-07T09:30:00Z'
      }
    ],
    keywords: ['caching', 'ownership', 'responsibility', 'owns'],
    insight: 'There is confusion about which team is responsible for caching configuration and maintenance.',
    recommendation: 'Clearly define ownership boundaries between Backend and Infra teams for caching.'
  },
  {
    id: 'shadow-004',
    name: 'Test Environment Stability',
    score: 65,
    status: 'emerging',
    age: 5, // days
    teamsInvolved: ['QA Team', 'Infra Team', 'Backend Team'],
    supportingEvents: [
      {
        id: 'event-011',
        type: 'slack',
        sender: 'Frank Lee',
        content: 'Test env is down again.',
        timestamp: '2023-09-08T10:15:00Z'
      },
      {
        id: 'event-012',
        type: 'email',
        sender: 'Grace Chen',
        content: 'We need more reliable test environments for the release.',
        timestamp: '2023-09-09T11:30:00Z'
      }
    ],
    keywords: ['test', 'environment', 'stability', 'reliable', 'down'],
    insight: 'Test environment instability is affecting multiple teams but hasn\'t been formally addressed.',
    recommendation: 'Create a task force to improve test environment reliability.'
  }
];

// Status color mapping
const statusColorMap: Record<string, string> = {
  'emerging': 'blue',
  'escalating': 'orange',
  'implicit policy': 'purple',
  'ownership ambiguity': 'red'
};

// Shadow topic score color mapping
const getScoreColor = (score: number) => {
  if (score >= 90) return 'red';
  if (score >= 75) return 'orange';
  if (score >= 50) return 'yellow';
  return 'blue';
};

export default function ShadowTopicsPage() {
  const [shadowTopics, setShadowTopics] = useState(mockShadowTopics);
  const [filter, setFilter] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Filter shadow topics
  const filteredTopics = filter === 'all' 
    ? shadowTopics 
    : shadowTopics.filter(topic => topic.status === filter);
    
  // Statistics
  const stats = {
    totalTopics: shadowTopics.length,
    totalKeywords: shadowTopics.reduce((acc, topic) => acc + topic.keywords.length, 0),
    avgScore: shadowTopics.reduce((acc, topic) => acc + topic.score, 0) / shadowTopics.length,
    crossTeamCount: shadowTopics.filter(topic => topic.teamsInvolved.length > 1).length,
    highPriorityCount: shadowTopics.filter(topic => topic.score >= 80).length
  };

  const handleViewDetails = (topic: any) => {
    setSelectedTopic(topic);
    onOpen();
  };


  return (
    <AppLayout>
      <Box as="main" p={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" mb={2}>Shadow Topics Dashboard</Heading>
            <Text color="gray.600">
              Detect and manage emergent topics from organizational communications
            </Text>
          </Box>
          <HStack>
            <Icon as={FiFilter} color="gray.500" />
            <Select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
              w="180px"
              size="sm"
            >
              <option value="all">All shadow topics</option>
              <option value="emerging">Emerging</option>
              <option value="escalating">Escalating</option>
              <option value="implicit policy">Implicit Policies</option>
              <option value="ownership ambiguity">Ownership Ambiguity</option>
            </Select>
          </HStack>
        </Flex>

        {/* Stats cards */}
        <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} mb={6}>
          <Stat bg="#1A202C" p={4} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor="#2D3748">
            <StatLabel color="#E2E8F0" fontSize="sm" fontWeight="medium">Shadow Topics</StatLabel>
            <Flex align="center" mt={1}>
              <StatNumber color="#F7FAFC" fontSize="2xl">{stats.totalTopics}</StatNumber>
              <Icon as={FiPieChart} ml={3} color="blue.400" boxSize={5} />
            </Flex>
          </Stat>
          <Stat bg="#1A202C" p={4} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor="#2D3748">
            <StatLabel color="#E2E8F0" fontSize="sm" fontWeight="medium">Avg. Topic Score</StatLabel>
            <Flex align="center" mt={1}>
              <StatNumber color="#F7FAFC" fontSize="2xl">{Math.round(stats.avgScore)}</StatNumber>
              <Icon as={FiBarChart2} ml={3} color="orange.400" boxSize={5} />
            </Flex>
          </Stat>
          <Stat bg="#1A202C" p={4} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor="#2D3748">
            <StatLabel color="#E2E8F0" fontSize="sm" fontWeight="medium">High Priority</StatLabel>
            <Flex align="center" mt={1}>
              <StatNumber color="#F7FAFC" fontSize="2xl">{stats.highPriorityCount}</StatNumber>
              <Icon as={FiAlertCircle} ml={3} color="red.400" boxSize={5} />
            </Flex>
          </Stat>
          <Stat bg="#1A202C" p={4} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor="#2D3748">
            <StatLabel color="#E2E8F0" fontSize="sm" fontWeight="medium">Cross-Team Topics</StatLabel>
            <Flex align="center" mt={1}>
              <StatNumber color="#F7FAFC" fontSize="2xl">{stats.crossTeamCount}</StatNumber>
              <Icon as={FiUsers} ml={3} color="purple.400" boxSize={5} />
            </Flex>
          </Stat>
          <Stat bg="#1A202C" p={4} borderRadius="lg" boxShadow="sm" borderWidth="1px" borderColor="#2D3748">
            <StatLabel color="#E2E8F0" fontSize="sm" fontWeight="medium">Total Keywords</StatLabel>
            <Flex align="center" mt={1}>
              <StatNumber color="#F7FAFC" fontSize="2xl">{stats.totalKeywords}</StatNumber>
              <Icon as={FiActivity} ml={3} color="green.400" boxSize={5} />
            </Flex>
          </Stat>
        </SimpleGrid>
        
        {/* Info alert */}
        <Box
          bg="#2D3748"
          p={4}
          mb={6}
          borderRadius="lg"
          borderLeft="4px solid #4299E1"
        >
          <Flex>
            <Icon as={FiInfo} color="#4299E1" boxSize={5} mt={1} mr={3} />
            <Box>
              <Text fontWeight="bold" color="#F7FAFC" fontSize="md" mb={1}>Shadow Topics Explained</Text>
              <Text color="#E2E8F0">Shadow topics emerge bottom-up from communication rather than top-down from org charts. They represent concepts that keep reappearing across teams without formal recognition.</Text>
            </Box>
          </Flex>
        </Box>

        <Box>
            {filteredTopics.length > 0 ? (
              <VStack spacing={4} align="stretch">
                {filteredTopics.map((topic) => (
                  <Card key={topic.id} bg="#1A202C" variant="outline" borderRadius="lg" borderWidth="1px" borderColor="#2D3748">
                    <CardBody>
                      <HStack justify="space-between" mb={3}>
                        <VStack align="start" spacing={1}>
                          <Heading size="md" color="#F7FAFC" fontWeight="semibold">{topic.name}</Heading>
                          <Badge
                            colorScheme={statusColorMap[topic.status]}
                            borderRadius="full"
                            px={2}
                            py={0.5}
                            fontWeight="medium"
                          >
                            {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
                          </Badge>
                        </VStack>
                        <Box
                          bg={getScoreColor(topic.score)}
                          color="white"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontWeight="bold"
                          fontSize="sm"
                        >
                          Score: {topic.score}
                        </Box>
                      </HStack>
                      
                      <HStack spacing={3} mb={3} flexWrap="wrap">
                        <Text fontSize="sm" color="#A0AEC0" mr={1}>
                          <Icon as={FiCalendar} mr={1} color="#718096" /> {topic.age} days
                        </Text>
                        <Text fontSize="sm" color="#A0AEC0" mr={1}>
                          <Icon as={FiUsers} mr={1} color="#718096" /> {topic.teamsInvolved.length} teams
                        </Text>
                        <Text fontSize="sm" color="#A0AEC0">
                          <Icon as={FiActivity} mr={1} color="#718096" /> {topic.supportingEvents.length} events
                        </Text>
                      </HStack>
                      
                      <HStack spacing={2} mb={3} flexWrap="wrap">
                        {topic.teamsInvolved.map((team, index) => (
                          <Tag key={index} size="sm" borderRadius="full" colorScheme="blue" mb={1} variant="subtle">
                            <TagLabel fontWeight="medium">{team}</TagLabel>
                          </Tag>
                        ))}
                      </HStack>
                      
                      <Divider borderColor="#2D3748" mb={3} />
                      
                      <Flex justify="space-between" align="center">
                        <Box flex="1">
                          <Text fontSize="sm" fontWeight="medium" mb={1} color="#E2E8F0">Topic strength:</Text>
                          <Progress
                            value={topic.score}
                            colorScheme={getScoreColor(topic.score)}
                            size="sm"
                            borderRadius="full"
                            bg="#2D3748"
                          />
                        </Box>
                        <Button
                          size="sm"
                          ml={4}
                          onClick={() => handleViewDetails(topic)}
                          colorScheme="blue"
                          fontWeight="medium"
                        >
                          View Details
                        </Button>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            ) : (
              <Box 
                p={8} 
                bg="gray.50" 
                borderRadius="lg" 
                textAlign="center"
                border="1px dashed"
                borderColor="gray.200"
              >
                <Icon as={FiInfo} boxSize={10} color="blue.400" mb={4} />
                <Heading size="md" mb={2}>No shadow topics found</Heading>
                <Text mb={4}>There are no shadow topics matching your current filter.</Text>
                <Button size="sm" onClick={() => setFilter('all')}>Show All Topics</Button>
              </Box>
            )}
        </Box>
        
        {/* Topic Detail Modal */}
        {selectedTopic && (
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <Flex align="center" justify="space-between">
                  <Heading size="md">{selectedTopic.name}</Heading>
                  <Badge 
                    colorScheme={statusColorMap[selectedTopic.status]} 
                    borderRadius="full" 
                    px={2}
                  >
                    {selectedTopic.status.charAt(0).toUpperCase() + selectedTopic.status.slice(1)}
                  </Badge>
                </Flex>
              </ModalHeader>
              <ModalCloseButton />
              
              <ModalBody>
                <Tabs variant="enclosed" colorScheme="blue">
                  <TabList>
                    <Tab>Overview</Tab>
                    <Tab>Supporting Evidence</Tab>
                    <Tab>Analysis</Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel>
                      <VStack align="stretch" spacing={4}>
                        {/* Topic Score */}
                        <Box mb={2}>
                          <Text fontWeight="bold" mb={1}>Shadow Topic Score: {selectedTopic.score}</Text>
                          <Flex justify="space-between" mb={1}>
                            <Text fontSize="xs" color="#A0AEC0">Low</Text>
                            <Text fontSize="xs" color="#A0AEC0">High</Text>
                          </Flex>
                          <Progress
                            value={selectedTopic.score}
                            size="md"
                            colorScheme={getScoreColor(selectedTopic.score)}
                            borderRadius="md"
                          />
                          <Text fontSize="sm" color="#A0AEC0" mt={1}>
                            Score is calculated based on frequency, cross-team mentions,
                            time period, and absence of formal documentation.
                          </Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" mb={1}>Topic Age</Text>
                          <Text>{selectedTopic.age} days since first mention</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" mb={1}>Teams Involved</Text>
                          <Flex wrap="wrap" gap={2}>
                            {selectedTopic.teamsInvolved.map((team: string, index: number) => (
                              <Tag key={index} colorScheme="blue" borderRadius="full">
                                <TagLabel>{team}</TagLabel>
                              </Tag>
                            ))}
                          </Flex>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" mb={1}>Keywords</Text>
                          <Flex wrap="wrap" gap={2}>
                            {selectedTopic.keywords.map((keyword: string, index: number) => (
                              <Tag key={index} colorScheme="gray" borderRadius="full" size="sm">
                                <TagLabel>{keyword}</TagLabel>
                              </Tag>
                            ))}
                          </Flex>
                        </Box>
                        
                        <Box p={3} bg="#2C5282" borderRadius="md">
                          <Text fontWeight="bold" color="#BEE3F8" mb={1}>AI Insight</Text>
                          <Text color="#E2E8F0">{selectedTopic.insight}</Text>
                        </Box>
                        
                        <Box p={3} bg="#22543D" borderRadius="md">
                          <Text fontWeight="bold" color="#9AE6B4" mb={1}>Recommendation</Text>
                          <Text color="#E2E8F0">{selectedTopic.recommendation}</Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                    
                    <TabPanel>
                      <Text fontWeight="bold" mb={2} color="#F7FAFC">
                        Supporting Events ({selectedTopic.supportingEvents.length})
                      </Text>
                      
                      <Table variant="simple" size="sm" colorScheme="whiteAlpha">
                        <Thead>
                          <Tr>
                            <Th>Source</Th>
                            <Th>Sender</Th>
                            <Th>Content</Th>
                            <Th>Date</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {selectedTopic.supportingEvents.map((event: any, index: number) => (
                            <Tr key={index}>
                              <Td>
                                <Badge variant="outline">{event.type}</Badge>
                              </Td>
                              <Td>{event.sender}</Td>
                              <Td>{event.content}</Td>
                              <Td>{new Date(event.timestamp).toLocaleDateString()}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TabPanel>
                    
                    <TabPanel>
                      <VStack align="stretch" spacing={4}>
                        <Box>
                          <Heading size="sm" mb={2} color="#F7FAFC">Topic Emergence Analysis</Heading>
                          <Text mb={2} color="#E2E8F0">
                            This topic has emerged organically through {selectedTopic.supportingEvents.length} separate 
                            communications across {selectedTopic.teamsInvolved.length} teams over {selectedTopic.age} days.
                          </Text>
                          <Text color="#E2E8F0">
                            The system detected this as a shadow topic because it shows consistent activity without
                            any formal documentation, assigned owner, or explicit decision.
                          </Text>
                        </Box>
                        
                        <Box>
                          <Heading size="sm" mb={2} color="#F7FAFC">Impact Assessment</Heading>
                          <Text color="#E2E8F0">
                            Topics with high shadow scores (like this one at {selectedTopic.score}) often represent 
                            undocumented organizational knowledge that affects decision making, creates ambiguity,
                            or leads to misalignment between teams.
                          </Text>
                        </Box>
                        
                        <Card variant="outline" bg="#1A202C" borderColor="#2D3748">
                          <CardBody>
                            <Heading size="sm" mb={3} color="#F7FAFC">Suggested Actions</Heading>
                            <VStack align="start" spacing={2}>
                              <Button size="sm" colorScheme="blue" leftIcon={<FiPlus />} w="full" justifyContent="start">
                                Create Formal Topic
                              </Button>
                              <Button size="sm" leftIcon={<FiUsers />} w="full" justifyContent="start">
                                Assign Topic Owner
                              </Button>
                              <Button size="sm" leftIcon={<FiTrendingUp />} w="full" justifyContent="start">
                                Track as Initiative
                              </Button>
                            </VStack>
                          </CardBody>
                        </Card>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </ModalBody>
              
              <ModalFooter borderTopWidth="1px" borderColor="#2D3748">
                <Button variant="outline" mr={3} onClick={onClose} color="#E2E8F0">
                  Close
                </Button>
                <Button colorScheme="blue">
                  Take Action
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Box>
    </AppLayout>
  );
}