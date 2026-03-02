/**
 * React Query hooks for events.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, Event, EventsParams, IngestionStats } from '../api/events';

export const EVENTS_QUERY_KEY = 'events';

/**
 * Hook to fetch events with optional filtering
 */
export function useEvents(params?: EventsParams) {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, params],
    queryFn: () => eventsApi.getEvents(params),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single event
 */
export function useEvent(eventId: string) {
  return useQuery({
    queryKey: [EVENTS_QUERY_KEY, eventId],
    queryFn: () => eventsApi.getEvent(eventId),
    enabled: !!eventId,
  });
}

/**
 * Hook to ingest Enron data
 */
export function useIngestEnronData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ path, limit }: { path: string; limit?: number }) =>
      eventsApi.ingestEnronData(path, limit),
    onSuccess: () => {
      // Invalidate events cache to refetch
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
  });
}

/**
 * Hook to trigger extraction for an event
 */
export function useTriggerExtraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, useWorkflow = true }: { eventId: string; useWorkflow?: boolean }) =>
      eventsApi.triggerExtraction(eventId, useWorkflow),
    onSuccess: (_, variables) => {
      // Invalidate the specific event to refetch its status
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY, variables.eventId] });
    },
  });
}

/**
 * Hook to trigger batch extraction
 */
export function useTriggerBatchExtraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventIds, useWorkflow = true }: { eventIds: string[]; useWorkflow?: boolean }) =>
      eventsApi.triggerBatchExtraction(eventIds, useWorkflow),
    onSuccess: () => {
      // Invalidate all events
      queryClient.invalidateQueries({ queryKey: [EVENTS_QUERY_KEY] });
    },
  });
}
