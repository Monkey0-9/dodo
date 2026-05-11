
import { StatsGrid } from './StatsGrid';

export const Dashboard = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 relative overflow-hidden rounded-xl border border-outline-variant glass-panel p-8 min-h-[200px] flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <span className="material-symbols-outlined text-[120px]">hub</span>
          </div>
          <h2 className="font-headline-lg text-3xl font-semibold mb-2">Welcome to Dodo OS.</h2>
          <p className="text-on-surface-variant text-lg">24 agents active across 3 clusters. System latency is optimal.</p>
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
            <h3 className="font-headline-sm text-lg font-medium">Execution Throughput (Demo)</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                <span className="text-[10px] font-mono-label text-on-surface-variant uppercase">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="text-[10px] font-mono-label text-on-surface-variant uppercase">Retry</span>
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
              <path d="M0,150 Q50,130 100,140 T200,100 T300,120 T400,80 T500,90 T600,40 T700,60 T800,30 T900,45 T1000,20" fill="none" stroke="#4cd7f6" strokeWidth="2"></path>
              <path d="M0,180 Q50,170 100,175 T200,160 T300,165 T400,150 T500,155 T600,140 T700,145 T800,130 T900,135 T1000,120" fill="none" stroke="#b395ff" strokeWidth="2"></path>
            </svg>
          </div>
        </div>

        {/* Alerts & Logs Panel */}
        <div className="lg:col-span-4 glass-panel rounded-xl flex flex-col h-full overflow-hidden">
          <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-headline-sm text-lg font-medium">Recent Errors & Warnings</h3>
          </div>
          <div className="flex-1 overflow-y-auto font-mono-code divide-y divide-outline-variant/30">
            <AlertItem type="Error" time="14:22:01" message="API_TIMEOUT: Agent 'Delta-9' failed to reach LLM endpoint." />
            <AlertItem type="Warning" time="14:18:45" message="MEM_THROTTLING: Cluster 2 reaching capacity (88%)." />
            <AlertItem type="Error" time="14:15:10" message="AUTH_FAILURE: Token expired for tool 'SQL-Connector'." />
            <AlertItem type="Warning" time="14:02:33" message="LATENCY_SPIKE: Detected across 4 agents in region us-east." />
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
                <th className="px-6 py-3">Agent ID</th>
                <th className="px-6 py-3">Task</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Start Time</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 text-sm">
              <ExecutionRow id="alpha-01-v2" task="Financial Report Analysis" status="Completed" time="14:45:12" duration="1.2s" />
              <ExecutionRow id="bravo-09-v1" task="Code Review #9042" status="Running" time="14:48:55" duration="--" />
              <ExecutionRow id="gamma-04-v1" task="Customer Sentiment Query" status="Completed" time="14:42:01" duration="0.8s" />
              <ExecutionRow id="delta-99-v3" task="Market Data Ingestion" status="Failed" time="14:40:00" duration="4.5s" />
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

const ExecutionRow = ({ id, task, status, time, duration }: { id: string, task: string, status: string, time: string, duration: string }) => (
  <tr className="hover:bg-surface-bright/20 transition-all group">
    <td className="px-6 py-4 font-mono text-primary">{id}</td>
    <td className="px-6 py-4">{task}</td>
    <td className="px-6 py-4">
      <div className={`flex items-center gap-2 ${status === 'Completed' ? 'text-emerald-500' : status === 'Running' ? 'text-primary' : 'text-error'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Completed' ? 'bg-emerald-500' : status === 'Running' ? 'bg-primary animate-pulse' : 'bg-error'}`}></span> 
        {status}
      </div>
    </td>
    <td className="px-6 py-4 text-on-surface-variant font-mono">{time}</td>
    <td className="px-6 py-4 text-on-surface-variant font-mono">{duration}</td>
    <td className="px-6 py-4 text-right">
      <button className="text-on-surface-variant hover:text-primary transition-colors">
        <span className="material-symbols-outlined">open_in_new</span>
      </button>
    </td>
  </tr>
);
