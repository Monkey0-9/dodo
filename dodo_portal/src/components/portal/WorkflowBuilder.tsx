import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export const WorkflowBuilder = () => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState([
    { id: '1', x: 100, y: 240, type: 'Input', title: 'API Request', icon: 'login' },
    { id: '2', x: 500, y: 380, type: 'Agent', title: 'Data Scribe', icon: 'smart_toy', active: true },
    { id: '3', x: 1000, y: 280, type: 'Tool', title: 'SQL Query', icon: 'database' },
    { id: '4', x: 1000, y: 480, type: 'Branch', title: 'Condition', icon: 'alt_route' },
  ]);

  const addNode = (type: string, icon: string, title: string) => {
    const newNode = {
      id: Math.random().toString(36).substr(2, 9),
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      type,
      title,
      icon,
    };
    setNodes([...nodes, newNode]);
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
            onClick={() => alert('Workflow deployed successfully!')}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
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
            {/* Dynamic connections could be added here, currently static lines for aesthetics */}
            <path className="workflow-path" d="M 300 300 C 400 300, 400 450, 500 450" fill="none" stroke="#4cd7f6" strokeWidth="2" strokeDasharray="10"></path>
            <path d="M 800 450 C 900 450, 900 350, 1000 350" fill="none" stroke="#3d494c" strokeWidth="2"></path>
            <path d="M 800 450 C 900 450, 900 550, 1000 550" fill="none" stroke="#3d494c" strokeWidth="2"></path>
          </svg>
          {nodes.map((node) => (
            <WorkflowNode 
              key={node.id} 
              x={node.x} 
              y={node.y} 
              type={node.type} 
              title={node.title} 
              icon={node.icon} 
              active={node.active}
              constraintsRef={constraintsRef}
            />
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
            <button className="text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary material-fill">smart_toy</span>
              </div>
              <div>
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest">Current Selection</p>
                <h4 className="text-lg font-bold text-on-surface">Data Scribe</h4>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              An advanced reasoning agent specialized in synthesizing structured data into natural language summaries.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block">Model Configuration</span>
              <select title="Model Configuration" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-sm text-on-surface outline-none focus:border-primary">
                <option>gpt-4o (Active)</option>
                <option>claude-3-5-sonnet</option>
                <option>gemini-1.5-pro</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Temperature</label>
                <input title="Temperature" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-sm text-on-surface outline-none" type="number" defaultValue="0.7" step="0.1" />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Max Tokens</label>
                <input title="Max Tokens" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-sm text-on-surface outline-none" type="number" defaultValue="4096" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Retry Policy</span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">refresh</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-on-surface">Exponential Backoff</span>
              <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">3 Attempts</span>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-outline-variant flex gap-3">
          <button className="flex-1 bg-surface-container-highest border border-outline-variant py-2 rounded-lg font-bold text-sm hover:bg-surface-bright transition-colors text-on-surface">Clone</button>
          <button className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all">Update Node</button>
        </div>
      </aside>
    </div>
  );
};

const WorkflowNode = ({ x, y, type, title, icon, active = false, constraintsRef }: { x: number, y: number, type: string, title: string, icon: React.ReactNode, active?: boolean, constraintsRef?: React.RefObject<HTMLDivElement | null> }) => (
  <motion.div 
    drag
    dragConstraints={constraintsRef}
    dragMomentum={false}
    initial={{ x, y }}
    className={`absolute w-64 bg-surface-container-high border rounded-xl overflow-hidden shadow-xl transition-shadow cursor-move
      ${active ? 'border-primary shadow-[0_0_30px_rgba(76,215,246,0.3)] z-20' : 'border-outline-variant z-10'}`}
  >
    <div className={`p-3 border-b flex items-center justify-between ${active ? 'bg-primary/10 border-primary/20' : 'bg-surface-container-low border-outline-variant'}`}>
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined text-sm ${active ? 'text-primary material-fill' : 'text-on-surface-variant'}`}>{icon}</span>
        <span className={`font-mono text-[10px] uppercase tracking-widest ${active ? 'text-primary' : 'text-on-surface-variant'}`}>{type}</span>
      </div>
      {active && <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>}
    </div>
    <div className="p-4">
      <h3 className="text-sm font-bold text-on-surface">{title}</h3>
      <p className="text-[10px] text-on-surface-variant mt-1">Ready for execution</p>
    </div>
  </motion.div>
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
