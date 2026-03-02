/**
 * Topics API module.
 * Handles topic retrieval and associations.
 */

import { apiClient } from './client';

export interface Topic {
  id: string;
  name: string;
  keywords?: string[];
  mention_count: number;
  last_mentioned: string;
  created_at: string;
}

export interface TopicAssociation {
  entity_type: string;
  entity_id: string;
  confidence: number;
}

export const topicsApi = {
  /**
   * Get all topics
   */
  getTopics: async (limit = 100): Promise<Topic[]> => {
    const response = await apiClient.get('/topics/', { params: { limit } });
    return response.data;
  },

  /**
   * Get trending topics
   */
  getTrendingTopics: async (limit = 20): Promise<Topic[]> => {
    const response = await apiClient.get('/topics/trending', { params: { limit } });
    return response.data;
  },

  /**
   * Get entities associated with a topic
   */
  getTopicAssociations: async (topicId: string): Promise<TopicAssociation[]> => {
    const response = await apiClient.get(`/topics/${topicId}/entities`);
    return response.data;
  },
};
