import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../../api/client';
import type { TopologyData, TopologyNode } from '../../api/types';

// --- Simple force-directed layout (no external deps) ---
type Vec2 = { x: number; y: number };

function computeForceLayout(
  nodeIds: string[],
  links: { source: string; target: string }[],
  width = 600,
  height = 400,
  iterations = 120,
): Map<string, Vec2> {
  const pos = new Map<string, Vec2>();
  const angle = (Math.PI * 2) / nodeIds.length;
  nodeIds.forEach((id, i) => {
    pos.set(id, {
      x: width / 2 + (width / 3) * Math.cos(i * angle),
      y: height / 2 + (height / 3) * Math.sin(i * angle),
    });
  });

  const k = Math.sqrt((width * height) / nodeIds.length);
  const linkMap = new Map<string, string[]>();
  nodeIds.forEach(id => linkMap.set(id, []));
  links.forEach(l => {
    linkMap.get(l.source)?.push(l.target);
    linkMap.get(l.target)?.push(l.source);
  });

  for (let iter = 0; iter < iterations; iter++) {
    const disp = new Map<string, Vec2>();
    nodeIds.forEach(id => disp.set(id, { x: 0, y: 0 }));

    // Repulsion
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const u = nodeIds[i], v = nodeIds[j];
        const pu = pos.get(u)!, pv = pos.get(v)!;
        const dx = pu.x - pv.x, dy = pu.y - pv.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
        const force = (k * k) / dist;
        const du = disp.get(u)!;
        const dv = disp.get(v)!;
        du.x += (dx / dist) * force;
        du.y += (dy / dist) * force;
        dv.x -= (dx / dist) * force;
        dv.y -= (dy / dist) * force;
      }
    }

    // Attraction
    links.forEach(({ source, target }) => {
      const pu = pos.get(source), pv = pos.get(target);
      if (!pu || !pv) return;
      const dx = pu.x - pv.x, dy = pu.y - pv.y;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1);
      const force = (dist * dist) / k;
      const du = disp.get(source)!;
      const dv = disp.get(target)!;
      du.x -= (dx / dist) * force;
      du.y -= (dy / dist) * force;
      dv.x += (dx / dist) * force;
      dv.y += (dy / dist) * force;
    });

    // Apply displacements with cooling
    const temp = width / (iter + 1);
    nodeIds.forEach(id => {
      const p = pos.get(id)!;
      const d = disp.get(id)!;
      const dLen = Math.max(Math.sqrt(d.x * d.x + d.y * d.y), 0.1);
      p.x += (d.x / dLen) * Math.min(dLen, temp);
      p.y += (d.y / dLen) * Math.min(dLen, temp);
      // Clamp within canvas
      p.x = Math.min(width - 80, Math.max(80, p.x));
      p.y = Math.min(height - 60, Math.max(60, p.y));
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
  const [layout, setLayout] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [canvasSize, setCanvasSize] = useState({ w: 600, h: 400 });

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

  // Observe canvas size
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setCanvasSize({ w: Math.max(width, 200), h: Math.max(height, 200) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const getCoords = useCallback((nodeId: string) => {
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

  return (
    <div className="flex h-full overflow-hidden -m-8">
      {/* Left Sidebar: Intelligence Streams */}
      <aside className="w-72 flex flex-col border-r border-outline-variant bg-surface-container-lowest shrink-0">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Active Streams</span>
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#4cd7f6]"></span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {data.nodes.filter(n => n.type === 'agent').map(agent => (
            <StreamItem
              key={agent.id}
              id={agent.name}
              logs={['STREAMING_ACTIVE', 'HEARTBEAT_OK']}
              active={agent.status === 'active'}
            />
          ))}
          <div className="p-3 bg-surface-container/30 border border-outline-variant/30 rounded-xl opacity-40 italic text-[10px] text-center">
            End of active streams
          </div>
        </div>
        <div className="p-4 bg-surface border-t border-outline-variant">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Knowledge Indexing</span>
            <span className="text-xs font-mono text-primary font-bold">74.2%</span>
          </div>
          <div className="h-1 bg-outline-variant w-full overflow-hidden rounded-full">
            <div className="h-full bg-primary w-[74.2%] transition-all duration-1000"></div>
          </div>
        </div>
      </aside>

      {/* Center Stage: Topology Map */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
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

          {/* Schematic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-tertiary/5 pointer-events-none" />

          {/* Layer Legend */}
          <div className="absolute top-4 left-4 space-y-1.5 z-20">
            <Indicator color="bg-primary" label="Central Models" />
            <Indicator color="bg-secondary" label="Memory Clusters" />
            <Indicator color="bg-tertiary" label="Active Agents" />
          </div>

          {/* Connection Lines (SVG overlay) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            {data.links.map((link, i) => {
              const s = getCoords(link.source);
              const t = getCoords(link.target);
              const mx = (s.x + t.x) / 2;
              const my = (s.y + t.y) / 2 - 30;
              return (
                <path
                  key={i}
                  d={`M ${s.x} ${s.y} Q ${mx} ${my} ${t.x} ${t.y}`}
                  fill="none"
                  stroke={link.type === 'data' ? 'var(--color-secondary)' : 'var(--color-tertiary)'}
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                  opacity="0.5"
                  filter="url(#glow)"
                />
              );
            })}
          </svg>

          {/* Node Cards */}
          {data.nodes.map(node => {
            const pos = getCoords(node.id);
            const isModel = node.type === 'model';
            const isMem = node.type === 'memory';
            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`absolute z-10 cursor-pointer select-none transition-all duration-200 hover:scale-105 
                  ${isModel ? 'w-52' : 'w-36'}`}
                style={{
                  left: pos.x - (isModel ? 104 : 72),
                  top: pos.y - (isModel ? 44 : 36),
                }}
              >
                <div className={`backdrop-blur-md border-2 rounded-xl shadow-lg p-3
                  ${isModel ? 'border-primary bg-surface/90' :
                    isMem ? 'border-secondary bg-surface/80' : 'border-tertiary bg-surface/80'}
                  ${selectedNode?.id === node.id ? 'ring-2 ring-white/20 scale-105' : ''}`}>
                  <div className={`text-[9px] font-bold uppercase tracking-widest border-b border-outline-variant pb-1 mb-1.5 font-mono truncate
                    ${isModel ? 'text-primary' : isMem ? 'text-secondary' : 'text-tertiary'}`}>
                    {node.name}
                  </div>
                  <div className="space-y-0.5">
                    {Object.entries(node.metadata).slice(0, 2).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center gap-1">
                        <span className="font-mono text-[8px] text-on-surface-variant uppercase truncate">{key}</span>
                        <span className="font-mono text-[9px] text-on-surface font-bold shrink-0">{val as string}</span>
                      </div>
                    ))}
                  </div>
                  {/* Status dot */}
                  <div className="absolute -top-1.5 -right-1.5">
                    <div className={`w-3 h-3 rounded-full border-2 border-surface ${node.status === 'active' ? 'bg-emerald-500' : node.status === 'error' ? 'bg-error' : 'bg-outline-variant'}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Drawer: Performance Matrix */}
        <div className="h-64 border-t border-outline-variant bg-surface flex flex-col shrink-0 z-30">
          <div className="flex items-center justify-between px-5 py-2 border-b border-outline-variant bg-surface-container shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">monitoring</span>
              <h4 className="text-[10px] font-bold uppercase tracking-widest font-mono">System_Performance_Matrix</h4>
            </div>
            <span className="text-[9px] text-on-surface-variant font-mono">{data.nodes.length} nodes • {data.links.length} links</span>
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
                    <td className="p-3 border-r border-outline-variant uppercase text-[10px]">{node.type}</td>
                    <td className="p-3 border-r border-outline-variant">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${node.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : node.status === 'error' ? 'bg-error/10 text-error' : 'bg-on-surface-variant/10 text-on-surface-variant'}`}>
                        {node.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-primary-fixed-dim">{Object.values(node.metadata)[0] as string}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Inspector Panel */}
      <aside className="w-72 border-l border-outline-variant bg-surface-container flex flex-col shrink-0">
        <div className="p-4 bg-surface border-b border-outline-variant">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Entity_Inspector</span>
        </div>
        {selectedNode ? (
          <div className="p-5 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary truncate">{selectedNode.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                <MetadataBox label="ID" value={selectedNode.id} />
                <MetadataBox label="Status" value={selectedNode.status.toUpperCase()} />
              </div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Detailed_Metadata</span>
              <div className="bg-surface-container-lowest p-3 border border-outline-variant font-mono text-[10px] space-y-2 rounded-lg">
                {Object.entries(selectedNode.metadata).map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <span className="text-on-surface-variant truncate">{key}:</span>
                    <span className="text-primary font-bold shrink-0">{val as string}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full py-3 bg-primary/10 border border-primary/30 text-primary font-mono font-bold text-xs uppercase tracking-widest rounded hover:bg-primary hover:text-on-primary transition-all">
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

const StreamItem = ({ id, logs, active = false }: { id: string; logs?: string[]; active?: boolean }) => (
  <div className={`p-3 bg-surface-container border border-outline-variant rounded-xl transition-all ${active ? 'ring-1 ring-primary/30' : 'opacity-60'}`}>
    <div className="flex justify-between mb-1.5">
      <span className={`font-mono text-[11px] font-bold truncate ${active ? 'text-primary' : 'text-on-surface-variant'}`}>{id}</span>
      {active && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 mt-1" />}
    </div>
    <div className="font-mono text-[10px] text-on-surface-variant/80 leading-tight space-y-0.5">
      {(logs || []).map((log: string, i: number) => (
        <div key={i}>&gt; {log}</div>
      ))}
    </div>
  </div>
);

const Indicator = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2.5 h-2.5 ${color} border border-white/10 rounded-sm`}></div>
    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface font-mono">{label}</span>
  </div>
);

const MetadataBox = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-surface p-2.5 border border-outline-variant rounded-lg">
    <div className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant font-mono mb-0.5">{label}</div>
    <div className="font-mono text-xs font-bold text-on-surface truncate">{value}</div>
  </div>
);
