
export const Topology = () => {
  return (
    <div className="flex h-full overflow-hidden -m-8">
      {/* Left Sidebar: Intelligence Streams */}
      <aside className="w-80 flex flex-col border-r border-outline-variant bg-surface-container-lowest">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Active Intelligence Streams</span>
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#4cd7f6]"></span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          <StreamItem id="AGENT_772" latency="0.12ms" logs={['RETRIEVING_CONTEXT: hash_88192...', 'GENERATING_TOKENS: 45/s']} active />
          <StreamItem id="DODO_CORE_V2" latency="0.08ms" logs={['SYNAPSE_REWEIGHTING: active', 'CACHE_HIT: metadata_layer_04']} active />
          <StreamItem id="MEMORY_CLUSTER_A" latency="IDLE" logs={['COMPRESSION_CYCLE: 98%']} />
          <StreamItem id="AGENT_114" latency="0.44ms" logs={['KNOWLEDGE_EMBEDDING: shard_12', 'STREAMING_ACTIVE: buffer_overflow_0']} active />
        </div>
        {/* Knowledge Indexing Status Bar */}
        <div className="p-6 bg-surface border-t border-outline-variant">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Knowledge Indexing</span>
            <span className="text-xs font-mono text-primary font-bold">74.2%</span>
          </div>
          <div className="h-1 bg-outline-variant w-full overflow-hidden rounded-full">
            <div className="h-full bg-primary w-[74.2%] transition-all duration-1000"></div>
          </div>
          <div className="mt-3 flex justify-between">
            <span className="text-[9px] font-mono text-on-surface-variant">BATCH: V2.B-1099</span>
            <span className="text-[9px] font-mono text-on-surface-variant">ETA: 02:14:00</span>
          </div>
        </div>
      </aside>

      {/* Center Stage: Topology Map */}
      <div className="flex-1 relative overflow-hidden canvas-grid flex flex-col">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="relative w-full h-full border border-outline-variant bg-surface/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
            {/* Layer Indicators */}
            <div className="absolute top-4 left-4 space-y-2 z-20">
              <Indicator color="bg-primary" label="Central Models" />
              <Indicator color="bg-secondary" label="Memory Clusters" />
              <Indicator color="bg-tertiary" label="Active Agents" />
            </div>

            {/* Schematic Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
               <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-tertiary/10"></div>
            </div>

            {/* Custom UI Node Overlays */}
            {/* Core Model */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 p-4 bg-surface/90 backdrop-blur-md border-2 border-primary rounded-xl shadow-[0_0_40px_rgba(76,215,246,0.2)] z-10">
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-outline-variant pb-2 mb-2 font-mono">Core_Intelligence_01</div>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><span className="font-mono text-[10px] text-on-surface-variant uppercase">Load</span> <span className="font-mono text-[11px] text-primary font-bold">44.2%</span></div>
                <div className="flex justify-between items-center"><span className="font-mono text-[10px] text-on-surface-variant uppercase">Temp</span> <span className="font-mono text-[11px] text-error font-bold">72.4°C</span></div>
              </div>
            </div>

            {/* Memory Node 1 */}
            <div className="absolute top-1/4 left-1/4 w-40 p-3 bg-surface/80 backdrop-blur-md border border-secondary rounded-lg shadow-xl">
              <div className="text-[9px] font-bold uppercase tracking-widest text-secondary border-b border-outline-variant mb-2 font-mono">Mem_Cluster_A</div>
              <div className="h-1 bg-outline-variant w-full mb-2 rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-1/3"></div>
              </div>
              <div className="text-[9px] font-mono text-on-surface-variant uppercase">Health: 99.9%</div>
            </div>

            {/* Agent Node 1 */}
            <div className="absolute bottom-1/4 right-1/4 w-40 p-3 bg-surface/80 backdrop-blur-md border border-tertiary rounded-lg shadow-xl">
              <div className="text-[9px] font-bold uppercase tracking-widest text-tertiary border-b border-outline-variant mb-2 font-mono">Agent_Instance_09</div>
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-on-surface-variant">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span>STATUS: ACTIVE</span>
              </div>
            </div>

            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="var(--color-secondary)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="75%" y1="75%" x2="50%" y2="50%" stroke="var(--color-tertiary)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="50%" cy="50%" r="100" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" strokeDasharray="10 10" className="animate-spin-slow" />
            </svg>
          </div>
        </div>

        {/* Bottom Drawer: Latency Matrix */}
        <div className="mt-auto h-80 border-t border-outline-variant bg-surface flex flex-col z-30">
          <div className="flex items-center justify-between px-6 py-3 border-b border-outline-variant bg-surface-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-lg">monitoring</span>
              <h4 className="text-[10px] font-bold uppercase tracking-widest font-mono">Latency_Matrix_System_Wide</h4>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-outline-variant text-[9px] font-bold uppercase tracking-widest font-mono hover:bg-surface-container-high transition-colors">Refresh_Logs</button>
              <button className="px-3 py-1 border border-outline-variant text-[9px] font-bold uppercase tracking-widest font-mono hover:bg-surface-container-high transition-colors">Export_CSV</button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-0 no-scrollbar">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead className="sticky top-0 bg-surface-container-low border-b border-outline-variant z-10">
                <tr>
                  <th className="p-4 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">Model_Node_ID</th>
                  <th className="p-4 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">P50 (ms)</th>
                  <th className="p-4 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">P99 (ms)</th>
                  <th className="p-4 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">Throughput (t/s)</th>
                  <th className="p-4 border-r border-outline-variant text-on-surface-variant font-bold uppercase tracking-widest">Error_Rate</th>
                  <th className="p-4 text-on-surface-variant font-bold uppercase tracking-widest">Last_Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                <TableRow id="DODO-LLM-ULTRA-01" p50="12.4" p99="45.8" throughput="1,240" error="0.001%" sync="14:02:11" />
                <TableRow id="DODO-FAST-TOKENIZER" p50="0.8" p99="2.1" throughput="12,500" error="0.000%" sync="14:02:09" />
                <TableRow id="RAG-EMBED-V4" p50="34.1" p99="102.5" throughput="450" error="0.012%" sync="14:02:12" color="text-tertiary" />
                <TableRow id="CORE-REASONER-BETA" p50="112.5" p99="450.0" throughput="12" error="2.441%" sync="14:02:10" color="text-error" />
                <TableRow id="VISION-CLUSTER-A" p50="65.2" p99="144.1" throughput="88" error="0.005%" sync="14:01:59" />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Inspector Panel */}
      <aside className="w-80 border-l border-outline-variant bg-surface-container flex flex-col">
        <div className="p-6 bg-surface border-b border-outline-variant">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">System_Entity_Inspector</span>
        </div>
        <div className="p-6 space-y-8 flex-1 overflow-y-auto no-scrollbar">
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-primary">CORE_INTELLIGENCE_01</h3>
            <div className="grid grid-cols-2 gap-2">
              <MetadataBox label="Role" value="SUPERVISOR" />
              <MetadataBox label="Uptime" value="422:11:05" />
            </div>
          </div>

          <div className="aspect-video w-full bg-background border border-outline-variant relative flex items-center justify-center rounded-lg overflow-hidden group">
             <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
             <div className="relative z-10 flex flex-col items-center gap-2">
               <span className="material-symbols-outlined text-primary animate-pulse">monitoring</span>
               <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest border border-primary/30 px-2 py-1 rounded bg-background/80">Live_Metrics</span>
             </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface font-mono">Trace_Logs</span>
            <div className="bg-surface-container-lowest p-4 border border-outline-variant h-64 overflow-y-auto font-mono text-[10px] space-y-2 rounded-lg no-scrollbar">
              <LogLine time="14:02:10" content={<><span className="text-primary">CORE_01</span> Connected to <span className="text-secondary">MEM_A</span></>} />
              <LogLine time="14:02:11" content="Handshake protocol verified (0x02)" />
              <LogLine time="14:02:11" content="Forwarding query batch to 12 agents" />
              <LogLine time="14:02:12" content={<span className="text-tertiary">Agent_114 reporting heavy latency (shard_12)</span>} />
              <LogLine time="14:02:12" content="Rebalancing load across shard_13" />
              <LogLine time="14:02:13" content="HEARTBEAT_OK" />
              <LogLine time="14:02:14" content="Processing token stream..." />
            </div>
          </div>

          <button className="w-full py-4 bg-error/20 border border-error/50 text-error font-mono font-bold text-xs uppercase tracking-widest rounded hover:bg-error hover:text-on-error transition-all active:scale-95">
            Initiate_System_Purge
          </button>
        </div>
      </aside>
    </div>
  );
};

const StreamItem = ({ id, latency, logs, active = false }: any) => (
  <div className={`p-4 bg-surface-container border border-outline-variant rounded-xl transition-all ${active ? 'ring-1 ring-primary/30' : 'opacity-60'}`}>
    <div className="flex justify-between mb-2">
      <span className={`font-mono text-[11px] font-bold ${active ? 'text-primary' : 'text-on-surface-variant'}`}>{id}</span>
      <span className="font-mono text-[9px] text-on-surface-variant uppercase">{latency}</span>
    </div>
    <div className="font-mono text-[10px] text-on-surface-variant/80 leading-tight space-y-1">
      {logs.map((log: string, i: number) => (
        <div key={i}>&gt; {log}</div>
      ))}
    </div>
  </div>
);

const Indicator = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 ${color} border border-white/10 rounded-sm`}></div>
    <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface font-mono">{label}</span>
  </div>
);

const TableRow = ({ id, p50, p99, throughput, error, sync, color = "text-primary" }: any) => (
  <tr className="hover:bg-surface-container-high transition-colors group">
    <td className="p-4 border-r border-outline-variant font-bold text-on-surface">{id}</td>
    <td className="p-4 border-r border-outline-variant">{p50}</td>
    <td className="p-4 border-r border-outline-variant">{p99}</td>
    <td className="p-4 border-r border-outline-variant">{throughput}</td>
    <td className={`p-4 border-r border-outline-variant font-bold ${color}`}>{error}</td>
    <td className="p-4 text-on-surface-variant">{sync}</td>
  </tr>
);

const MetadataBox = ({ label, value }: any) => (
  <div className="bg-surface p-3 border border-outline-variant rounded-lg">
    <div className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant font-mono mb-1">{label}</div>
    <div className="font-mono text-xs font-bold text-on-surface">{value}</div>
  </div>
);

const LogLine = ({ time, content }: any) => (
  <div className="text-on-surface-variant border-b border-outline-variant/10 pb-1">
    <span className="opacity-40">[{time}]</span> {content}
  </div>
);
