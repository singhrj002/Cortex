'use client';

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Progress,
  Code,
} from '@chakra-ui/react';
import { useIngestEnronData, useTriggerBatchExtraction } from '@/lib/hooks/useEvents';
import { useGraphStats, useSyncToGraph } from '@/lib/hooks/useGraph';
import { useState } from 'react';

export default function AdminPage() {
  const [enronPath, setEnronPath] = useState('/path/to/enron/maildir');
  const [enronLimit, setEnronLimit] = useState(100);

  const ingestMutation = useIngestEnronData();
  const syncMutation = useSyncToGraph();
  const { data: graphStats, refetch: refetchGraphStats } = useGraphStats();
  const toast = useToast();

  const handleIngestEnron = async () => {
    try {
      const result = await ingestMutation.mutateAsync({ path: enronPath, limit: enronLimit });
      toast({
        title: 'Ingestion complete',
        description: `Processed ${result.stats.total_processed} emails, created ${result.stats.persons_created} persons`,
        status: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: 'Ingestion failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSyncDecisions = async () => {
    try {
      const result = await syncMutation.mutateAsync({ entityType: 'decision' });
      toast({
        title: 'Sync complete',
        description: `Synced ${result.synced} decisions to Neo4j`,
        status: 'success',
        duration: 5000,
      });
      refetchGraphStats();
    } catch (error: any) {
      toast({
        title: 'Sync failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSyncAll = async () => {
    try {
      for (const entityType of ['decision', 'task', 'claim', 'person']) {
        await syncMutation.mutateAsync({ entityType });
      }
      toast({
        title: 'Full sync complete',
        description: 'All entities synced to Neo4j',
        status: 'success',
        duration: 5000,
      });
      refetchGraphStats();
    } catch (error: any) {
      toast({
        title: 'Sync failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box p={8}>
      <VStack align="stretch" spacing={8}>
        <Heading size="xl">Admin Dashboard</Heading>

        <Alert status="warning">
          <AlertIcon />
          Administrative functions - use with caution!
        </Alert>

        {/* Graph Statistics */}
        <Card>
          <CardHeader>
            <Heading size="md">Knowledge Graph Statistics</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={[1, 2, 4]} spacing={4}>
              <Stat>
                <StatLabel>Total Nodes</StatLabel>
                <StatNumber>{graphStats?.total_nodes || 0}</StatNumber>
                <StatHelpText>All entities</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Total Relationships</StatLabel>
                <StatNumber>{graphStats?.total_relationships || 0}</StatNumber>
                <StatHelpText>All connections</StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Decisions</StatLabel>
                <StatNumber>{graphStats?.node_type_counts?.Decision || 0}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>People</StatLabel>
                <StatNumber>{graphStats?.node_type_counts?.Person || 0}</StatNumber>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Data Ingestion */}
        <Card>
          <CardHeader>
            <Heading size="md">Enron Dataset Ingestion</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Text color="gray.600">
                Ingest emails from the Enron dataset into the system for processing.
              </Text>

              <FormControl>
                <FormLabel>Dataset Path</FormLabel>
                <Input
                  value={enronPath}
                  onChange={(e) => setEnronPath(e.target.value)}
                  placeholder="/path/to/enron/maildir"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Limit (emails to process)</FormLabel>
                <Input
                  type="number"
                  value={enronLimit}
                  onChange={(e) => setEnronLimit(Number(e.target.value))}
                  placeholder="100"
                />
              </FormControl>

              {ingestMutation.isPending && (
                <Progress size="xs" isIndeterminate />
              )}

              {ingestMutation.data && (
                <Alert status="success">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">Ingestion Complete</Text>
                    <Code>Processed: {ingestMutation.data.stats.total_processed}</Code>
                    <Code>Saved: {ingestMutation.data.stats.total_saved}</Code>
                    <Code>Duplicates: {ingestMutation.data.stats.total_duplicates}</Code>
                    <Code>Persons Created: {ingestMutation.data.stats.persons_created}</Code>
                  </VStack>
                </Alert>
              )}

              <Button
                colorScheme="blue"
                onClick={handleIngestEnron}
                isLoading={ingestMutation.isPending}
                loadingText="Ingesting..."
              >
                Start Ingestion
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Graph Synchronization */}
        <Card>
          <CardHeader>
            <Heading size="md">Neo4j Graph Synchronization</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Text color="gray.600">
                Sync extracted entities from PostgreSQL to Neo4j knowledge graph.
              </Text>

              <HStack>
                <Button
                  colorScheme="green"
                  onClick={handleSyncDecisions}
                  isLoading={syncMutation.isPending}
                >
                  Sync Decisions
                </Button>

                <Button
                  colorScheme="purple"
                  onClick={handleSyncAll}
                  isLoading={syncMutation.isPending}
                >
                  Sync All Entities
                </Button>
              </HStack>

              {syncMutation.data && (
                <Alert status="success">
                  <AlertIcon />
                  Synced {syncMutation.data.synced} entities ({syncMutation.data.errors} errors)
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Extraction Workflow */}
        <Card>
          <CardHeader>
            <Heading size="md">Extraction Workflow</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Text color="gray.600">
                The LangGraph multi-agent workflow runs automatically when events are ingested.
                It processes each email through:
              </Text>

              <VStack align="start" pl={4} spacing={2}>
                <Text>1. <strong>Memory Agent</strong> - Retrieves context</Text>
                <Text>2. <strong>Extractor Agent</strong> - Extracts decisions, tasks, claims</Text>
                <Text>3. <strong>Critic Agent</strong> - Validates quality</Text>
                <Text>4. <strong>Conflict Detector</strong> - Finds contradictions</Text>
                <Text>5. <strong>Coordinator Agent</strong> - Determines routing</Text>
                <Text>6. <strong>Summarizer Agent</strong> - Generates summaries</Text>
              </VStack>

              <Alert status="info">
                <AlertIcon />
                Notifications are automatically created and sent via WebSocket after extraction.
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <Heading size="md">System Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack align="start" spacing={2}>
              <HStack>
                <Text fontWeight="bold">API URL:</Text>
                <Code>{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</Code>
              </HStack>
              <HStack>
                <Text fontWeight="bold">WebSocket URL:</Text>
                <Code>{process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}</Code>
              </HStack>
              <HStack>
                <Text fontWeight="bold">Environment:</Text>
                <Code>{process.env.NODE_ENV}</Code>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
