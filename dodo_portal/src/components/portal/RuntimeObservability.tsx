

export const RuntimeObservability = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Runtime Intelligence & Health</h2>
          <p className="text-on-surface-variant font-mono text-xs mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live System Metrics • Last synced 2s ago
          </p>
        </div>
        <div className="flex gap-2">
          <button className="glass-panel px-4 py-2 rounded-lg text-xs flex items-center gap-2 hover:bg-surface-bright/50 transition-all text-on-surface">
            <span className="material-symbols-outlined text-[18px]">refresh</span> Force Re-cluster
          </button>
          <button className="glass-panel px-4 py-2 rounded-lg text-xs flex items-center gap-2 hover:bg-surface-bright/50 transition-all text-on-surface">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Logs
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          label="Cluster Health" 
          value="99.9%" 
          subValue="+0.02% vs avg" 
          icon="verified_user" 
          color="text-emerald-400" 
          bgColor="bg-emerald-400/10" 
        />
        <MetricCard 
          label="Worker Availability" 
          value="12 / 12" 
          subValue="Full capacity active" 
          icon="dns" 
          color="text-primary" 
          bgColor="bg-primary/10" 
        />
        <MetricCard 
          label="Total Queue Depth" 
          value="4.2k" 
          unit="tasks"
          subValue="Increasing load detected" 
          icon="database_upload" 
          color="text-amber-400" 
          bgColor="bg-amber-400/10" 
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Breakdown */}
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant flex justify-between items-center">
            <h4 className="text-lg font-medium text-on-surface">Latency Breakdown</h4>
            <span className="font-mono text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded">DEMO</span>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-end gap-1 min-h-[300px]">
            <div className="flex items-end gap-1 h-48 w-full">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col-reverse group">
                  <div className="w-full bg-primary/40 h-[20%] rounded-t-sm group-hover:bg-primary/60 transition-all"></div>
                  <div className="w-full bg-secondary/40 h-[30%] group-hover:bg-secondary/60 transition-all"></div>
                  <div className="w-full bg-tertiary/40 h-[40%] group-hover:bg-tertiary/60 transition-all"></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-6">
              <div className="flex gap-4">
                <LegendItem color="bg-tertiary" label="LLM" />
                <LegendItem color="bg-secondary" label="TOOL" />
                <LegendItem color="bg-primary" label="MEMORY" />
              </div>
              <span className="font-mono text-sm text-on-surface">Avg 124ms</span>
            </div>
          </div>
        </div>

        {/* Worker Node Load */}
        <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant flex justify-between items-center">
            <h4 className="text-lg font-medium text-on-surface">Worker Node Load</h4>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => {
                const isCritical = i === 4;
                const isAmber = i === 2 || i === 7;
                return (
                  <div 
                    key={i} 
                    className={`aspect-square glass-panel rounded-lg flex items-center justify-center transition-all cursor-help
                      ${isCritical ? 'bg-rose-500/40 border-rose-500/60 animate-pulse' : 
                        isAmber ? 'bg-amber-500/30 border-amber-500/50' : 
                        'bg-emerald-500/20 border-emerald-500/30'}`}
                  >
                    <span className={`font-mono text-[10px] 
                      ${isCritical ? 'text-rose-300' : isAmber ? 'text-amber-300' : 'text-emerald-400'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 space-y-4">
              <SaturationBar label="Resource saturation (CPU)" value="42.5%" color="bg-primary" />
              <SaturationBar label="Memory utilization" value="51.2%" color="bg-secondary" subValue="8.2 GB / 16 GB" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Streams */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-high border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">sync_alt</span>
            <h4 className="text-lg font-medium text-on-surface">Active Streams</h4>
          </div>
          <div className="text-sm text-on-surface-variant">
            <span className="font-bold text-on-surface">1,242</span> concurrent connections
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-left border-b border-outline-variant">
                <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Connection ID</th>
                <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Agent Entity</th>
                <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Protocol</th>
                <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Throughput</th>
                <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              <StreamRow id="#ws_2943_xa" agent="AutoCoder_V4" protocol="WebSocket/Secure" throughput="1.2 msg/s" status="STABLE" />
              <StreamRow id="#ws_8821_bz" agent="MemoryRetriever_X" protocol="gRPC/Stream" throughput="4.8 msg/s" status="THROTTLED" statusColor="text-amber-400 bg-amber-400/10 border-amber-400/20" />
              <StreamRow id="#ws_1102_df" agent="WorkflowEngine_S" protocol="WebSocket/Secure" throughput="0.1 msg/s" status="IDLE" statusColor="text-on-surface-variant bg-surface-variant border-outline-variant" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, unit, subValue, icon, color, bgColor }: any) => (
  <div className="glass-panel p-6 rounded-xl flex items-center justify-between group cursor-default">
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
      <h3 className={`text-3xl font-bold ${color}`}>
        {value} {unit && <span className="text-lg font-normal text-on-surface-variant">{unit}</span>}
      </h3>
      <p className="text-xs text-on-surface-variant mt-1">{subValue}</p>
    </div>
    <div className={`p-4 ${bgColor} rounded-full ${color} group-hover:scale-110 transition-transform`}>
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
  </div>
);

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${color} rounded-sm`}></div>
    <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</span>
  </div>
);

const SaturationBar = ({ label, value, color, subValue }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-xs">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-mono">{subValue || value}</span>
    </div>
    <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
      <div className={`${color} h-full`} style={{ width: value }}></div>
    </div>
  </div>
);

const StreamRow = ({ id, agent, protocol, throughput, status, statusColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" }: any) => (
  <tr className="hover:bg-surface-bright/20 transition-colors">
    <td className="px-6 py-4 font-mono text-sm text-on-surface">{id}</td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-[14px] text-primary">smart_toy</span>
        </div>
        <span className="text-sm font-medium text-on-surface">{agent}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-sm text-on-surface-variant">{protocol}</td>
    <td className="px-6 py-4 font-mono text-sm text-on-surface">{throughput}</td>
    <td className="px-6 py-4">
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
        {status}
      </span>
    </td>
  </tr>
);
