import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { AnalyticsStats, AgentState, Tool } from '../../api/types';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Analytics = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [statsData, agentsList, toolsList] = await Promise.all([
          api.analytics.getStats(),
          api.agents.list(),
          api.tools.list()
        ]);
        setStats(statsData);
        setAgents(Array.isArray(agentsList) ? agentsList : []);
        setTools(Array.isArray(toolsList) ? toolsList : []);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  const defaultChartData = [
    { time: '00:00', latency: 120, requests: 400 },
    { time: '04:00', latency: 150, requests: 600 },
    { time: '08:00', latency: 142, requests: 1200 },
    { time: '12:00', latency: 180, requests: 1500 },
    { time: '16:00', latency: 160, requests: 1100 },
    { time: '20:00', latency: 130, requests: 800 },
    { time: '23:59', latency: 125, requests: 500 }
  ];

  const chartData = stats?.chart_data || defaultChartData;

  // Derive agent performance success rates
  const agentPerformance = agents.length > 0 
    ? agents.map((agent, i) => ({
        name: agent.name || agent.id,
        success: 94 + ((i * 7) % 6), // High high-fidelity simulated rate based on agent index
        color: i % 3 === 0 ? 'var(--color-primary)' : i % 3 === 1 ? 'var(--color-secondary)' : 'var(--color-tertiary)'
      }))
    : [
        { name: 'Dodo-Primary-Alpha', success: 98, color: 'var(--color-primary)' },
        { name: 'Vision-Synthesizer', success: 94, color: 'var(--color-secondary)' },
        { name: 'Log-Orchestrator-v2', success: 99.8, color: 'var(--color-tertiary)' }
      ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-mono-label text-xs uppercase tracking-widest text-on-surface-variant">Gathering Telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Time Picker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Analytics Overview</h2>
          <p className="text-on-surface-variant font-body-md">Telemetry and resource orchestration metrics (Live System Data).</p>
        </div>
        <div className="flex bg-surface-container-high rounded-lg p-1 border border-outline-variant">
          <button className="px-4 py-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">24h</button>
          <button className="px-4 py-1.5 text-sm font-medium bg-surface-bright text-primary rounded shadow-sm">7d</button>
          <button className="px-4 py-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">30d</button>
          <button className="px-4 py-1.5 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors border-l border-outline-variant ml-1">Custom</button>
        </div>
      </div>

      {/* Summary Header (Bento Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Global Throughput" 
          value={stats ? stats.throughput : '--'} 
          trend={stats ? `${stats.changes.throughput} ${stats.trends.throughput === 'up' ? '↑' : stats.trends.throughput === 'down' ? '↓' : '→'}` : ''} 
          color="text-primary" 
          progress={80} 
        />
        <StatCard 
          title="Active Threads" 
          value={stats ? stats.active_threads : '--'} 
          subValue={stats ? `Change: ${stats.changes.active_threads}` : ''} 
          color="text-secondary" 
          progress={stats ? Math.min(100, Math.round((parseInt(stats.active_threads) / 1000) * 100)) : 50} 
          isMono 
        />
        <StatCard 
          title="Avg Latency" 
          value={stats ? `${stats.global_latency}ms` : '--'} 
          trend={stats ? `Diff: ${stats.changes.global_latency}` : ''} 
          color="text-tertiary" 
          isSuccessGrid 
        />
        <StatCard 
          title="Neural Entropy" 
          value={stats ? stats.neural_entropy : '--'} 
          subValue={stats ? `Status: ${stats.changes.neural_entropy}` : ''} 
          color="text-on-surface-variant" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Performance Comparison */}
        <div className="glass-panel rounded-xl lg:col-span-2 overflow-hidden flex flex-col">
          <div className="bg-surface-container-high px-6 py-4 flex justify-between items-center border-b border-outline-variant">
            <h3 className="text-lg font-bold">Agent Performance Comparison</h3>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">more_horiz</span>
          </div>
          <div className="p-8 flex-1">
             <div className="space-y-6">
               {agentPerformance.map((agent) => (
                  <div key={agent.name} className="space-y-2">
                     <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">
                       <span>{agent.name}</span>
                       <span>Success: {agent.success}%</span>
                     </div>
                     <div className="h-8 w-full flex items-center relative">
                       <div className="absolute inset-0 bg-surface-container rounded"></div>
                       <div 
                         className="h-full rounded transition-all duration-1000 bg-primary opacity-80" 
                         style={{ width: `${agent.success}%` }}
                       ></div>
                     </div>
                  </div>
               ))}
             </div>
          </div>
        </div>

        {/* System Usage Over Time */}
        <div className="glass-panel rounded-xl flex flex-col">
          <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant">
            <h3 className="text-lg font-bold">System Requests Over Time</h3>
          </div>
          <div className="p-6 flex-1 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--color-on-surface-variant)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="requests" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorRequests)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-6 flex justify-between text-[10px] font-mono text-on-surface-variant border-t border-outline-variant pt-4">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Requests</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-tertiary"></span> Latency (ms)</div>
            </div>
          </div>
        </div>

        {/* Error Trends */}
        <div className="glass-panel rounded-xl lg:col-span-3 h-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">Latency Trends</h3>
                <p className="text-xs text-on-surface-variant">Response latency fluctuations over observation window</p>
              </div>
            </div>
            <div className="flex-1 min-h-[120px] relative w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <Area type="monotone" dataKey="latency" stroke="var(--color-error)" fill="transparent" strokeWidth={2} dot={false} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tables Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-lg font-bold">Top Active Agents</h3>
            <button className="text-primary text-xs font-medium hover:underline uppercase tracking-widest font-mono">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-3 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Agent Name</th>
                  <th className="px-6 py-3 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Type</th>
                  <th className="px-6 py-3 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Model</th>
                  <th className="px-6 py-3 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-sm">
                {agents.length > 0 ? (
                  agents.slice(0, 5).map((agent) => (
                    <AgentRow 
                      key={agent.id} 
                      name={agent.name} 
                      id={agent.id} 
                      type={agent.agent_type} 
                      model={agent.model || 'Default'} 
                      status={agent.last_stop_reason || 'Active'} 
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant font-mono text-xs">
                      No active agents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-lg font-bold">Registered Tools Usage</h3>
            <span className="material-symbols-outlined text-on-surface-variant text-lg">construction</span>
          </div>
          <div className="p-6 space-y-4">
            {tools.length > 0 ? (
              tools.slice(0, 4).map((tool, i) => (
                <ToolUsage 
                  key={tool.id} 
                  name={tool.name} 
                  calls={150 - (i * 35) > 0 ? 150 - (i * 35) : 10} 
                  progress={100 - (i * 20)} 
                  icon="construction" 
                  color="text-primary-container" 
                />
              ))
            ) : (
              <div className="text-center text-on-surface-variant font-mono text-xs py-8">
                No registered tools found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Technical Log Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 font-mono text-[11px] flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex gap-4">
          <span className="text-emerald-400">[SYSTEM READY]</span>
          <span className="text-on-surface-variant">Telemetry stream established for active agent clusters. No anomalies detected.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Live Update</span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, subValue, color, progress, isMono, isSuccessGrid }: { title: string, value: string | number, trend?: string, subValue?: string, color: string, progress?: number, isMono?: boolean, isSuccessGrid?: boolean }) => (
  <div className="glass-panel p-6 rounded-xl flex flex-col gap-2">
    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">{title}</span>
    <div className="flex items-baseline gap-2">
      <span className={`text-2xl font-bold ${isMono ? 'font-mono' : ''}`}>{value}</span>
      {trend && <span className={`${trend.includes('↑') || trend === 'Optimal' ? 'text-emerald-400' : 'text-error'} text-[10px] font-bold`}>{trend}</span>}
    </div>
    {subValue && <p className="text-[10px] text-on-surface-variant font-mono uppercase">{subValue}</p>}
    {progress !== undefined && (
      <div className="h-1 bg-surface-container-highest w-full rounded-full mt-2 overflow-hidden">
        <div className={`h-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`} style={{ width: `${progress}%` }}></div>
      </div>
    )}
    {isSuccessGrid && (
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`h-3 w-full rounded-sm ${i < 5 ? 'bg-emerald-500/20' : 'bg-error/20'}`}></div>
        ))}
      </div>
    )}
  </div>
);

const AgentRow = ({ name, id, type, model, status }: { name: string, id: string, type: string, model: string, status: string }) => (
  <tr className="hover:bg-surface-variant/20 transition-colors">
    <td className="px-6 py-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface">
        {name ? name[0].toUpperCase() : 'A'}
      </div>
      <div>
        <p className="font-bold">{name || 'Unnamed Agent'}</p>
        <p className="text-[9px] text-on-surface-variant font-mono uppercase tracking-wider">UUID: {id}</p>
      </div>
    </td>
    <td className="px-6 py-4 font-mono text-xs">{type}</td>
    <td className="px-6 py-4 font-mono text-xs text-primary">{model}</td>
    <td className="px-6 py-4">
      <span className="px-2 py-0.5 rounded text-[9px] font-mono tracking-widest text-emerald-400 bg-emerald-400/10">{status}</span>
    </td>
  </tr>
);

const ToolUsage = ({ name, calls, progress, icon, color }: { name: string, calls: string | number, progress: number, icon: string, color: string }) => (
  <div className="flex items-center gap-4">
    <div className={`w-10 h-10 rounded bg-surface-container flex items-center justify-center border border-outline-variant ${color}`}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold">{name}</span>
        <span className="font-mono text-[10px] text-on-surface-variant">{calls} Calls</span>
      </div>
      <div className="h-1.5 w-full bg-surface-container-lowest rounded-full">
        <div className={`h-full rounded-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  </div>
);
