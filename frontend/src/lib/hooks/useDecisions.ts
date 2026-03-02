/**
 * React Query hooks for decisions.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { decisionsApi, Decision, DecisionsParams } from '../api/decisions';

export const DECISIONS_QUERY_KEY = 'decisions';

/**
 * Hook to fetch all decisions with optional filtering
 */
export function useDecisions(params?: DecisionsParams) {
  return useQuery({
    queryKey: [DECISIONS_QUERY_KEY, params],
    queryFn: () => decisionsApi.getDecisions(params),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch a single decision by ID
 */
export function useDecision(decisionId: string) {
  return useQuery({
    queryKey: [DECISIONS_QUERY_KEY, decisionId],
    queryFn: () => decisionsApi.getDecision(decisionId),
    enabled: !!decisionId,
  });
}

/**
 * Hook to fetch latest version of decision by key
 */
export function useDecisionByKey(decisionKey: string) {
  return useQuery({
    queryKey: [DECISIONS_QUERY_KEY, 'by-key', decisionKey],
    queryFn: () => decisionsApi.getDecisionByKey(decisionKey),
    enabled: !!decisionKey,
  });
}

/**
 * Hook to fetch version history for a decision
 */
export function useDecisionVersionHistory(decisionKey: string) {
  return useQuery({
    queryKey: [DECISIONS_QUERY_KEY, 'versions', decisionKey],
    queryFn: () => decisionsApi.getVersionHistory(decisionKey),
    enabled: !!decisionKey,
  });
}

/**
 * Hook to fetch recent decisions
 */
export function useRecentDecisions(limit = 10) {
  return useQuery({
    queryKey: [DECISIONS_QUERY_KEY, 'recent', limit],
    queryFn: () => decisionsApi.getRecentDecisions(limit),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch high-confidence decisions
 */
export function useHighConfidenceDecisions(minConfidence = 0.8, limit = 20) {
  return useQuery({
    queryKey: [DECISIONS_QUERY_KEY, 'high-confidence', minConfidence, limit],
    queryFn: () => decisionsApi.getHighConfidenceDecisions(minConfidence, limit),
    staleTime: 60000,
  });
}

/**
 * Hook to verify a decision
 */
export function useVerifyDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (decisionId: string) => decisionsApi.verifyDecision(decisionId),
    onSuccess: (data) => {
      // Update cache for this decision
      queryClient.setQueryData([DECISIONS_QUERY_KEY, data.id], data);
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: [DECISIONS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to deprecate a decision
 */
export function useDeprecateDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ decisionId, reason }: { decisionId: string; reason?: string }) =>
      decisionsApi.deprecateDecision(decisionId, reason),
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData([DECISIONS_QUERY_KEY, data.id], data);
      queryClient.invalidateQueries({ queryKey: [DECISIONS_QUERY_KEY] });
    },
  });
}
