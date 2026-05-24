import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { TopologyData, TopologyNode } from '../../api/types';

export const Topology = () => {
  const [data, setData] = useState<TopologyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);

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
      <aside className="w-80 flex flex-col border-r border-outline-variant bg-surface-container-lowest">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Active Intelligence Streams</span>
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#4cd7f6]"></span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {data.nodes.filter(n => n.type === 'agent').map(agent => (
            <StreamItem 
              key={agent.id}
              id={agent.name} 
              latency="0.12ms" 
              logs={['STREAMING_ACTIVE', 'HEARTBEAT_OK']} 
              active={agent.status === 'active'} 
            />
          ))}
          <div className="p-4 bg-surface-container/30 border border-outline-variant/30 rounded-xl opacity-40 italic text-[10px] text-center">
            End of active streams
          </div>
        </div>
        {/* Knowledge Indexing Status Bar */}
        <div className="p-6 bg-surface border-t border-outline-variant">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Knowledge Indexing</span>
            <span className="text-xs font-mono text-primary font-bold">74.2%</span>
          </div>
          <div className="h-1 bg-outline-variant w-full overflow-hidden rounded-full">
            <div className="h-full bg-primary w-[74.2%] transition-all duration-1000"></div>
          </div>
        </div>
      </aside>

      {/* Center Stage: Topology Map */}
      <div className="flex-1 relative overflow-hidden canvas-grid flex flex-col">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative w-full h-full border border-outline-variant bg-surface/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
            {/* Layer Indicators */}
            <div className="absolute top-4 left-4 space-y-2 z-20">
              <Indicator color="bg-primary" label="Central Models" />
              <Indicator color="bg-secondary" label="Memory Clusters" />
              <Indicator color="bg-tertiary" label="Active Agents" />
            </div>

            {/* Schematic Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
               <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-tertiary/10"></div>
            </div>

            {/* Custom UI Node Overlays */}
            {data.nodes.map((node, i) => {
              const x = 20 + (i * 30) % 60;
              const y = 20 + (i * 20) % 60;
              
              return (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`absolute p-4 backdrop-blur-md border-2 rounded-xl shadow-lg z-10 cursor-pointer transition-all hover:scale-105
                    ${node.type === 'model' ? 'border-primary bg-surface/90 w-56' : 
                      node.type === 'memory' ? 'border-secondary bg-surface/80 w-40' : 'border-tertiary bg-surface/80 w-40'}
                    ${selectedNode?.id === node.id ? 'ring-2 ring-white/20 scale-105' : ''}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-widest border-b border-outline-variant pb-2 mb-2 font-mono
                    ${node.type === 'model' ? 'text-primary' : node.type === 'memory' ? 'text-secondary' : 'text-tertiary'}`}>
                    {node.name}
                  </div>
                  <div className="space-y-1">
                    {Object.entries(node.metadata).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="font-mono text-[9px] text-on-surface-variant uppercase">{key}</span> 
                        <span className="font-mono text-[10px] text-on-surface font-bold">{val as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Connection Lines (SVG) - Simplified Auto-mapping */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <circle cx="50%" cy="50%" r="150" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" strokeDasharray="10 10" className="animate-spin-slow" />
              {data.links.map((link, i) => (
                <line 
                  key={i}
                  x1="50%" y1="50%" x2="25%" y2="25%" 
                  stroke={link.type === 'data' ? 'var(--color-secondary)' : 'var(--color-tertiary)'} 
                  strokeWidth="1" strokeDasharray="4 4" 
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Bottom Drawer: Latency Matrix */}
        <div className="mt-auto h-80 border-t border-outline-variant bg-surface flex flex-col z-30">
          <div className="flex items-center justify-between px-6 py-3 border-b border-outline-variant bg-surface-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-lg">monitoring</span>
              <h4 className="text-[10px] font-bold uppercase tracking-widest font-mono">System_Performance_Matrix</h4>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-0 no-scrollbar">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead className="sticky top-0 bg-surface-container-low border-b border-outline-variant z-10">
                <tr>
                  <th className="p-4 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">Entity_ID</th>
                  <th className="p-4 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">Type</th>
                  <th className="p-4 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">Status</th>
                  <th className="p-4 text-on-surface-variant font-bold uppercase tracking-widest">Performance_Metric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {data.nodes.map(node => (
                  <tr key={node.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="p-4 border-r border-outline-variant font-bold text-on-surface">{node.id}</td>
                    <td className="p-4 border-r border-outline-variant uppercase text-[10px]">{node.type}</td>
                    <td className="p-4 border-r border-outline-variant">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${node.status === 'active' ? 'bg-success/10 text-success' : 'bg-on-surface-variant/10 text-on-surface-variant'}`}>
                        {node.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-primary-fixed-dim">
                      {Object.values(node.metadata)[0] as string}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Inspector Panel */}
      <aside className="w-80 border-l border-outline-variant bg-surface-container flex flex-col">
        <div className="p-6 bg-surface border-b border-outline-variant">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Entity_Inspector</span>
        </div>
        {selectedNode ? (
          <div className="p-6 space-y-8 flex-1 overflow-y-auto no-scrollbar">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-primary">{selectedNode.name}</h3>
              <div className="grid grid-cols-2 gap-2">
                <MetadataBox label="ID" value={selectedNode.id} />
                <MetadataBox label="Status" value={selectedNode.status.toUpperCase()} />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Detailed_Metadata</span>
              <div className="bg-surface-container-lowest p-4 border border-outline-variant font-mono text-[10px] space-y-3 rounded-lg">
                {Object.entries(selectedNode.metadata).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-on-surface-variant">{key}:</span>
                    <span className="text-primary">{val as string}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-4 bg-primary/10 border border-primary/30 text-primary font-mono font-bold text-xs uppercase tracking-widest rounded hover:bg-primary hover:text-on-primary transition-all">
              Initialize_Diagnostic
            </button>
          </div>
        ) : (
          <div className="p-12 text-center text-on-surface-variant opacity-40 italic text-xs">
            Select a node to inspect details
          </div>
        )}
      </aside>
    </div>
  );
};

const StreamItem = ({ id, latency, logs, active = false }: { id: string, latency: string, logs?: any[], active?: boolean }) => (
  <div className={`p-4 bg-surface-container border border-outline-variant rounded-xl transition-all ${active ? 'ring-1 ring-primary/30' : 'opacity-60'}`}>
    <div className="flex justify-between mb-2">
      <span className={`font-mono text-[11px] font-bold ${active ? 'text-primary' : 'text-on-surface-variant'}`}>{id}</span>
      <span className="font-mono text-[9px] text-on-surface-variant uppercase">{latency}</span>
    </div>
    <div className="font-mono text-[10px] text-on-surface-variant/80 leading-tight space-y-1">
      {(logs || []).map((log: string, i: number) => (
        <div key={i}>&gt; {log}</div>
      ))}
    </div>
  </div>
);

const Indicator = ({ color, label }: { color: string, label: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${color} border border-white/10 rounded-sm`}></div>
    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface font-mono">{label}</span>
  </div>
);

const MetadataBox = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="bg-surface p-3 border border-outline-variant rounded-lg">
    <div className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant font-mono mb-1">{label}</div>
    <div className="font-mono text-xs font-bold text-on-surface">{value}</div>
  </div>
);
