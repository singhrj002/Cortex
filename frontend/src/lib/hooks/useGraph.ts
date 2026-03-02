/**
 * React Query hooks for graph operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphApi, GraphData, SubgraphParams, TimeTravelParams } from '../api/graph';

export const GRAPH_QUERY_KEY = 'graph';

/**
 * Hook to fetch graph statistics
 */
export function useGraphStats() {
  return useQuery({
    queryKey: [GRAPH_QUERY_KEY, 'stats'],
    queryFn: () => graphApi.getStats(),
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to fetch subgraph around a node
 */
export function useSubgraph(params: SubgraphParams) {
  return useQuery({
    queryKey: [GRAPH_QUERY_KEY, 'subgraph', params],
    queryFn: () => graphApi.getSubgraph(params),
    enabled: !!params.center_id,
    staleTime: 60000,
  });
}

/**
 * Hook to fetch full graph (use with caution)
 */
export function useFullGraph() {
  return useQuery({
    queryKey: [GRAPH_QUERY_KEY, 'full'],
    queryFn: () => graphApi.getFullGraph(),
    staleTime: 300000,
    // Don't fetch automatically, only when explicitly called
    enabled: false,
  });
}

/**
 * Hook for time-travel queries
 */
export function useTimeTravel(params: TimeTravelParams) {
  return useQuery({
    queryKey: [GRAPH_QUERY_KEY, 'time-travel', params],
    queryFn: () => graphApi.getTimeTravel(params),
    enabled: !!params.timestamp,
    staleTime: Infinity, // Historical data doesn't change
  });
}

/**
 * Hook to search graph nodes
 */
export function useGraphSearch(query: string, nodeType?: string) {
  return useQuery({
    queryKey: [GRAPH_QUERY_KEY, 'search', query, nodeType],
    queryFn: () => graphApi.searchGraph(query, nodeType),
    enabled: query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 30000,
  });
}

/**
 * Hook to trigger graph synchronization
 */
export function useSyncToGraph() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entityType, limit }: { entityType: string; limit?: number }) =>
      graphApi.syncToGraph(entityType, limit),
    onSuccess: () => {
      // Invalidate all graph queries to refetch
      queryClient.invalidateQueries({ queryKey: [GRAPH_QUERY_KEY] });
    },
  });
}

/**
 * Hook to export graph data
 */
export function useExportGraph() {
  return useMutation({
    mutationFn: (format: 'cypher' | 'json' = 'json') => graphApi.exportGraph(format),
  });
}
