'use client';

import { useEffect, useRef, useState } from 'react';
import { GraphData } from '@/lib/api/graph';

interface SimpleForceGraphProps {
  graphData: GraphData;
}

// Node types with colors
const NODE_COLORS: Record<string, string> = {
  Person: '#60A5FA',     // Blue
  Decision: '#F59E0B',   // Orange
  Task: '#10B981',       // Green
  Claim: '#8B5CF6',      // Purple
  Team: '#FF6B6B',       // Red
  Topic: '#FF922B',      // Deep Orange
  Conflict: '#FF5252',   // Bright Red
  Event: '#94A3B8',      // Gray
};

// Edge colors by relationship type
const EDGE_COLORS: Record<string, string> = {
  MEMBER_OF: '#4285F4',             // Blue
  MADE_DECISION: '#34A853',         // Green
  MADE_CLAIM: '#FBBC05',            // Yellow
  AFFECTS: '#EA4335',               // Red
  RELATES_TO: '#8B5CF6',            // Purple
  CONTRADICTS: '#FF5252',           // Bright Red
  COMMUNICATION_TENSION: '#FF0000', // Bright Red with thicker line
  SUPERSEDES: '#FF8800',            // Orange
  DEFAULT: '#CBD5E0',               // Default gray
};

export default function SimpleForceGraph({ graphData }: SimpleForceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  // Track selected and hovered nodes
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [hoveredNode, setHoveredNode] = useState<any>(null);

  // Store nodes with positions
  const [simulationNodes, setSimulationNodes] = useState<any[]>([]);
  
  useEffect(() => {
    console.log('[SimpleForceGraph] Effect triggered', {
      hasCanvas: !!canvasRef.current,
      hasGraphData: !!graphData,
      nodeCount: graphData?.nodes?.length,
      edgeCount: graphData?.edges?.length
    });

    if (!canvasRef.current || !graphData || !graphData.nodes || !graphData.edges) {
      console.log('[SimpleForceGraph] Early return - missing required data');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[SimpleForceGraph] Could not get 2d context');
      return;
    }

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const width = canvas.width;
    const height = canvas.height;

    console.log('[SimpleForceGraph] Canvas dimensions:', { width, height });

    // Safety check for empty data
    if (graphData.nodes.length === 0) {
      console.log('[SimpleForceGraph] No nodes to display');
      ctx.fillStyle = '#718096';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No nodes to display', width / 2, height / 2);
      return;
    }

    console.log('[SimpleForceGraph] Starting animation with', graphData.nodes.length, 'nodes and', graphData.edges.length, 'edges');

    // Node data with positions
    const nodes = graphData.nodes.map((node, i) => ({
      ...node,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: node.type === 'Person' ? 8 : 6,
    }));

    // Update state with simulation nodes
    setSimulationNodes(nodes);

    // Node lookup
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Filter edges to only include those with valid nodes
    const edges = graphData.edges.filter(edge =>
      nodeMap.has(edge.source) && nodeMap.has(edge.target)
    );

    // Physics simulation
    const simulate = () => {
      // Apply forces
      nodes.forEach(node => {
        // Center force
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * 0.0001;
        node.vy += dy * 0.0001;

        // Repulsion between nodes
        nodes.forEach(other => {
          if (node === other) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = -50 / (dist * dist);
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        });
      });

      // Link force
      edges.forEach(edge => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 100) * 0.01;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        source.vx += fx;
        source.vy += fy;
        target.vx -= fx;
        target.vy -= fy;
      });

      // Update positions
      nodes.forEach(node => {
        node.vx *= 0.9; // Damping
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;

        // Keep in bounds
        node.x = Math.max(20, Math.min(width - 20, node.x));
        node.y = Math.max(20, Math.min(height - 20, node.y));
      });
      
      // Update state occasionally to keep node positions current for clicks
      if (Math.random() < 0.05) {
        setSimulationNodes([...nodes]);
      }
    };

    // Render
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw edges
      edges.forEach(edge => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return;
        
        // Set edge color based on relationship
        const relationship = edge.relationship || 'DEFAULT';
        ctx.strokeStyle = EDGE_COLORS[relationship] || EDGE_COLORS.DEFAULT;
        
        // Special case for tension relationships
        if (relationship === 'COMMUNICATION_TENSION') {
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 3]); // Dashed line for tension
        } else {
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }

        // Draw edge line
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        
        // Draw relationship label
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        
        // Draw small label background
        if (relationship !== 'DEFAULT') {
          const displayName = relationship.replace(/_/g, ' ');
          ctx.font = '8px sans-serif';
          const labelWidth = ctx.measureText(displayName).width;
          
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.fillRect(midX - labelWidth/2 - 2, midY - 6, labelWidth + 4, 12);
          
          // Draw relationship text
          ctx.fillStyle = '#1F2937';
          ctx.textAlign = 'center';
          ctx.fillText(displayName, midX, midY);
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        ctx.fillStyle = NODE_COLORS[node.type] || '#94A3B8';
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw label
        ctx.fillStyle = '#1F2937';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        // Get node label from properties based on node type
        let label = node.id.substring(0, 8);
        if (node.properties && typeof node.properties === 'object') {
          if (node.type === 'Claim' && node.properties.text) {
            label = String(node.properties.text).substring(0, 20);
            if (label.length === 20) label += '...';
          } else if (node.properties.name) {
            label = String(node.properties.name).substring(0, 20);
          } else if (node.properties.title) {
            label = String(node.properties.title).substring(0, 20);
          }
        }
        ctx.fillText(
          label,
          node.x,
          node.y + node.radius + 12
        );
      });

      // Draw legend
      const legendItems = [
        { type: 'Person', color: NODE_COLORS.Person },
        { type: 'Team', color: NODE_COLORS.Team },
        { type: 'Decision', color: NODE_COLORS.Decision },
        { type: 'Task', color: NODE_COLORS.Task },
        { type: 'Claim', color: NODE_COLORS.Claim }, 
        { type: 'Topic', color: NODE_COLORS.Topic },
        { type: 'Conflict', color: NODE_COLORS.Conflict },
      ];

      legendItems.forEach((item, i) => {
        const x = 20;
        const y = 20 + i * 25;

        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#1F2937';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(item.type, x + 15, y + 4);
      });
    };

    // Animation loop
    const animate = () => {
      simulate();
      render();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [graphData]);

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is on a node
    const node = simulationNodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= (node.radius || 8);
    });
    
    setSelectedNode(node || null);
  };
  
  // Handle mouse move for hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if hovering over a node
    const node = simulationNodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= (node.radius || 8);
    });
    
    setHoveredNode(node || null);
    
    // Change cursor based on hover
    canvas.style.cursor = node ? 'pointer' : 'default';
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          background: '#F8FAFC',
          borderRadius: '8px',
          display: 'block',
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      />
      
      {/* Node details panel */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          borderWidth: '1px',
          borderColor: '#E2E8F0',
          borderStyle: 'solid',
          maxWidth: '300px',
          zIndex: 10,
          color: '#1F2937'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold', color: NODE_COLORS[selectedNode.type] || '#94A3B8' }}>
            {selectedNode.type === 'Claim'
              ? `${selectedNode.type}: ${selectedNode.properties?.text || selectedNode.id}`
              : `${selectedNode.type}: ${selectedNode.properties?.name || selectedNode.properties?.title || selectedNode.id}`
            }
          </div>
          <div style={{ fontSize: '12px' }}>
            {Object.entries(selectedNode.properties || {}).map(([key, value]) => {
              if (key === 'id') return null; // Skip ID since it's already shown
              
              // Skip very long values or arrays/objects
              if (typeof value === 'object' || (typeof value === 'string' && value.length > 100)) {
                return null;
              }
              
              return (
                <div key={key} style={{ margin: '4px 0' }}>
                  <span style={{ fontWeight: '500' }}>{key}: </span> 
                  <span>{String(value)}</span>
                </div>
              );
            })}
          </div>
          
          {/* Connected edges */}
          <div style={{ marginTop: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
            <div style={{ fontWeight: '500', fontSize: '13px', marginBottom: '6px' }}>Relationships:</div>
            {graphData.edges.filter(edge => 
              edge.source === selectedNode.id || edge.target === selectedNode.id
            ).map((edge, idx) => {
              const isOutgoing = edge.source === selectedNode.id;
              const connectedId = isOutgoing ? edge.target : edge.source;
              const relationship = edge.relationship || 'connected to';
              const connectedNode = graphData.nodes.find(n => n.id === connectedId);
              
              if (!connectedNode) return null;
              
              const connectedName = connectedNode?.properties?.name || 
                                   connectedNode?.properties?.title || 
                                   connectedId;
              
              return (
                <div key={idx} style={{ fontSize: '12px', marginBottom: '4px', display: 'flex' }}>
                  <span style={{ marginRight: '4px' }}>{isOutgoing ? '→' : '←'}</span>
                  <span style={{ color: EDGE_COLORS[relationship] || EDGE_COLORS.DEFAULT, marginRight: '4px' }}>
                    {relationship.replace(/_/g, ' ')}
                  </span> 
                  <span style={{ fontWeight: '500', color: NODE_COLORS[connectedNode.type] || '#94A3B8' }}>
                    {connectedName}
                  </span>
                </div>
              );
            })}
          </div>
          
          <button
            onClick={() => setSelectedNode(null)}
            style={{
              marginTop: '10px',
              padding: '6px 10px',
              background: '#F1F5F9',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            Close
          </button>
        </div>
      )}
      
      {/* Hover tooltip */}
      {hoveredNode && !selectedNode && (
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: '20px',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#1F2937',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          pointerEvents: 'none',
          borderWidth: '1px',
          borderColor: '#E2E8F0',
          borderStyle: 'solid',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {hoveredNode.type === 'Claim'
            ? `${hoveredNode.type}: ${hoveredNode.properties?.text || hoveredNode.id}`
            : `${hoveredNode.type}: ${hoveredNode.properties?.name || hoveredNode.properties?.title || hoveredNode.id}`
          }
        </div>
      )}
    </div>
  );
}
