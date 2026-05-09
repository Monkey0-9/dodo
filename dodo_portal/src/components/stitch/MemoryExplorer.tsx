

export const MemoryExplorer = () => {
  return (
    <div className="space-y-6">
      {/* Feature Header & Controls */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container border border-outline-variant p-6 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-primary">Memory Intelligence</h2>
          <p className="font-mono text-xs text-on-surface-variant mt-1">4.2TB indexed across 12,000 entities. Real-time retrieval enabled.</p>
        </div>
        <div className="flex gap-2 relative z-10">
          <button className="flex items-center gap-2 bg-surface-container-high border border-outline-variant px-3 py-2 rounded-lg text-xs hover:border-primary transition-colors text-on-surface">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            Filter by agent
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
          <button className="flex items-center gap-2 bg-surface-container-high border border-outline-variant px-3 py-2 rounded-lg text-xs hover:border-primary transition-colors text-on-surface">
            <span className="material-symbols-outlined text-[18px]">priority_high</span>
            Filter by importance
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-linear-to-l from-primary/5 to-transparent pointer-events-none"></div>
      </section>

      {/* Main Content Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-[calc(100vh-320px)] min-h-[500px]">
        {/* Memory Graph (60%) */}
        <section className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Memory Graph Visualization
            </span>
            <div className="flex gap-2 text-on-surface-variant">
              <button className="p-1 hover:bg-surface-bright rounded"><span className="material-symbols-outlined text-[20px]">zoom_in</span></button>
              <button className="p-1 hover:bg-surface-bright rounded"><span className="material-symbols-outlined text-[20px]">zoom_out</span></button>
              <button className="p-1 hover:bg-surface-bright rounded"><span className="material-symbols-outlined text-[20px]">fullscreen</span></button>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden cursor-crosshair canvas-grid">
            <svg className="absolute inset-0 w-full h-full opacity-40">
              <line stroke="#4cd7f6" strokeDasharray="4" strokeWidth="1" x1="50%" x2="40%" y1="50%" y2="40%"></line>
              <line stroke="#d0bcff" strokeWidth="1" x1="50%" x2="60%" y1="50%" y2="45%"></line>
              <line stroke="#4cd7f6" strokeWidth="1" x1="50%" x2="55%" y1="50%" y2="65%"></line>
              <line stroke="#d0bcff" strokeWidth="1" x1="40%" x2="35%" y1="40%" y2="55%"></line>
              <line stroke="#4cd7f6" strokeWidth="1" x1="60%" x2="70%" y1="45%" y2="50%"></line>
            </svg>
            {/* Center Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
              <div className="w-6 h-6 rounded-full bg-primary-container shadow-[0_0_20px_rgba(76,215,246,0.6)] z-20 cursor-pointer"></div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest border border-primary px-3 py-1 rounded text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-on-surface">
                CORE_AGENT_01
              </div>
            </div>
            {/* Surrounding Nodes */}
            <div className="absolute top-[40%] left-[40%] w-4 h-4 rounded-full bg-tertiary-container shadow-[0_0_15px_rgba(208,188,255,0.4)] cursor-pointer hover:scale-125 transition-transform"></div>
            <div className="absolute top-[45%] left-[60%] w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(76,215,246,0.3)] cursor-pointer hover:scale-125 transition-transform"></div>
            <div className="absolute top-[65%] left-[55%] w-5 h-5 rounded-full bg-primary shadow-[0_0_15px_rgba(76,215,246,0.4)] cursor-pointer hover:scale-125 transition-transform"></div>
            <div className="absolute top-[55%] left-[35%] w-3 h-3 rounded-full bg-tertiary shadow-[0_0_10px_rgba(208,188,255,0.3)] cursor-pointer hover:scale-125 transition-transform"></div>
            <div className="absolute top-[50%] left-[70%] w-4 h-4 rounded-full bg-primary-container shadow-[0_0_12px_rgba(76,215,246,0.5)] cursor-pointer hover:scale-125 transition-transform"></div>
          </div>
        </section>

        {/* Recent Memories (40%) */}
        <section className="lg:col-span-4 flex flex-col bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="text-lg font-medium text-on-surface">Recent Memories</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <MemoryCard 
              time="T-Minus 12m" 
              importance={0.92} 
              content='Context detected shift in user preference regarding CI/CD pipeline structures. Agent adapted "Auto-Deploy" logic to prioritize container security scanning.' 
              icons={['smart_toy', 'shield']}
            />
            <MemoryCard 
              time="T-Minus 45m" 
              importance={0.45} 
              content="Logged intermittent latency spikes from US-EAST-1 node. Adjusted routing weight to minimize impact on real-time inference." 
              icons={['bolt']}
              dimmed
            />
            <MemoryCard 
              time="T-Minus 1h 22m" 
              importance={0.88} 
              content='Successfully synthesized 500+ documentation snippets into a unified "Vector-Native" architecture guideline for Agent-7.' 
              icons={['auto_stories']}
            />
          </div>
        </section>
      </div>

      {/* Retrieval History Heatmap */}
      <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-on-surface">Retrieval History</h3>
          <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">
            <span>Low Usage</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-surface-container-highest"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
              <div className="w-3 h-3 rounded-sm bg-primary"></div>
            </div>
            <span>Peak Intensity</span>
          </div>
        </div>
        <div className="grid grid-cols-24 gap-1.5 h-20">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="grid grid-rows-7 gap-1.5 h-full">
              {Array.from({ length: 7 }).map((_, j) => (
                <div 
                  key={j} 
                  className={`w-full rounded-sm ${Math.random() > 0.8 ? 'bg-primary' : Math.random() > 0.6 ? 'bg-primary/40' : 'bg-surface-container-highest'}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
          <span>Mon 12:00 AM</span>
          <span>Tue 12:00 AM</span>
        </div>
      </section>
    </div>
  );
};

const MemoryCard = ({ time, importance, content, icons, dimmed = false }: { time: string, importance: number, content: string, icons: string[], dimmed?: boolean }) => (
  <div className={`p-4 rounded-lg bg-surface-container-low border border-outline-variant hover:border-primary/50 transition-all group ${dimmed ? 'opacity-70' : ''}`}>
    <div className="flex justify-between items-start mb-3">
      <span className={`font-mono text-xs ${dimmed ? 'text-on-surface-variant' : 'text-primary'}`}>{time}</span>
      <div className={`flex items-center gap-1 ${dimmed ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary/10 text-primary'} px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider`}>
        Importance: {importance}
      </div>
    </div>
    <p className={`text-sm leading-relaxed mb-4 ${dimmed ? 'text-on-surface-variant' : 'text-on-surface'}`}>
      {content}
    </p>
    <div className="flex justify-between items-center">
      <div className="flex -space-x-2">
        {icons.map((icon, i) => (
          <div key={i} className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-[14px] text-on-surface">{icon}</span>
          </div>
        ))}
      </div>
      <button className={`flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest ${dimmed ? 'text-on-surface-variant hover:text-primary' : 'text-primary hover:underline'} transition-colors`}>
        Recall <span className="material-symbols-outlined text-[16px]">history</span>
      </button>
    </div>
  </div>
);
