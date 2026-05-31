import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../../api/client';
import type { TopologyData, TopologyNode } from '../../api/types';

// --- Force-directed layout ---
type Vec2 = { x: number; y: number };

function computeForceLayout(
  nodeIds: string[],
  links: { source: string; target: string }[],
  width = 800,
  height = 500,
  iterations = 200,
): Map<string, Vec2> {
  const pos = new Map<string, Vec2>();
  const n = nodeIds.length;

  // Initial positions: spread on a larger circle to avoid starting too close
  const radius = Math.min(width, height) * 0.38;
  nodeIds.forEach((id, i) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    pos.set(id, {
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle),
    });
  });

  // Build adjacency
  const linkMap = new Map<string, string[]>();
  nodeIds.forEach(id => linkMap.set(id, []));
  links.forEach(l => {
    linkMap.get(l.source)?.push(l.target);
    linkMap.get(l.target)?.push(l.source);
  });

  // Ideal edge length
  const k = Math.sqrt((width * height) / Math.max(n, 1)) * 1.4;

  for (let iter = 0; iter < iterations; iter++) {
    const disp = new Map<string, Vec2>();
    nodeIds.forEach(id => disp.set(id, { x: 0, y: 0 }));

    // Repulsion between all pairs
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const u = nodeIds[i], v = nodeIds[j];
        const pu = pos.get(u)!, pv = pos.get(v)!;
        const dx = pu.x - pv.x, dy = pu.y - pv.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (k * k) / dist;
        const du = disp.get(u)!, dv = disp.get(v)!;
        du.x += (dx / dist) * force;
        du.y += (dy / dist) * force;
        dv.x -= (dx / dist) * force;
        dv.y -= (dy / dist) * force;
      }
    }

    // Attraction along edges
    links.forEach(({ source, target }) => {
      const pu = pos.get(source), pv = pos.get(target);
      if (!pu || !pv) return;
      const dx = pu.x - pv.x, dy = pu.y - pv.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist * dist) / k;
      const du = disp.get(source)!, dv = disp.get(target)!;
      du.x -= (dx / dist) * force;
      du.y -= (dy / dist) * force;
      dv.x += (dx / dist) * force;
      dv.y += (dy / dist) * force;
    });

    // Cooling + clamp
    const temp = (width / 5) * (1 - iter / iterations);
    const padding = 100;
    nodeIds.forEach(id => {
      const p = pos.get(id)!;
      const d = disp.get(id)!;
      const dLen = Math.max(Math.sqrt(d.x * d.x + d.y * d.y), 0.1);
      p.x += (d.x / dLen) * Math.min(dLen, temp);
      p.y += (d.y / dLen) * Math.min(dLen, temp);
      p.x = Math.min(width - padding, Math.max(padding, p.x));
      p.y = Math.min(height - padding, Math.max(padding, p.y));
    });
  }

  return pos;
}

// --- Component ---
export const Topology = () => {
  const [data, setData] = useState<TopologyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Map<string, Vec2>>(new Map());
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 500 });

  useEffect(() => {
    const fetchTopology = async () => {
      try {
        const topology = await api.analytics.getTopology();
        setData(topology);
        if (topology.nodes.length > 0) {
          setSelectedNode(topology.nodes[0]);
        }
      } catch (error) {
        console.error('Failed to fetch topology:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopology();
  }, []);

  // Recompute layout when data or canvas size changes
  useEffect(() => {
    if (!data || data.nodes.length === 0) return;
    const ids = data.nodes.map(n => n.id);
    const computed = computeForceLayout(ids, data.links, canvasSize.w, canvasSize.h);
    setLayout(computed);
  }, [data, canvasSize]);

  // Observe canvas resize
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setCanvasSize({ w: Math.max(width, 300), h: Math.max(height, 300) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const getCoords = useCallback((nodeId: string): Vec2 => {
    return layout.get(nodeId) ?? { x: canvasSize.w / 2, y: canvasSize.h / 2 };
  }, [layout, canvasSize]);

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-container-lowest -m-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-primary font-bold uppercase tracking-widest">Discovering Topology...</span>
        </div>
      </div>
    );
  }

  // Node card dimensions
  const MODEL_W = 160, MODEL_H = 70;
  const OTHER_W = 130, OTHER_H = 58;

  return (
    <div className="flex h-full overflow-hidden -m-8">
      {/* Left Sidebar */}
      <aside className="w-64 flex flex-col border-r border-outline-variant bg-surface-container-lowest shrink-0">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Active Streams</span>
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#4cd7f6]" />
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {data.nodes.filter(n => n.type === 'agent').map(agent => (
            <StreamItem
              key={agent.id}
              id={agent.name}
              logs={['STREAMING_ACTIVE', 'HEARTBEAT_OK']}
              active={agent.status === 'active'}
              onClick={() => setSelectedNode(agent)}
              selected={selectedNode?.id === agent.id}
            />
          ))}
          <div className="p-3 bg-surface-container/30 border border-outline-variant/30 rounded-xl opacity-40 italic text-[10px] text-center font-mono">
            End of active streams
          </div>
        </div>
        <div className="p-4 bg-surface border-t border-outline-variant">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Knowledge Indexing</span>
            <span className="text-xs font-mono text-primary font-bold">74.2%</span>
          </div>
          <div className="h-1.5 bg-outline-variant w-full overflow-hidden rounded-full">
            <div className="h-full bg-primary w-[74.2%] rounded-full" style={{ transition: 'width 1s ease' }} />
          </div>
        </div>
      </aside>

      {/* Center: Topology Map */}
      <div className="flex-1 relative overflow-hidden flex flex-col min-w-0">
        <div ref={canvasRef} className="flex-1 relative bg-surface/50 overflow-hidden">
          {/* Grid background */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none">
            <defs>
              <pattern id="topo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#topo-grid)" />
          </svg>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-tertiary/5 pointer-events-none" />

          {/* Layer legend */}
          <div className="absolute top-4 left-4 space-y-2 z-20 bg-surface-container-low/80 backdrop-blur-sm border border-outline-variant/50 rounded-lg p-3">
            <p className="text-[8px] font-mono font-bold uppercase tracking-widest text-on-surface-variant mb-2">Legend</p>
            <Indicator color="bg-primary" label="Central Models" />
            <Indicator color="bg-secondary" label="Memory Clusters" />
            <Indicator color="bg-tertiary" label="Active Agents" />
          </div>

          {/* Node count badge */}
          <div className="absolute top-4 right-4 z-20 bg-surface-container-low/80 backdrop-blur-sm border border-outline-variant/50 rounded-lg px-3 py-2">
            <span className="text-[9px] font-mono text-on-surface-variant">
              {data.nodes.length} nodes · {data.links.length} links
            </span>
          </div>

          {/* Connection Lines */}
          <svg
            className="absolute inset-0 pointer-events-none z-0"
            style={{ width: canvasSize.w, height: canvasSize.h, overflow: 'visible' }}
          >
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <marker id="arrowData" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-secondary)" opacity="0.5"/>
              </marker>
              <marker id="arrowLogic" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-tertiary)" opacity="0.5"/>
              </marker>
            </defs>
            {data.links.map((link, i) => {
              const s = getCoords(link.source);
              const t = getCoords(link.target);
              const mx = (s.x + t.x) / 2;
              const my = (s.y + t.y) / 2 - 40;
              const isData = link.type === 'data';
              return (
                <path
                  key={i}
                  d={`M ${s.x} ${s.y} Q ${mx} ${my} ${t.x} ${t.y}`}
                  fill="none"
                  stroke={isData ? 'var(--color-secondary)' : 'var(--color-tertiary)'}
                  strokeWidth="1.5"
                  strokeDasharray={isData ? '6 4' : '4 4'}
                  opacity="0.45"
                  filter="url(#glow)"
                  markerEnd={isData ? 'url(#arrowData)' : 'url(#arrowLogic)'}
                />
              );
            })}
          </svg>

          {/* Node Cards — positioned absolutely using layout coords */}
          {data.nodes.map(node => {
            const pos = getCoords(node.id);
            const isModel = node.type === 'model';
            const isMem = node.type === 'memory';
            const w = isModel ? MODEL_W : OTHER_W;
            const h = isModel ? MODEL_H : OTHER_H;
            const isSelected = selectedNode?.id === node.id;

            const borderColor = isModel ? 'border-primary' : isMem ? 'border-secondary' : 'border-tertiary';
            const labelColor = isModel ? 'text-primary' : isMem ? 'text-secondary' : 'text-tertiary';
            const bgColor = isModel ? 'bg-surface-container/95' : 'bg-surface-container/85';

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="absolute z-10 cursor-pointer select-none transition-transform duration-150 hover:scale-105"
                style={{
                  left: pos.x - w / 2,
                  top: pos.y - h / 2,
                  width: w,
                }}
              >
                <div
                  className={`
                    backdrop-blur-md border-2 rounded-xl shadow-lg p-2.5
                    ${borderColor} ${bgColor}
                    ${isSelected ? 'ring-2 ring-white/30 scale-105 shadow-2xl' : ''}
                  `}
                >
                  {/* Type tag */}
                  <div className={`text-[8px] font-bold uppercase tracking-widest font-mono mb-1 ${labelColor}`}>
                    {node.type} · {node.id}
                  </div>
                  {/* Name */}
                  <div className="text-[11px] font-bold text-on-surface truncate mb-1.5">
                    {node.name}
                  </div>
                  {/* Metadata */}
                  <div className="space-y-0.5">
                    {Object.entries(node.metadata).slice(0, 2).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center gap-1">
                        <span className="font-mono text-[8px] text-on-surface-variant uppercase">{key}</span>
                        <span className="font-mono text-[9px] text-on-surface font-bold shrink-0">{val as string}</span>
                      </div>
                    ))}
                  </div>
                  {/* Status dot */}
                  <div className="absolute -top-1.5 -right-1.5">
                    <div className={`w-3 h-3 rounded-full border-2 border-surface-container
                      ${node.status === 'active' ? 'bg-emerald-500 shadow-[0_0_6px_#4ade80]'
                        : node.status === 'error' ? 'bg-error shadow-[0_0_6px_#ffb4ab]'
                        : 'bg-outline-variant'}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: Performance Matrix */}
        <div className="h-56 border-t border-outline-variant bg-surface flex flex-col shrink-0 z-30">
          <div className="flex items-center justify-between px-5 py-2 border-b border-outline-variant bg-surface-container shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">monitoring</span>
              <h4 className="text-[10px] font-bold uppercase tracking-widest font-mono">System_Performance_Matrix</h4>
            </div>
            <span className="text-[9px] text-on-surface-variant font-mono">
              {data.nodes.length} nodes · {data.links.length} links
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead className="sticky top-0 bg-surface-container-low border-b border-outline-variant z-10">
                <tr>
                  <th className="p-3 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">Entity</th>
                  <th className="p-3 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">Type</th>
                  <th className="p-3 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">Status</th>
                  <th className="p-3 text-on-surface-variant font-bold uppercase tracking-widest">Metric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {data.nodes.map(node => (
                  <tr
                    key={node.id}
                    className={`hover:bg-surface-container-high transition-colors cursor-pointer ${selectedNode?.id === node.id ? 'bg-surface-container' : ''}`}
                    onClick={() => setSelectedNode(node)}
                  >
                    <td className="p-3 border-r border-outline-variant font-bold text-on-surface">{node.name}</td>
                    <td className="p-3 border-r border-outline-variant uppercase text-[10px] text-on-surface-variant">{node.type}</td>
                    <td className="p-3 border-r border-outline-variant">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase
                        ${node.status === 'active' ? 'bg-emerald-500/10 text-emerald-400'
                          : node.status === 'error' ? 'bg-error/10 text-error'
                          : 'bg-outline-variant/20 text-on-surface-variant'}`}>
                        {node.status}
                      </span>
                    </td>
                    <td className="p-3 text-primary font-bold">{Object.values(node.metadata)[0] as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Inspector */}
      <aside className="w-64 border-l border-outline-variant bg-surface-container flex flex-col shrink-0">
        <div className="p-4 bg-surface border-b border-outline-variant">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Entity_Inspector</span>
        </div>
        {selectedNode ? (
          <div className="p-4 space-y-5 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <div className={`text-[9px] font-mono font-bold uppercase tracking-widest
                ${selectedNode.type === 'model' ? 'text-primary' : selectedNode.type === 'memory' ? 'text-secondary' : 'text-tertiary'}`}>
                {selectedNode.type}
              </div>
              <h3 className="text-base font-bold text-on-surface leading-tight">{selectedNode.name}</h3>
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase
                ${selectedNode.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : selectedNode.status === 'error' ? 'bg-error/10 text-error border border-error/20'
                  : 'bg-outline-variant/20 text-on-surface-variant border border-outline-variant'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedNode.status === 'active' ? 'bg-emerald-500 animate-pulse' : selectedNode.status === 'error' ? 'bg-error' : 'bg-outline-variant'}`} />
                {selectedNode.status}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant font-mono block">ID</span>
              <div className="bg-surface-container-lowest border border-outline-variant rounded p-2 font-mono text-[10px] text-on-surface break-all">
                {selectedNode.id}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant font-mono block">Detailed Metadata</span>
              <div className="bg-surface-container-lowest border border-outline-variant rounded p-3 font-mono text-[10px] space-y-2">
                {Object.entries(selectedNode.metadata).map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <span className="text-on-surface-variant truncate">{key}:</span>
                    <span className="text-primary font-bold shrink-0">{val as string}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-2.5 bg-primary/10 border border-primary/30 text-primary font-mono font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-primary hover:text-on-primary transition-all active:scale-95">
              Initialize_Diagnostic
            </button>
          </div>
        ) : (
          <div className="p-10 text-center text-on-surface-variant opacity-40 italic text-xs">
            Select a node to inspect
          </div>
        )}
      </aside>
    </div>
  );
};

const StreamItem = ({ id, logs, active = false, onClick, selected }: {
  id: string;
  logs?: string[];
  active?: boolean;
  onClick?: () => void;
  selected?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`p-3 bg-surface-container border rounded-xl transition-all cursor-pointer
      ${active ? 'border-primary/40' : 'border-outline-variant/50 opacity-60'}
      ${selected ? 'ring-1 ring-primary/60 bg-surface-container-high' : 'hover:bg-surface-container-high'}`}
  >
    <div className="flex justify-between mb-1.5">
      <span className={`font-mono text-[11px] font-bold truncate ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
        {id}
      </span>
      {active && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-1" />}
    </div>
    <div className="font-mono text-[10px] text-on-surface-variant/70 leading-tight space-y-0.5">
      {(logs || []).map((log: string, i: number) => (
        <div key={i}>&gt; {log}</div>
      ))}
    </div>
  </div>
);

const Indicator = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 ${color} rounded-sm opacity-80`} />
    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">{label}</span>
  </div>
);
