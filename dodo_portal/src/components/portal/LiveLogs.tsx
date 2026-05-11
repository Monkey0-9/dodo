
export const LiveLogs = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0 -m-6 h-[calc(100vh-64px)] overflow-hidden">
      {/* Controls Bar */}
      <div className="h-14 flex items-center justify-between px-6 bg-surface-container border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex bg-surface-container-lowest border border-outline-variant rounded p-0.5">
            <button className="px-3 py-1 bg-primary text-on-primary text-xs font-medium rounded flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">pause</span> PAUSE
            </button>
            <button className="px-3 py-1 text-on-surface-variant hover:text-on-surface text-xs font-medium rounded flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-[18px]">play_arrow</span> RESUME
            </button>
          </div>
          <button className="px-3 py-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 border border-outline-variant rounded text-xs transition-all flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span> CLEAR LOGS
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant mr-1">Severity:</span>
          <div className="flex gap-1">
            <span className="px-2 py-0.5 bg-error/10 text-error border border-error/20 text-[9px] font-mono rounded-sm uppercase tracking-widest">ERROR</span>
            <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary border border-tertiary/20 text-[9px] font-mono rounded-sm uppercase tracking-widest">WARN</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono rounded-sm uppercase tracking-widest">INFO</span>
            <span className="px-2 py-0.5 bg-on-surface-variant/10 text-on-surface-variant border border-outline-variant/30 text-[9px] font-mono rounded-sm uppercase tracking-widest">DEBUG</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Terminal View */}
        <section className="flex-1 bg-surface-container-lowest overflow-y-auto p-4 font-mono text-sm border-r border-outline-variant">
          <div className="space-y-1">
            <LogEntry 
              time="14:20:45.021" 
              source="AGENT-7" 
              level="INFO" 
              levelColor="text-primary" 
              content={<>Calling tool <span className="text-tertiary">'google_search'</span> with query <span className="text-secondary">'current market cap of NVIDIA'</span></>} 
            />
            <LogEntry 
              time="14:20:46.155" 
              source="SYSTEM" 
              level="DEBUG" 
              levelColor="text-primary-fixed-dim" 
              content={<>Recall hit from memory block <span className="text-secondary">#A102</span> (score: <span className="text-primary">0.98</span>)</>} 
            />
            <LogEntry 
              time="14:20:46.882" 
              source="AGENT-7" 
              level="WARN" 
              levelColor="text-tertiary" 
              active 
              content="Tool execution time exceeded 750ms limit. Retrying..." 
            />
            <div className="group flex items-start gap-4 p-2 hover:bg-surface-container/50 rounded-sm cursor-pointer border-l-2 border-transparent hover:border-primary transition-all">
              <span className="text-on-surface-variant opacity-40 select-none whitespace-nowrap text-xs">14:20:47.310</span>
              <span className="bg-primary/10 text-primary px-1.5 rounded-sm text-[10px] uppercase font-bold tracking-tight">AGENT-7</span>
              <span className="text-primary font-bold text-xs">INFO</span>
              <div className="flex-1">
                <p className="text-on-surface mb-2 text-sm">Received response payload from tool:</p>
                <div className="bg-surface-container-low p-3 rounded border border-outline-variant/30 text-on-surface-variant text-xs leading-relaxed font-mono">
                  <span className="text-primary">{'{'}</span><br/>
                  &nbsp;&nbsp;<span className="text-secondary">"status"</span>: <span className="text-tertiary">"success"</span>,<br/>
                  &nbsp;&nbsp;<span className="text-secondary">"data"</span>: {'{'}<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-secondary">"result"</span>: <span className="text-on-surface">"NVIDIA Market Cap: $2.14T"</span>,<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-secondary">"source"</span>: <span className="text-tertiary">"Yahoo Finance"</span><br/>
                  &nbsp;&nbsp;{'}'},<br/>
                  &nbsp;&nbsp;<span className="text-secondary">"latency_ms"</span>: <span className="text-primary">842</span><br/>
                  <span className="text-primary">{'}'}</span>
                </div>
              </div>
            </div>
            <LogEntry 
              time="14:20:48.001" 
              source="KERNEL" 
              level="ERROR" 
              levelColor="text-error" 
              content={<>Memory context overflow in Workflow <span className="text-secondary">#W-492</span>. Triggering GC...</>} 
            />
            <div className="animate-pulse flex items-center gap-4 p-2 text-on-surface-variant/30">
              <span className="material-symbols-outlined text-sm">more_horiz</span>
              <span className="text-[10px] font-mono uppercase tracking-widest">Listening for new logs...</span>
            </div>
          </div>
        </section>

        {/* Log Details Side Panel */}
        <aside className="hidden xl:flex w-96 bg-surface-container flex-col shrink-0">
          <div className="h-14 flex items-center justify-between px-6 border-b border-outline-variant bg-surface-container-high shrink-0">
            <span className="text-sm font-bold text-on-surface uppercase tracking-wider">Log Details</span>
            <button className="p-1 hover:bg-surface-bright/50 rounded text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div>
              <h4 className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-4">Event Metadata</h4>
              <div className="space-y-4">
                <MetadataRow label="Trace ID" value="trc_9a12b3c4d5e6" valueColor="text-primary" />
                <MetadataRow label="Timestamp" value="2024-05-20T14:20:46.882Z" />
                <MetadataRow label="Host Node" value="dodo-executor-02" />
                <MetadataRow label="Process PID" value="10482" />
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-4">Stack Trace</h4>
              <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/30 font-mono text-[11px] leading-relaxed text-on-surface-variant overflow-x-hidden">
                <div className="text-error mb-2 font-bold">TimeoutError: Tool execution exceeded 750ms limit</div>
                <div className="opacity-80">at Agent.executeTool (core/agent.js:142:19)</div>
                <div className="opacity-80">at async Workflow.step (runtime/workflow.js:58:12)</div>
                <div className="opacity-80">at async Runtime.run (runtime/index.js:210:9)</div>
                <div className="opacity-60 italic mt-2">... 8 more internal frames</div>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-mono text-on-surface-variant uppercase tracking-widest mb-4">Agent Context</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-high p-3 rounded border border-outline-variant/50">
                  <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Temperature</div>
                  <div className="text-xl font-bold text-primary">0.7</div>
                </div>
                <div className="bg-surface-container-high p-3 rounded border border-outline-variant/50">
                  <div className="text-[9px] font-mono text-on-surface-variant uppercase tracking-widest mb-1">Tokens Used</div>
                  <div className="text-xl font-bold text-tertiary">4.2k</div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-surface-container-high border-t border-outline-variant flex gap-2 shrink-0">
            <button className="flex-1 bg-surface-bright text-on-surface text-xs font-medium py-2.5 rounded border border-outline-variant hover:bg-surface-variant/30 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">content_copy</span> COPY JSON
            </button>
            <button className="flex-1 bg-primary/10 text-primary text-xs font-medium py-2.5 rounded border border-primary/30 hover:bg-primary/20 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">open_in_new</span> VIEW TRACE
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const LogEntry = ({ time, source, level, levelColor, content, active = false }: { time: string, source: string, level: string, levelColor: string, content: React.ReactNode, active?: boolean }) => (
  <div className={`group flex items-start gap-4 p-2 rounded-sm cursor-pointer border-l-2 transition-all
    ${active ? 'bg-surface-container border-primary' : 'hover:bg-surface-container/50 border-transparent hover:border-primary'}`}>
    <span className="text-on-surface-variant opacity-40 select-none whitespace-nowrap text-xs">{time}</span>
    <span className="bg-primary/10 text-primary px-1.5 rounded-sm text-[10px] uppercase font-bold tracking-tight">{source}</span>
    <span className={`font-bold text-xs ${levelColor}`}>{level}</span>
    <span className="text-on-surface text-sm flex-1">{content}</span>
  </div>
);

const MetadataRow = ({ label, value, valueColor = "text-on-surface" }: { label: string, value: string, valueColor?: string }) => (
  <div className="flex justify-between border-b border-outline-variant/30 pb-2 text-xs">
    <span className="text-on-surface-variant">{label}</span>
    <span className={`font-mono ${valueColor}`}>{value}</span>
  </div>
);
