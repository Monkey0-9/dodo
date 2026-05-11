import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export const AgentManagement = ({ onSelectAgent }: { onSelectAgent: (id: string) => void }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await api.agents.list();
        setAgents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-mono-label text-xs uppercase tracking-widest text-on-surface-variant">Synchronizing Grid...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Stats Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-1 text-[10px]">
            <span className="font-mono-label uppercase">Orchestration</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="font-mono-label uppercase text-primary">Autonomous Nodes</span>
          </div>
          <h2 className="text-3xl font-bold text-on-surface">Agent Fleet</h2>
        </div>
        <div className="flex gap-4">
          <StatBadge icon="bolt" label="Active Runtime" value="99.98%" color="text-primary" />
          <StatBadge icon="database" label="Total Memory" value="14.2 GB" color="text-secondary" />
        </div>
      </div>

      {/* Filter bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant text-sm">filter_list</span>
          <input 
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-9 pr-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none text-on-surface" 
            placeholder="Filter by name or UUID..." 
            type="text"
          />
        </div>
        <select title="Filter by Status" className="bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-sm text-on-surface-variant focus:ring-1 focus:ring-primary outline-none">
          <option>Status: All</option>
          <option>Active</option>
          <option>Idle</option>
          <option>Failed</option>
        </select>
        <div className="flex border border-outline-variant rounded-lg overflow-hidden">
          <button className="p-2 bg-surface-container-highest text-primary">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className="p-2 hover:bg-surface-variant/30 text-on-surface-variant">
            <span className="material-symbols-outlined">reorder</span>
          </button>
        </div>
      </div>

      {/* Technical DataTable */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-high/50">
                <th className="px-6 py-4 font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Agent Configuration</th>
                <th className="px-6 py-4 font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Status</th>
                <th className="px-6 py-4 font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Model Engine</th>
                <th className="px-6 py-4 font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Throughput</th>
                <th className="px-6 py-4 font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Memory</th>
                <th className="px-6 py-4 font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Last Pulse</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {agents.length > 0 ? agents.map((agent) => (
                <AgentRow 
                  key={agent.id} 
                  agent={agent} 
                  onSelect={() => onSelectAgent(agent.id)} 
                />
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-on-surface-variant font-mono-label uppercase text-xs tracking-widest">
                    No agents detected in active grid
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatBadge = ({ icon, label, value, color }: { icon: string, label: string, value: string, color: string }) => (
  <div className="bg-surface-container border border-outline-variant px-4 py-2 rounded-lg flex items-center gap-3">
    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    <div>
      <p className="font-mono-label text-[9px] text-on-surface-variant uppercase">{label}</p>
      <p className="font-mono-code text-xs text-on-surface">{value}</p>
    </div>
  </div>
);

const AgentRow = ({ agent, onSelect }: { agent: any, onSelect: () => void }) => (
  <tr 
    onClick={onSelect}
    className="group hover:bg-surface-bright/20 transition-colors cursor-pointer"
  >
    <td className="px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="material-symbols-outlined text-primary">psychology</span>
        </div>
        <div>
          <div className="font-medium text-on-surface">{agent.name}</div>
          <div className="font-mono text-[10px] text-on-surface-variant uppercase">ID: {agent.id.substring(0, 13)}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-5">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-medium text-emerald-400">Active</span>
      </div>
    </td>
    <td className="px-6 py-5">
      <span className="px-2 py-1 rounded bg-surface-container-high border border-outline-variant font-mono text-[10px] text-primary">
        {(agent.agent_type || 'v1').replace('_agent', '')}
      </span>
    </td>
    <td className="px-6 py-5">
      <div className="font-mono text-xs">8/10 <span className="text-on-surface-variant text-[10px]">tasks</span></div>
      <div className="w-24 h-1 bg-surface-variant rounded-full mt-2 overflow-hidden">
        <div className="bg-primary h-full w-[80%]"></div>
      </div>
    </td>
    <td className="px-6 py-5 text-xs font-mono">
      {agent.blocks?.length || 0} <span className="text-on-surface-variant text-[10px]">blocks</span>
    </td>
    <td className="px-6 py-5 text-xs font-mono text-on-surface-variant">
      {agent.last_run_completion ? new Date(agent.last_run_completion).toLocaleTimeString() : 'Never'}
    </td>
    <td className="px-6 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex gap-2 justify-end">
        <button className="p-2 hover:bg-surface-variant/50 rounded-lg text-on-surface-variant">
          <span className="material-symbols-outlined">terminal</span>
        </button>
        <button className="p-2 hover:bg-surface-variant/50 rounded-lg text-on-surface-variant">
          <span className="material-symbols-outlined">play_circle</span>
        </button>
        <button className="p-2 hover:bg-surface-variant/50 rounded-lg text-on-surface-variant">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </td>
  </tr>
);
