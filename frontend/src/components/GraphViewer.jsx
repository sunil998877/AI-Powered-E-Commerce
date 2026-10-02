import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Filter,
  Info,
  Layers,
} from 'lucide-react';

const NODE_COLORS = {
  Brand: { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff', label: 'Brand' },
  Product: { bg: '#3b82f6', border: '#2563eb', text: '#ffffff', label: 'Product' },
  Category: { bg: '#10b981', border: '#059669', text: '#ffffff', label: 'Category' },
  Vendor: { bg: '#f59e0b', border: '#d97706', text: '#ffffff', label: 'Vendor' },
  Customer: { bg: '#06b6d4', border: '#0891b2', text: '#ffffff', label: 'Customer' },
  Order: { bg: '#f43f5e', border: '#e11d48', text: '#ffffff', label: 'Order' },
  Keyword: { bg: '#eab308', border: '#ca8a04', text: '#ffffff', label: 'Keyword / Banana' },
  Other: { bg: '#64748b', border: '#475569', text: '#ffffff', label: 'Other' },
};

export default function GraphViewer({ graphData, isLoading }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filterType, setFilterType] = useState('ALL');

  // Graph state for physics & rendering
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingRef = useRef(false);
  const dragNodeRef = useRef(null);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const animFrameIdRef = useRef(null);

  // Initialize and run force simulation
  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return;

    const width = containerRef.current ? containerRef.current.clientWidth : 800;
    const height = 550;

    // Create node objects with physics positions
    const initialNodes = graphData.nodes.map((n, i) => {
      const angle = (i / graphData.nodes.length) * 2 * Math.PI;
      const radius = 180 + Math.random() * 120;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: n.type === 'Brand' ? 24 : n.type === 'Product' ? 20 : 18,
      };
    });

    const nodeMap = new Map();
    initialNodes.forEach((n) => nodeMap.set(n.id, n));

    const initialLinks = (graphData.links || [])
      .map((l) => ({
        ...l,
        sourceNode: nodeMap.get(l.source),
        targetNode: nodeMap.get(l.target),
      }))
      .filter((l) => l.sourceNode && l.targetNode);

    nodesRef.current = initialNodes;
    linksRef.current = initialLinks;

    // Center view
    transformRef.current = { x: 0, y: 0, k: 0.9 };

    // Simple spring-electrical physics simulation
    let iteration = 0;
    const simulate = () => {
      iteration++;
      const nodes = nodesRef.current;
      const links = linksRef.current;
      const k = 90; // spring length

      // 1. Repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 350) {
            const force = (3000 / (dist * dist));
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            nodes[i].vx -= fx;
            nodes[i].vy -= fy;
            nodes[j].vx += fx;
            nodes[j].vy += fy;
          }
        }
      }

      // 2. Attraction along edges
      for (const link of links) {
        const s = link.sourceNode;
        const t = link.targetNode;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - k) * 0.04;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        s.vx += fx;
        s.vy += fy;
        t.vx -= fx;
        t.vy -= fy;
      }

      // 3. Center gravity & damping
      const cx = width / 2;
      const cy = height / 2;
      for (const node of nodes) {
        if (node === dragNodeRef.current) continue;
        node.vx += (cx - node.x) * 0.005;
        node.vy += (cy - node.y) * 0.005;
        node.vx *= 0.85;
        node.vy *= 0.85;
        node.x += node.vx;
        node.y += node.vy;
      }

      draw();

      if (iteration < 300 || isDraggingRef.current) {
        animFrameIdRef.current = requestAnimationFrame(simulate);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(simulate);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [graphData]);

  // Canvas drawing routine
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(transformRef.current.x, transformRef.current.y);
    ctx.scale(transformRef.current.k, transformRef.current.k);

    const nodes = nodesRef.current;
    const links = linksRef.current;

    // Draw Links
    for (const link of links) {
      const s = link.sourceNode;
      const t = link.targetNode;
      if (!s || !t) continue;

      if (
        filterType !== 'ALL' &&
        s.type !== filterType &&
        t.type !== filterType
      ) {
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(t.x, t.y);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Draw arrow
      const angle = Math.atan2(t.y - s.y, t.x - s.x);
      const arrowLength = 7;
      const arrowX = t.x - Math.cos(angle) * (t.radius + 3);
      const arrowY = t.y - Math.sin(angle) * (t.radius + 3);

      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(
        arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
        arrowY - arrowLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
        arrowY - arrowLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.fillStyle = '#64748b';
      ctx.fill();

      // Link label (relationship type)
      const midX = (s.x + t.x) / 2;
      const midY = (s.y + t.y) / 2;
      ctx.font = '9px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(link.type || '', midX, midY - 3);
    }

    // Draw Nodes
    for (const node of nodes) {
      if (filterType !== 'ALL' && node.type !== filterType) {
        continue;
      }

      const style = NODE_COLORS[node.type] || NODE_COLORS.Other;
      const isSelected = selectedNode && selectedNode.id === node.id;

      // Glow effect if selected or banana
      if (isSelected || (node.type === 'Keyword' && node.label === 'banana')) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(99, 102, 241, 0.3)' : 'rgba(234, 179, 8, 0.25)';
        ctx.fill();
      }

      // Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = style.bg;
      ctx.fill();
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.strokeStyle = isSelected ? '#ffffff' : style.border;
      ctx.stroke();

      // Node Icon / Text
      ctx.fillStyle = style.text;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (node.type === 'Keyword' && node.label === 'banana') {
        ctx.fillText('🍌', node.x, node.y);
      } else {
        const shortName = (node.label || node.id || '').slice(0, 10);
        ctx.fillText(shortName, node.x, node.y);
      }

      // Outer caption
      ctx.font = '9px Inter, sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(node.label || node.id, node.x, node.y + node.radius + 11);
    }

    ctx.restore();
  };

  // Mouse handlers for Pan and Drag
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse coordinates into world coordinates
    const worldX = (mouseX - transformRef.current.x) / transformRef.current.k;
    const worldY = (mouseY - transformRef.current.y) / transformRef.current.k;

    // Check if clicked a node
    let clickedNode = null;
    for (const node of nodesRef.current) {
      const dx = node.x - worldX;
      const dy = node.y - worldY;
      if (Math.sqrt(dx * dx + dy * dy) <= node.radius + 4) {
        clickedNode = node;
        break;
      }
    }

    if (clickedNode) {
      dragNodeRef.current = clickedNode;
      setSelectedNode(clickedNode);
    } else {
      isDraggingRef.current = true;
    }

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    if (dragNodeRef.current) {
      dragNodeRef.current.x += dx / transformRef.current.k;
      dragNodeRef.current.y += dy / transformRef.current.k;
      draw();
    } else if (isDraggingRef.current) {
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      draw();
    }
  };

  const handleMouseUp = () => {
    dragNodeRef.current = null;
    isDraggingRef.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newK = Math.max(0.3, Math.min(2.5, transformRef.current.k * zoomFactor));

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    transformRef.current.x = mouseX - (mouseX - transformRef.current.x) * (newK / transformRef.current.k);
    transformRef.current.y = mouseY - (mouseY - transformRef.current.y) * (newK / transformRef.current.k);
    transformRef.current.k = newK;

    draw();
  };

  const handleZoom = (factor) => {
    const newK = Math.max(0.3, Math.min(2.5, transformRef.current.k * factor));
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    transformRef.current.x = width / 2 - (width / 2 - transformRef.current.x) * (newK / transformRef.current.k);
    transformRef.current.y = height / 2 - (height / 2 - transformRef.current.y) * (newK / transformRef.current.k);
    transformRef.current.k = newK;
    draw();
  };

  const handleReset = () => {
    transformRef.current = { x: 0, y: 0, k: 0.9 };
    draw();
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-hidden' : ''
      }`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Knowledge Graph Visualization</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono">
              {graphData?.nodes?.length || 0} Nodes • {graphData?.links?.length || 0} Edges
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive physics graph: drag nodes, scroll to zoom, pan to explore relationships.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => handleZoom(1.2)}
            title="Zoom In"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset View"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Legend & Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Legend:
        </span>

        {Object.entries(NODE_COLORS).map(([key, style]) => (
          <button
            key={key}
            onClick={() => setFilterType(filterType === key ? 'ALL' : key)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              filterType === key
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: style.bg }}
            />
            <span>{style.label}</span>
          </button>
        ))}

        {filterType !== 'ALL' && (
          <button
            onClick={() => setFilterType('ALL')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 underline ml-1"
          >
            Show All
          </button>
        )}
      </div>

      {/* Canvas Area */}
      <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
            <span className="text-xs text-slate-500 font-medium">Loading graph nodes from Neo4j...</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={1000}
          height={550}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-[500px] cursor-grab active:cursor-grabbing block"
        />

        {/* Selected Node Details Tooltip */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 max-w-sm p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-md text-xs z-20">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedNode.label || selectedNode.id}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase"
                style={{
                  backgroundColor:
                    NODE_COLORS[selectedNode.type]?.bg || '#64748b',
                }}
              >
                {selectedNode.type}
              </span>
            </div>

            <div className="space-y-0.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              <div>ID: {selectedNode.id}</div>
              {selectedNode.properties &&
                Object.entries(selectedNode.properties).map(([k, v]) => (
                  <div key={k} className="truncate">
                    {k}: <span className="text-slate-800 dark:text-slate-200">{String(v)}</span>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="mt-2 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
