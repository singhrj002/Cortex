/**
 * React Query hooks for topics.
 */

import { useQuery } from '@tanstack/react-query';
import { topicsApi } from '../api/topics';

export const TOPICS_QUERY_KEY = 'topics';

/**
 * Hook to fetch all topics
 */
export function useTopics(limit = 100) {
  return useQuery({
    queryKey: [TOPICS_QUERY_KEY, limit],
    queryFn: () => topicsApi.getTopics(limit),
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to fetch trending topics
 */
export function useTrendingTopics(limit = 20) {
  return useQuery({
    queryKey: [TOPICS_QUERY_KEY, 'trending', limit],
    queryFn: () => topicsApi.getTrendingTopics(limit),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch entities associated with a topic
 */
export function useTopicAssociations(topicId: string) {
  return useQuery({
    queryKey: [TOPICS_QUERY_KEY, 'associations', topicId],
    queryFn: () => topicsApi.getTopicAssociations(topicId),
    enabled: !!topicId,
    staleTime: 300000,
  });
}
