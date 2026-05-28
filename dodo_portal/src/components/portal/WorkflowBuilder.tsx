import { useState, useRef, useEffect } from 'react';
import { api } from '../../api/client';

export const WorkflowBuilder = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('2');
  const [nodes, setNodes] = useState<any[]>([
    { id: '1', x: 100, y: 240, type: 'Input', title: 'API Request', icon: 'login' },
    { id: '2', x: 500, y: 380, type: 'Agent', title: 'Data Scribe', icon: 'smart_toy', active: true, agentId: '' },
    { id: '3', x: 1000, y: 280, type: 'Tool', title: 'SQL Query', icon: 'database' },
    { id: '4', x: 1000, y: 480, type: 'Branch', title: 'Condition', icon: 'alt_route' },
  ]);

  const [connections, setConnections] = useState<any[]>([
    { from: '1', to: '2', active: true },
    { from: '2', to: '3' },
    { from: '2', to: '4' },
  ]);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const nodeStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await api.agents.list();
        setAgents(data || []);
        if (data && data.length > 0) {
          // Bind the first agent to our mock Agent node by default
          setNodes(prev => prev.map(n => {
            if (n.id === '2') {
              return { ...n, title: data[0].name, agentId: data[0].id };
            }
            return n;
          }));
        }
      } catch (err) {
        console.error("Failed to fetch agents for workflow builder", err);
      }
    };
    fetchAgents();
  }, []);

  const addNode = (type: string, icon: string, title: string) => {
    const newNode = {
      id: Math.random().toString(36).substr(2, 9),
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      type,
      title,
      icon,
      agentId: type === 'Agent' && agents.length > 0 ? agents[0].id : '',
    };
    setNodes([...nodes, newNode]);
    setSelectedNodeId(newNode.id);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const updateSelectedNodeAgent = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNodeId) {
        return { ...n, title: agent.name, agentId: agent.id };
      }
      return n;
    }));
  };

  const addConnection = (fromId: string, toId: string) => {
    if (connections.some(c => c.from === fromId && c.to === toId)) return;
    setConnections([...connections, { from: fromId, to: toId }]);
  };

  const removeConnection = (fromId: string, toId: string) => {
    setConnections(connections.filter(c => !(c.from === fromId && c.to === toId)));
  };

  const handlePointerDown = (id: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input')) {
      return;
    }
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingNodeId(id);
    setSelectedNodeId(id);
    const node = nodes.find(n => n.id === id);
    if (node) {
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      nodeStartPos.current = { x: node.x, y: node.y };
    }
  };

  const handlePointerMove = (id: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingNodeId !== id) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          x: nodeStartPos.current.x + dx,
          y: nodeStartPos.current.y + dy
        };
      }
      return n;
    }));
  };

  const handlePointerUp = (id: string, e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingNodeId === id) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDraggingNodeId(null);
    }
  };

  const getBezierPath = (startX: number, startY: number, endX: number, endY: number) => {
    const controlOffset = Math.max(100, Math.abs(endX - startX) * 0.5);
    return `M ${startX} ${startY} C ${startX + controlOffset} ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;
  };

  const handleDeploy = async () => {
    try {
      // Find all agent IDs from Agent type nodes
      const agentIds = nodes
        .filter(n => n.type === 'Agent' && n.agentId)
        .map(n => n.agentId);

      if (agentIds.length === 0) {
        alert("Please configure at least one Agent node with a valid fleet agent before deploying.");
        return;
      }

      const resp = await api.groups.create({
        agent_ids: agentIds,
        description: `Workflow Canvas orchestrator with ${agentIds.length} agents`,
        manager_config: { manager_type: "round_robin" }
      });
      alert(`Workflow deployed successfully! Multi-Agent Group ID: ${resp.id}`);
    } catch (e: any) {
      alert(`Failed to deploy workflow: ${e.message}`);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-background -m-6">
      {/* Canvas Header / Toolbar */}
      <div className="absolute top-0 left-0 right-0 p-6 z-30 pointer-events-none flex justify-between items-start">
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="bg-surface-container/90 backdrop-blur-lg border border-outline-variant rounded-xl p-4 shadow-xl">
            <h2 className="text-xl font-bold text-on-surface">Agent Orchestration Canvas</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Status: Live Execution</span>
            </div>
          </div>
          {/* Zoom/Pan Controls */}
          <div className="bg-surface-container/90 backdrop-blur-lg border border-outline-variant rounded-lg p-1 flex shadow-lg">
            <button className="p-2 hover:bg-surface-bright rounded text-on-surface-variant"><span className="material-symbols-outlined">zoom_in</span></button>
            <button title="Current Zoom Level" className="p-2 hover:bg-surface-bright rounded text-on-surface-variant font-mono text-xs">85%</button>
            <button className="p-2 hover:bg-surface-bright rounded text-on-surface-variant"><span className="material-symbols-outlined">zoom_out</span></button>
            <div className="w-px bg-outline-variant mx-1"></div>
            <button className="p-2 hover:bg-surface-bright rounded text-on-surface-variant"><span className="material-symbols-outlined">center_focus_strong</span></button>
          </div>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <button 
            onClick={handleDeploy}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined material-fill">rocket_launch</span>
            Deploy Workflow
          </button>
          {/* Mini Map */}
          <div className="w-48 h-32 bg-surface-container-low/90 backdrop-blur-lg border border-outline-variant rounded-xl overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0 opacity-20 grid-dots-sm"></div>
            <div className="absolute w-full h-full p-2">
              <div className="w-full h-full border border-primary/30 rounded bg-primary/5 flex items-center justify-center">
                <div className="space-y-1">
                  <div className="flex gap-1 justify-center"><div className="w-2 h-2 bg-primary rounded-sm opacity-50"></div><div className="w-2 h-2 bg-primary rounded-sm opacity-50"></div></div>
                  <div className="flex gap-1 justify-center"><div className="w-2 h-2 bg-primary rounded-sm opacity-50"></div><div className="w-2 h-2 bg-primary rounded-sm opacity-50"></div><div className="w-2 h-2 bg-primary rounded-sm opacity-50"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Visual Graph Area */}
      <div 
        ref={constraintsRef}
        className="absolute inset-0 z-10 overflow-auto cursor-grab active:cursor-grabbing canvas-grid"
      >
        <div className="w-[2000px] h-[2000px] relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              const startX = fromNode.x + 256;
              const startY = fromNode.y + 60;
              const endX = toNode.x;
              const endY = toNode.y + 60;
              
              const pathData = getBezierPath(startX, startY, endX, endY);
              
              return (
                <path
                  key={idx}
                  className={conn.active ? 'workflow-path' : ''}
                  d={pathData}
                  fill="none"
                  stroke={conn.active ? '#4cd7f6' : '#3d494c'}
                  strokeWidth="2"
                  strokeDasharray={conn.active ? '10' : undefined}
                />
              );
            })}
          </svg>
          {nodes.map((node) => (
            <div key={node.id} onClick={() => setSelectedNodeId(node.id)}>
              <WorkflowNode 
                id={node.id}
                x={node.x} 
                y={node.y} 
                type={node.type} 
                title={node.title} 
                icon={node.icon} 
                active={node.id === selectedNodeId}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Left Palette Sidebar */}
      <div className="absolute top-[180px] left-6 bottom-6 w-14 bg-surface-container/80 backdrop-blur-lg border border-outline-variant rounded-full py-6 flex flex-col items-center gap-6 z-30 shadow-2xl">
        <PaletteIcon icon="login" label="Trigger" onClick={() => addNode('Input', 'login', 'New Trigger')} />
        <PaletteIcon icon="smart_toy" label="Agent" onClick={() => addNode('Agent', 'smart_toy', 'New Agent')} />
        <PaletteIcon icon="construction" label="Tool" onClick={() => addNode('Tool', 'construction', 'New Tool')} />
        <PaletteIcon icon="alt_route" label="Logic" onClick={() => addNode('Branch', 'alt_route', 'New Logic')} />
        <PaletteIcon icon="logout" label="Output" onClick={() => addNode('Output', 'logout', 'New Output')} />
      </div>

      {/* Right Inspector Sidebar */}
      <aside className="absolute top-0 right-0 bottom-0 w-80 bg-surface-container-low/95 backdrop-blur-xl border-l border-outline-variant z-40 flex flex-col">
        <div className="p-6 border-b border-outline-variant bg-surface-container-high/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-on-surface">Node Inspector</h3>
            <button className="text-on-surface-variant hover:text-on-surface" onClick={() => setSelectedNodeId(null)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {selectedNode ? (
            <>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary material-fill">{selectedNode.icon}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-primary uppercase tracking-widest">Current Selection</p>
                    <h4 className="text-lg font-bold text-on-surface">{selectedNode.title}</h4>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Type: {selectedNode.type} Node. Configure properties below.
                </p>
              </div>

              {selectedNode.type === 'Agent' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">Select Agent Unit</span>
                    {agents.length > 0 ? (
                      <select 
                        title="Bind Agent" 
                        value={selectedNode.agentId || ''} 
                        onChange={(e) => updateSelectedNodeAgent(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-sm text-on-surface outline-none focus:border-primary"
                      >
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.id.substring(0, 8)})</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs italic text-on-surface-variant">No active agents in database. Deploy an agent first.</div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">Fallback Model</span>
                  <select title="Model Configuration" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-sm text-on-surface outline-none focus:border-primary">
                    <option>gpt-4o (Active)</option>
                    <option>claude-3-5-sonnet</option>
                    <option>gemini-1.5-pro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 border-t border-outline-variant pt-6 mt-6">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">Outbound Connections</span>
                
                {/* List existing outbound connections */}
                <div className="space-y-2">
                  {connections.filter(c => c.from === selectedNodeId).map((c, idx) => {
                    const target = nodes.find(n => n.id === c.to);
                    return (
                      <div key={idx} className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-xs">
                        <span className="text-on-surface font-medium">{target ? target.title : `Node ${c.to}`}</span>
                        <button 
                          onClick={() => removeConnection(c.from, c.to)}
                          className="text-error hover:text-error/80 text-xs font-bold"
                        >
                          Disconnect
                        </button>
                      </div>
                    );
                  })}
                  {connections.filter(c => c.from === selectedNodeId).length === 0 && (
                    <div className="text-xs italic text-on-surface-variant">No outbound connections.</div>
                  )}
                </div>

                {/* Dropdown to add a connection */}
                <div className="space-y-2">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">Connect to Node</span>
                  <select 
                    title="Connect to Node"
                    value=""
                    onChange={(e) => {
                      if (e.target.value && selectedNodeId) {
                        addConnection(selectedNodeId, e.target.value);
                        e.target.value = ""; // Reset
                      }
                    }}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-sm text-on-surface outline-none focus:border-primary"
                  >
                    <option value="">-- Select node to connect --</option>
                    {nodes
                      .filter(n => n.id !== selectedNodeId && !connections.some(c => c.from === selectedNodeId && c.to === n.id))
                      .map(n => (
                        <option key={n.id} value={n.id}>{n.title} ({n.type})</option>
                      ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-on-surface-variant opacity-40 italic text-xs">
              Select a canvas node to inspect details
            </div>
          )}
        </div>
        <div className="p-6 border-t border-outline-variant flex gap-3">
          <button className="flex-1 bg-surface-container-highest border border-outline-variant py-2 rounded-lg font-bold text-sm hover:bg-surface-bright transition-colors text-on-surface">Clone</button>
          <button className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all">Update Node</button>
        </div>
      </aside>
    </div>
  );
};

const WorkflowNode = ({ 
  id, 
  x, 
  y, 
  type, 
  title, 
  icon, 
  active = false, 
  onPointerDown,
  onPointerMove,
  onPointerUp
}: { 
  id: string, 
  x: number, 
  y: number, 
  type: string, 
  title: string, 
  icon: string, 
  active?: boolean, 
  onPointerDown: (id: string, e: React.PointerEvent<HTMLDivElement>) => void,
  onPointerMove: (id: string, e: React.PointerEvent<HTMLDivElement>) => void,
  onPointerUp: (id: string, e: React.PointerEvent<HTMLDivElement>) => void
}) => (
  <div 
    onPointerDown={(e) => onPointerDown(id, e)}
    onPointerMove={(e) => onPointerMove(id, e)}
    onPointerUp={(e) => onPointerUp(id, e)}
    style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
    className={`absolute w-64 bg-surface-container-high border rounded-xl overflow-hidden shadow-xl transition-shadow cursor-move select-none
      ${active ? 'border-primary shadow-[0_0_30px_rgba(76,215,246,0.3)] z-20' : 'border-outline-variant z-10'}`}
  >
    <div className={`p-3 border-b flex items-center justify-between ${active ? 'bg-primary/10 border-primary/20' : 'bg-surface-container-low border-outline-variant'}`}>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-sm text-primary material-fill">{icon}</span>
        <span className={`font-mono text-[10px] uppercase tracking-widest ${active ? 'text-primary' : 'text-on-surface-variant'}`}>{type}</span>
      </div>
      {active && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>}
    </div>
    <div className="p-4">
      <h3 className="text-sm font-bold text-on-surface">{title}</h3>
      <p className="text-[10px] text-on-surface-variant mt-1">Ready for execution</p>
    </div>
  </div>
);

const PaletteIcon = ({ icon, label, onClick }: { icon: string, label: string, onClick: () => void }) => (
  <div className="group relative">
    <button 
      onClick={onClick}
      className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-colors"
    >
      {icon}
    </button>
    <span className="absolute left-16 bg-surface p-2 rounded border border-outline-variant text-[10px] font-mono uppercase tracking-widest invisible group-hover:visible whitespace-nowrap text-on-surface shadow-xl">
      {label}
    </span>
  </div>
);
