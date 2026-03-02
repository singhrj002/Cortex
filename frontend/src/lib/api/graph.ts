/**
 * Graph API module.
 * Handles knowledge graph queries, time-travel, and synchronization.
 */

import { apiClient } from './client';

export interface GraphNode {
  id: string;
  type: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  properties?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphStats {
  total_nodes: number;
  total_relationships: number;
  node_type_counts: Record<string, number>;
  relationship_type_counts: Record<string, number>;
}

export interface SubgraphParams {
  center_id: string;
  depth?: number;
  node_types?: string[];
}

export interface TimeTravelParams {
  timestamp: string;
  node_type?: string;
}

export const graphApi = {
  /**
   * Get graph statistics
   */
  getStats: async (): Promise<GraphStats> => {
    const response = await apiClient.get('/graph/stats');
    return response.data;
  },

  /**
   * Get subgraph around a node
   */
  getSubgraph: async (params: SubgraphParams): Promise<GraphData> => {
    const response = await apiClient.get('/graph/subgraph', { params });
    return response.data;
  },

  /**
   * Get graph state at a specific timestamp (time-travel query)
   */
  getTimeTravel: async (params: TimeTravelParams): Promise<GraphNode[]> => {
    const response = await apiClient.get('/graph/state', { params });
    return response.data;
  },

  /**
   * Trigger synchronization from PostgreSQL to Neo4j
   */
  syncToGraph: async (entityType: string, limit?: number): Promise<{ synced: number; errors: number }> => {
    const response = await apiClient.post('/graph/sync', null, {
      params: { entity_type: entityType, limit }
    });
    return response.data;
  },

  /**
   * Search graph nodes
   */
  searchGraph: async (query: string, nodeType?: string): Promise<GraphNode[]> => {
    const response = await apiClient.get('/graph/search', {
      params: { query, node_type: nodeType }
    });
    return response.data;
  },

  /**
   * Export graph data
   */
  exportGraph: async (format: 'cypher' | 'json' = 'json'): Promise<any> => {
    const response = await apiClient.get('/graph/export', {
      params: { format }
    });
    return response.data;
  },

  /**
   * Get full graph for visualization (use with caution on large graphs)
   */
  getFullGraph: async (): Promise<GraphData> => {
    // Use simple graph endpoint that builds from PostgreSQL
    const response = await apiClient.get('/simple-graph/from-db', {
      params: { limit: 1000 }
    });
    return response.data;
  },
};
