
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const tokenData = [
  { name: '00:00', tokens: 400, cost: 240, calls: 2400 },
  { name: '04:00', tokens: 300, cost: 139, calls: 2210 },
  { name: '08:00', tokens: 200, cost: 980, calls: 2290 },
  { name: '12:00', tokens: 278, cost: 390, calls: 2000 },
  { name: '16:00', tokens: 189, cost: 480, calls: 2181 },
  { name: '20:00', tokens: 239, cost: 380, calls: 2500 },
  { name: '23:59', tokens: 349, cost: 430, calls: 2100 },
];

const agentPerformance = [
  { name: 'Dodo-Primary-Alpha', success: 98, color: 'var(--color-primary)' },
  { name: 'Vision-Synthesizer', success: 94, color: 'var(--color-secondary)' },
  { name: 'Log-Orchestrator-v2', success: 99.8, color: 'var(--color-tertiary)' },
  { name: 'Code-Architect-v4', success: 97.2, color: 'var(--color-primary-container)' },
];

export const Analytics = () => {
  return (
    <div className="space-y-8">
      {/* Header & Time Picker */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Analytics Overview</h2>
          <p className="text-on-surface-variant font-body-md">Telemetry and resource orchestration metrics (Demo Data).</p>
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
        <StatCard title="Total Token Usage" value="4.2M" trend="+12.5% ↑" color="text-primary" progress={75} />
        <StatCard title="Cost Estimate" value="$1,240" subValue="Target: $1.5k" color="text-secondary" progress={50} isMono />
        <StatCard title="Tool Success Rate" value="96.5%" trend="Optimal" color="text-tertiary" isSuccessGrid />
        <StatCard title="Memory Growth" value="12GB/mo" subValue="Projected: 15.4GB at EOM" color="text-on-surface-variant" />
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
            <h3 className="text-lg font-bold">System Usage Over Time</h3>
          </div>
          <div className="p-6 flex-1 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenData}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-on-surface-variant)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="tokens" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-6 flex justify-between text-[10px] font-mono text-on-surface-variant border-t border-outline-variant pt-4">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span> Tokens</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary"></span> Cost</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-tertiary"></span> API Calls</div>
            </div>
          </div>
        </div>

        {/* Error Trends */}
        <div className="glass-panel rounded-xl lg:col-span-3 h-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">Error Trends</h3>
                <p className="text-xs text-on-surface-variant">Failure rates across active clusters</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant uppercase font-mono tracking-widest"><span className="w-3 h-0.5 bg-error"></span> Cluster A</div>
                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant uppercase font-mono tracking-widest"><span className="w-3 h-0.5 bg-primary"></span> Cluster B</div>
              </div>
            </div>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tokenData}>
                    <Area type="monotone" dataKey="tokens" stroke="var(--color-error)" fill="transparent" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="cost" stroke="var(--color-primary)" fill="transparent" strokeWidth={2} dot={false} strokeOpacity={0.5} />
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
            <h3 className="text-lg font-bold">Top Performing Agents</h3>
            <button className="text-primary text-xs font-medium hover:underline uppercase tracking-widest font-mono">Export CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-3 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Agent ID</th>
                  <th className="px-6 py-3 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Efficiency</th>
                  <th className="px-6 py-3 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Reliability</th>
                  <th className="px-6 py-3 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-medium">Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-sm">
                <AgentRow name="Alpha-1-Core" id="4e9d-21fa" eff="99.2%" rel="ULTRA" relColor="text-emerald-400 bg-emerald-400/10" load="Low" />
                <AgentRow name="Vision-Prophet" id="8b11-92cc" eff="94.8%" rel="STABLE" relColor="text-primary bg-primary/10" load="Medium" />
                <AgentRow name="Log-Master" id="f002-31ea" eff="91.5%" rel="THROTTLED" relColor="text-error bg-error/10" load="High" />
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="bg-surface-container-high px-6 py-4 border-b border-outline-variant flex justify-between items-center">
            <h3 className="text-lg font-bold">Most Used Tools</h3>
            <span className="material-symbols-outlined text-on-surface-variant text-lg">construction</span>
          </div>
          <div className="p-6 space-y-4">
            <ToolUsage name="SQL-Engine-Primary" calls="1.2M" progress={92} icon="database" color="text-primary-container" />
            <ToolUsage name="Web-Search-Proxy" calls="850k" progress={65} icon="http" color="text-secondary" />
            <ToolUsage name="File-Compression-v2" calls="420k" progress={35} icon="folder_zip" color="text-tertiary" />
            <ToolUsage name="Linguistic-Parser" calls="210k" progress={15} icon="translate" color="text-on-surface-variant" />
          </div>
        </div>
      </div>

      {/* Technical Log Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 font-mono text-[11px] flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
        <div className="flex gap-4">
          <span className="text-emerald-400">[SYSTEM READY]</span>
          <span className="text-on-surface-variant">Telemetry stream established for all 12 active agent clusters. No anomalies detected.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Live Update</span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, subValue, color, progress, isMono, isSuccessGrid }: any) => (
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

const AgentRow = ({ name, id, eff, rel, relColor, load }: any) => (
  <tr className="hover:bg-surface-variant/20 transition-colors">
    <td className="px-6 py-4 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface">
        {name[0]}
      </div>
      <div>
        <p className="font-bold">{name}</p>
        <p className="text-[9px] text-on-surface-variant font-mono uppercase tracking-wider">UUID: {id}</p>
      </div>
    </td>
    <td className="px-6 py-4">{eff}</td>
    <td className="px-6 py-4">
      <span className={`px-2 py-0.5 rounded text-[9px] font-mono tracking-widest ${relColor}`}>{rel}</span>
    </td>
    <td className="px-6 py-4 text-on-surface-variant">{load}</td>
  </tr>
);

const ToolUsage = ({ name, calls, progress, icon, color }: any) => (
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
