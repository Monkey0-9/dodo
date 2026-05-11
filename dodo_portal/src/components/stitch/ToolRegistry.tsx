import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export const ToolRegistry = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const data = await api.tools.list();
        setTools(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch tools:', error);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-mono-label text-xs uppercase tracking-widest text-on-surface-variant">Indexing Tool Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Tool Registry</h2>
          <p className="text-on-surface-variant mt-1 text-lg">{tools.length} active tools available. Configure orchestration capabilities and external integrations.</p>
        </div>
        <button className="flex items-center gap-2 bg-surface-container-high border border-outline-variant px-5 py-2.5 rounded-lg hover:bg-surface-bright transition-all active:scale-95 text-on-surface">
          <span className="material-symbols-outlined text-primary">add</span>
          <span className="font-mono-label uppercase tracking-widest text-[11px]">Add Tool</span>
        </button>
      </div>

      {/* Grid of Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tools.length > 0 ? tools.map((tool) => (
          <ToolCard 
            key={tool.id}
            title={tool.name} 
            category={tool.tool_type || 'FUNCTION'} 
            icon={tool.tool_type === 'mcp' ? 'hub' : 'code'} 
            status="READY" 
            version="v1.0.0" 
            success="100%" 
            latency="--" 
            active={true}
          />
        )) : (
          <div className="col-span-full py-20 text-center glass-panel rounded-3xl">
            <span className="material-symbols-outlined text-4xl text-white/10 mb-4">construction</span>
            <p className="text-white/30 font-bold uppercase tracking-widest text-xs">No tools registered in the current environment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ToolCard = ({ title, category, icon, status, version, success, latency, active, iconColor = "text-primary", statusColor = "bg-secondary/10 text-secondary" }: any) => (
  <div className="glass-panel rounded-xl p-5 hover:border-primary/50 transition-all group relative">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant group-hover:border-primary/30">
          <span className={`material-symbols-outlined ${iconColor} text-3xl`}>{icon}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-on-surface">{title}</h3>
          <span className="font-mono text-[10px] text-on-surface-variant uppercase bg-surface-container-high px-2 py-0.5 rounded tracking-wider">{category}</span>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input title={`Toggle ${title} active status`} checked={active} className="sr-only peer" type="checkbox" readOnly />
        <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`${statusColor} border border-current/20 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-widest`}>{status}</span>
        <span className="text-on-surface-variant font-mono text-[10px] uppercase">{version}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/30">
        <div>
          <p className="text-on-surface-variant font-mono text-[9px] uppercase tracking-widest">Success Rate</p>
          <p className="text-primary text-xl font-bold">{success}</p>
        </div>
        <div>
          <p className="text-on-surface-variant font-mono text-[9px] uppercase tracking-widest">Avg Latency</p>
          <p className="text-on-surface text-xl font-bold">{latency}</p>
        </div>
      </div>
    </div>
  </div>
);
