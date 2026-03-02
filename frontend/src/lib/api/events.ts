/**
 * Events API module.
 * Handles event ingestion, retrieval, and extraction triggering.
 */

import { apiClient } from './client';

export interface Event {
  id: string;
  source: string;
  channel: string;
  thread_id?: string;
  timestamp: string;
  sender: string;
  recipients?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  body_text: string;
  content_hash: string;
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface EventsParams {
  from?: string;
  to?: string;
  topic?: string;
  team?: string;
  q?: string;
  skip?: number;
  limit?: number;
}

export interface IngestionStats {
  total_processed: number;
  total_saved: number;
  total_duplicates: number;
  persons_created: number;
  errors: number;
}

export interface ExtractionTaskResult {
  message: string;
  task_id: string;
  task_type: 'workflow' | 'simple';
  event_id: string;
}

export const eventsApi = {
  /**
   * Get events with optional filtering
   */
  getEvents: async (params?: EventsParams): Promise<Event[]> => {
    const response = await apiClient.get('/events/', { params });
    return response.data;
  },

  /**
   * Get a single event by ID
   */
  getEvent: async (eventId: string): Promise<Event> => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data;
  },

  /**
   * Ingest Enron dataset
   */
  ingestEnronData: async (path: string, limit?: number): Promise<{ message: string; stats: IngestionStats }> => {
    const response = await apiClient.post('/events/ingest/enron/load', null, {
      params: { path, limit }
    });
    return response.data;
  },

  /**
   * Trigger extraction for a specific event
   */
  triggerExtraction: async (eventId: string, useWorkflow = true): Promise<ExtractionTaskResult> => {
    const response = await apiClient.post(`/events/${eventId}/extract`, null, {
      params: { use_workflow: useWorkflow }
    });
    return response.data;
  },

  /**
   * Trigger batch extraction
   */
  triggerBatchExtraction: async (eventIds: string[], useWorkflow = true): Promise<any> => {
    const response = await apiClient.post('/events/extract/batch', eventIds, {
      params: { use_workflow: useWorkflow }
    });
    return response.data;
  },
};
