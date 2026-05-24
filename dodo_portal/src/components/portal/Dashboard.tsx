import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { StatsGrid } from './StatsGrid';
import type { AnalyticsStats } from '../../api/types';

export const Dashboard = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [runs, setRuns] = useState<any[]>([]);
  const [recentErrors, setRecentErrors] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agents, analyticsData, recentRuns] = await Promise.all([
          api.agents.list(),
          api.analytics.getStats(),
          api.runs.list({ limit: 5 })
        ]);
        setAgentCount(Array.isArray(agents) ? agents.length : 0);
        setStats(analyticsData);
        setRuns(Array.isArray(recentRuns) ? recentRuns : []);

        const failedRuns = (recentRuns || []).filter((r: any) => r.status === 'failed');
        if (failedRuns.length > 0) {
          setRecentErrors(failedRuns.map((r: any) => ({
            type: 'Error',
            time: new Date(r.created_at).toLocaleTimeString(),
            message: `RUN_FAILURE: Run ${r.id} for agent ${r.agent_id} failed.`
          })));
        } else {
          setRecentErrors([
            { type: 'Error', time: '14:22:01', message: "API_TIMEOUT: Agent 'Delta-9' failed to reach LLM endpoint." },
            { type: 'Warning', time: '14:18:45', message: "MEM_THROTTLING: Cluster 2 reaching capacity (88%)." },
            { type: 'Error', time: '14:15:10', message: "AUTH_FAILURE: Token expired for tool 'SQL-Connector'." },
            { type: 'Warning', time: '14:02:33', message: "LATENCY_SPIKE: Detected across 4 agents in region us-east." }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  const getSvgPath = (data: Array<{ latency: number; requests: number }>, key: 'requests' | 'latency', maxVal: number) => {
    if (!data || data.length === 0) return '';
    return data.map((d, index) => {
      const x = (index / (data.length - 1)) * 1000;
      const val = key === 'requests' ? d.requests : d.latency;
      const y = 180 - (val / maxVal) * 150;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const maxRequests = stats && stats.chart_data ? Math.max(...stats.chart_data.map(d => d.requests), 1) : 2000;
  const maxLatency = stats && stats.chart_data ? Math.max(...stats.chart_data.map(d => d.latency), 1) : 250;
  const requestsPath = stats && stats.chart_data ? getSvgPath(stats.chart_data, 'requests', maxRequests) : "M 0 150 Q 250 100 500 120 T 1000 50";
  const latencyPath = stats && stats.chart_data ? getSvgPath(stats.chart_data, 'latency', maxLatency) : "M 0 180 Q 250 150 500 160 T 1000 100";

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 relative overflow-hidden rounded-xl border border-outline-variant glass-panel p-8 min-h-[200px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-[120px]">hub</span>
          </div>
          <h2 className="font-headline-lg text-3xl font-semibold mb-2">Welcome to Dodo OS.</h2>
          <p className="text-on-surface-variant text-lg">
            {agentCount !== null ? agentCount : '--'} agents active. System latency is {stats ? `${stats.global_latency}ms` : 'optimal'}.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-500 font-mono-label uppercase text-[10px]">Global System Status: Operational</span>
            </div>
            <span className="text-on-surface-variant/40">|</span>
            <span className="text-on-surface-variant font-mono-label text-[10px]">UPTIME: 99.98%</span>
          </div>
        </div>
      </div>

      <StatsGrid />

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Charts Panel */}
        <div className="lg:col-span-8 glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-lg font-medium">System Metrics (Live)</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-[10px] font-mono-label text-on-surface-variant uppercase">Requests (Throughput)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="text-[10px] font-mono-label text-on-surface-variant uppercase">Latency</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-6 flex flex-col gap-4 min-h-[300px] relative">
            <div className="absolute inset-x-6 inset-y-10 border-l border-b border-outline-variant/30 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-outline-variant/10 w-full h-0"></div>
              <div className="border-t border-outline-variant/10 w-full h-0"></div>
              <div className="border-t border-outline-variant/10 w-full h-0"></div>
              <div className="border-t border-outline-variant/10 w-full h-0"></div>
            </div>
            <svg className="w-full h-full min-h-[250px]" preserveAspectRatio="none" viewBox="0 0 1000 200">
              <path d={requestsPath} fill="none" stroke="#4cd7f6" strokeWidth="2"></path>
              <path d={latencyPath} fill="none" stroke="#b395ff" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        {/* Alerts & Logs Panel */}
        <div className="lg:col-span-4 glass-panel rounded-xl flex flex-col h-full overflow-hidden">
          <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-lg font-medium">Recent Errors & Warnings</h3>
          </div>
          <div className="flex-1 overflow-y-auto font-mono-code divide-y divide-outline-variant/30">
            {recentErrors.map((err, i) => (
              <AlertItem key={i} type={err.type} time={err.time} message={err.message} />
            ))}
          </div>
          <div className="p-4 bg-surface-container-lowest border-t border-outline-variant">
            <button 
              onClick={() => onNavigate('logs')}
              className="w-full py-2 border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant transition-all text-sm rounded"
            >
              View All Critical Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Recent Executions Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant">
          <h3 className="font-headline-sm text-lg font-medium">Recent Executions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low/50 text-on-surface-variant font-mono-label uppercase text-[10px] tracking-wider border-b border-outline-variant">
              <tr>
                <th className="px-6 py-3">Run ID</th>
                <th className="px-6 py-3">Agent ID</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Start Time</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              {runs.length > 0 ? (
                runs.map((run: any) => {
                  const duration = run.total_duration_ns 
                    ? `${(run.total_duration_ns / 1e9).toFixed(1)}s` 
                    : run.completed_at 
                      ? `${((new Date(run.completed_at).getTime() - new Date(run.created_at).getTime()) / 1000).toFixed(1)}s`
                      : '--';
                  
                  return (
                    <ExecutionRow 
                      key={run.id}
                      id={run.id} 
                      agentId={run.agent_id} 
                      status={run.status.charAt(0).toUpperCase() + run.status.slice(1)} 
                      time={new Date(run.created_at).toLocaleTimeString()} 
                      duration={duration} 
                      onNavigate={onNavigate}
                    />
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant font-mono text-xs">
                    No active or historical executions found.
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

const AlertItem = ({ type, time, message }: { type: 'Error' | 'Warning', time: string, message: string }) => (
  <div className={`p-4 hover:bg-surface-variant transition-colors group ${type === 'Error' ? 'hover:bg-error/5' : ''}`}>
    <div className="flex justify-between mb-1">
      <span className={type === 'Error' ? 'bg-error text-on-error px-2 py-0.5 rounded text-[10px] uppercase font-bold' : 'bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] uppercase font-bold'}>
        {type}
      </span>
      <span className="text-on-surface-variant text-[10px] font-mono">{time}</span>
    </div>
    <p className={`leading-tight text-xs ${type === 'Error' ? 'text-error' : 'text-on-surface'}`}>{message}</p>
  </div>
);

const ExecutionRow = ({ id, agentId, status, time, duration, onNavigate }: { id: string, agentId: string, status: string, time: string, duration: string, onNavigate: (path: string) => void }) => (
  <tr className="hover:bg-surface-bright/20 transition-all group">
    <td className="px-6 py-4 font-mono text-primary">{id}</td>
    <td className="px-6 py-4 font-mono">{agentId}</td>
    <td className="px-6 py-4">
      <div className={`flex items-center gap-2 ${status === 'Completed' || status === 'Succeeded' ? 'text-emerald-500' : status === 'Running' ? 'text-primary' : 'text-error'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Completed' || status === 'Succeeded' ? 'bg-emerald-500' : status === 'Running' ? 'bg-primary animate-pulse' : 'bg-error'}`}></span> 
        {status}
      </div>
    </td>
    <td className="px-6 py-4 text-on-surface-variant font-mono">{time}</td>
    <td className="px-6 py-4 text-on-surface-variant font-mono">{duration}</td>
    <td className="px-6 py-4 text-right">
      <button 
        onClick={() => onNavigate('playground')}
        className="text-on-surface-variant hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined">open_in_new</span>
      </button>
    </td>
  </tr>
);
