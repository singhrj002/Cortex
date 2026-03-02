'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Text, useToast } from '@chakra-ui/react';
import type { GraphData } from '@/lib/api/graph';

// Safely import cytoscape and extensions only on client-side
let cytoscape: any;
let dagre: any;
let cola: any;

// This ensures these imports only happen in browser environment
if (typeof window !== 'undefined') {
  // Dynamic imports
  cytoscape = require('cytoscape');
  dagre = require('cytoscape-dagre');
  cola = require('cytoscape-cola');
  
  // Register extensions safely
  if (!cytoscape.prototype.hasRegistered) {
    try {
      cytoscape.use(dagre);
      cytoscape.use(cola);
      // Flag to prevent multiple registrations
      cytoscape.prototype.hasRegistered = true;
    } catch (e) {
      console.error('Error registering Cytoscape extensions:', e);
    }
  }
}

// Sample graph data
const sampleData = {
  nodes: [
    { data: { id: 'decision1', label: 'Q4 Marketing Budget', type: 'decision' } },
    { data: { id: 'decision2', label: 'Engineering Hiring Plan', type: 'decision' } },
    { data: { id: 'task1', label: 'Create social media campaign', type: 'task' } },
    { data: { id: 'task2', label: 'Redesign website', type: 'task' } },
    { data: { id: 'task3', label: 'Interview engineering candidates', type: 'task' } },
    { data: { id: 'person1', label: 'Alice Chen', type: 'person' } },
    { data: { id: 'person2', label: 'David Kim', type: 'person' } },
    { data: { id: 'person3', label: 'Sarah Johnson', type: 'person' } },
    { data: { id: 'doc1', label: 'Marketing Strategy', type: 'document' } },
  ],
  edges: [
    { data: { source: 'decision1', target: 'task1', label: 'leads to' } },
    { data: { source: 'decision1', target: 'task2', label: 'leads to' } },
    { data: { source: 'decision2', target: 'task3', label: 'leads to' } },
    { data: { source: 'person1', target: 'decision1', label: 'made' } },
    { data: { source: 'person2', target: 'decision2', label: 'made' } },
    { data: { source: 'person3', target: 'task1', label: 'assigned to' } },
    { data: { source: 'person2', target: 'task2', label: 'assigned to' } },
    { data: { source: 'person3', target: 'task3', label: 'assigned to' } },
    { data: { source: 'doc1', target: 'decision1', label: 'informs' } },
  ]
};

interface CytoscapeGraphProps {
  graphData?: GraphData | null;
}

export default function CytoscapeGraph({ graphData }: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<any>(null);
  const toast = useToast();
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Guard clause: ensure we're running in browser and have cytoscape
    if (typeof window === 'undefined' || !cytoscape || !containerRef.current) {
      return;
    }

    try {
      // Clear any previous errors
      setError(null);
      
      // Safely map data with validation
      const elements = [];
      
      // Add nodes with error handling
      if (graphData && graphData.nodes) {
        try {
          graphData.nodes.forEach(n => {
            if (n && n.id) {
              elements.push({
                data: {
                  id: n.id,
                  label: (n as any).properties?.name || n.id,
                  type: n.type || 'unknown',
                },
              });
            }
          });
        } catch (e) {
          console.error("Error processing graph nodes:", e);
          throw new Error("Invalid node data structure");
        }
      }
      
      // Add edges with error handling
      if (graphData && graphData.edges) {
        try {
          graphData.edges.forEach(e => {
            if (e && e.source && e.target) {
              elements.push({
                data: {
                  source: e.source,
                  target: e.target,
                  label: e.relationship || 'rel',
                },
              });
            }
          });
        } catch (e) {
          console.error("Error processing graph edges:", e);
          throw new Error("Invalid edge data structure");
        }
      }
      
      // If no valid data, use sample data
      if (elements.length === 0) {
        elements.push(...sampleData.nodes, ...sampleData.edges);
      }

      // Create the cytoscape instance with safety checks
      const cy = cytoscape({
        container: containerRef.current,
        elements: elements,
        style: [
          {
            selector: 'node',
            style: {
              'label': 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'background-color': '#111827',
              'border-width': 2,
              'width': 100,
              'height': 40,
              'font-size': 10,
              'text-wrap': 'wrap',
              'text-max-width': '90',
              'color': '#E5E7EB',
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 1,
              'line-color': '#4B5563',
              'curve-style': 'bezier',
              'target-arrow-shape': 'triangle',
              'target-arrow-color': '#4B5563',
              'label': 'data(label)',
              'font-size': 8,
              'color': '#9CA3AF',
              'text-background-opacity': 1,
              'text-background-color': '#111827',
              'text-background-padding': '2',
            }
          },
          {
            selector: 'node[type="decision"]',
            style: {
              'border-color': '#60A5FA',
              'shape': 'rectangle',
            }
          },
          {
            selector: 'node[type="task"]',
            style: {
              'border-color': '#34D399',
              'shape': 'round-rectangle',
            }
          },
          {
            selector: 'node[type="person"]',
            style: {
              'border-color': '#A78BFA',
              'shape': 'ellipse',
              'width': 80,
              'height': 80,
            }
          },
          {
            selector: 'node[type="document"]',
            style: {
              'border-color': '#FBBF24',
              'shape': 'diamond',
            }
          },
        ],
        layout: {
          name: cytoscape.extensions?.cola ? 'cola' : 'grid', // Fallback to grid if cola isn't available
          fit: true,
          padding: 30,
        },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: true,
        maxZoom: 3,
        minZoom: 0.2,
      });

      // Safely attach event listeners
      try {
        cy.on('tap', 'node', function(evt: any) {
          const node = evt.target;
          if (node && node.data) {
            toast({
              title: node.data('label') || 'Unknown',
              description: `Type: ${node.data('type') || 'Unknown'}`,
              status: 'info',
              duration: 2000,
              isClosable: true,
            });
          }
        });
      } catch (e) {
        console.warn("Could not attach node tap event:", e);
      }

      // Run a layout after a short delay to ensure proper rendering
      setTimeout(() => {
        try {
          if (cy && !cy.destroyed()) {
            cy.layout({ name: 'grid', fit: true }).run();
          }
        } catch (e) {
          console.warn("Could not run layout:", e);
        }
      }, 100);

      // Store reference
      cyRef.current = cy;
      
    } catch (err: any) {
      console.error("Cytoscape initialization error:", err);
      setError(err);
      toast({
        title: "Graph Rendering Error",
        description: err.message || "Failed to render graph",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    // Cleanup function
    return () => {
      try {
        if (cyRef.current) {
          cyRef.current.destroy();
          cyRef.current = null;
        }
      } catch (e) {
        console.error("Error cleaning up cytoscape:", e);
      }
    };
  }, [toast, graphData]);

  // Show error state if there's an error
  if (error) {
    return (
      <Box
        width="100%"
        height="100%"
        bg="background.primary"
        display="flex"
        justifyContent="center"
        alignItems="center"
        color="red.500"
        p={4}
        textAlign="center"
      >
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Failed to render graph
          </Text>
          <Text fontSize="sm">{error.message || "Unknown error occurred"}</Text>
        </Box>
      </Box>
    );
  }
  
  // Normal render
  return (
    <Box
      ref={containerRef}
      width="100%"
      height="100%"
      bg="background.primary"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
    />
  );
}