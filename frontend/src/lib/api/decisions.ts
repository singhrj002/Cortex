/**
 * Decisions API module.
 * Handles decision retrieval, updates, and version management.
 */

import { apiClient } from './client';

export interface Decision {
  id: string;
  decision_key: string;
  title: string;
  summary?: string;
  rationale?: string;
  scope?: string;
  status: 'proposed' | 'confirmed' | 'deprecated';
  version: string;
  owner_id?: string;
  decided_by?: string[];
  affected_teams?: string[];
  affected_projects?: string[];
  confidence: number;
  evidence_event_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface DecisionVersion {
  id: string;
  version: string;
  title: string;
  created_at: string;
  superseded_by_id?: string;
}

export interface DecisionsParams {
  status?: 'proposed' | 'confirmed' | 'deprecated';
  min_confidence?: number;
  owner_id?: string;
  skip?: number;
  limit?: number;
}

export const decisionsApi = {
  /**
   * Get all decisions with optional filtering
   */
  getDecisions: async (params?: DecisionsParams): Promise<Decision[]> => {
    const response = await apiClient.get('/decisions/', { params });
    return response.data;
  },

  /**
   * Get a single decision by ID
   */
  getDecision: async (decisionId: string): Promise<Decision> => {
    const response = await apiClient.get(`/decisions/${decisionId}`);
    return response.data;
  },

  /**
   * Get latest version of a decision by key
   */
  getDecisionByKey: async (decisionKey: string): Promise<Decision> => {
    const response = await apiClient.get(`/decisions/by-key/${decisionKey}`);
    return response.data;
  },

  /**
   * Get version history for a decision
   */
  getVersionHistory: async (decisionKey: string): Promise<DecisionVersion[]> => {
    const response = await apiClient.get(`/decisions/by-key/${decisionKey}/versions`);
    return response.data;
  },

  /**
   * Verify a decision (change status to confirmed)
   */
  verifyDecision: async (decisionId: string): Promise<Decision> => {
    const response = await apiClient.post(`/decisions/${decisionId}/verify`);
    return response.data;
  },

  /**
   * Deprecate a decision
   */
  deprecateDecision: async (decisionId: string, reason?: string): Promise<Decision> => {
    const response = await apiClient.post(`/decisions/${decisionId}/deprecate`, { reason });
    return response.data;
  },

  /**
   * Get recent decisions
   */
  getRecentDecisions: async (limit = 10): Promise<Decision[]> => {
    const response = await apiClient.get('/decisions/recent', { params: { limit } });
    return response.data;
  },

  /**
   * Get high-confidence decisions
   */
  getHighConfidenceDecisions: async (minConfidence = 0.8, limit = 20): Promise<Decision[]> => {
    const response = await apiClient.get('/decisions/high-confidence', {
      params: { min_confidence: minConfidence, limit }
    });
    return response.data;
  },
};
