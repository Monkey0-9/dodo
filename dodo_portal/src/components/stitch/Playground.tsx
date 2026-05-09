
export const Playground = () => {
  return (
    <div className="flex h-full overflow-hidden -m-8">
      {/* Left Column: Configuration (20%) */}
      <section className="w-1/5 border-r border-outline-variant bg-surface-container-lowest p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
        <div className="space-y-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Configuration</h3>
          <div className="space-y-2">
            <label className="block text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">Agent Profile</label>
            <select title="Agent Profile" className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-2.5 text-sm focus:border-primary outline-none text-on-surface">
              <option>Data Scribe</option>
              <option>Workflow Orchestrator</option>
              <option>Kernel Auditor</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">Inference Model</label>
            <select title="Inference Model" className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-2.5 text-sm focus:border-primary outline-none text-on-surface">
              <option>GPT-4o (Stable)</option>
              <option>Claude 3.5 Sonnet</option>
              <option>Llama-3-70b-Instruct</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">System Prompt</label>
            <textarea 
              title="System Prompt"
              className="w-full h-48 bg-surface-container-high border border-outline-variant rounded-lg p-3 font-mono text-xs resize-none focus:border-primary outline-none text-on-surface" 
              placeholder="Enter system directives..."
              defaultValue="You are Data Scribe, an elite AI specialized in parsing unstructured technical logs into structured JSON schemas. Your tone is clinical and efficient. Use standard documentation formatting."
            />
          </div>
          <div className="pt-4 border-t border-outline-variant space-y-4">
            <Toggle label="Persistent Memory" active />
            <Toggle label="Tool Access" active />
            <Toggle label="Strict Schema" />
          </div>
        </div>
      </section>

      {/* Middle Column: Chat Interface (50%) */}
      <section className="flex-1 flex flex-col bg-surface-container-low relative min-w-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          {/* Agent Greeting */}
          <Message 
            sender="Data Scribe" 
            role="SYSTEM" 
            content="System initialized. I am ready to process your technical data. Please provide the log stream or specific schema requirements you wish to implement." 
            icon="smart_toy"
          />

          {/* User Message */}
          <Message 
            sender="Debug_User" 
            content='Analyze the following runtime error: "ECONNREFUSED 127.0.0.1:5432". Check my past database configurations for the correct port mapping.' 
            icon="account_circle"
            isUser
          />

          {/* Agent Process Message */}
          <Message 
            sender="Data Scribe" 
            icon="smart_toy"
            content={
              <div className="space-y-3">
                <p>I've analyzed your database configuration history. The error <code className="font-mono text-error bg-error/10 px-1 rounded">ECONNREFUSED</code> indicates that the connection was rejected because nothing is listening on port 5432.</p>
                <div className="bg-black/40 p-3 rounded font-mono text-xs border border-outline-variant">
                  <span className="text-primary">Recalled Configuration (2024-10-12):</span><br/>
                  DB_HOST: "prod-db-01.internal"<br/>
                  DB_PORT: <span className="text-secondary">6432</span> (Proxy layer active)
                </div>
                <p>You should update your connection string to use port 6432 as specified in your stable runtime profile.</p>
              </div>
            }
            badges={[
              { label: "Memory Recall", icon: "history", color: "text-primary bg-primary/10 border-primary/20" },
              { label: "Tool Used", icon: "terminal", color: "text-tertiary bg-tertiary/10 border-tertiary/20" }
            ]}
          />

          {/* Typing Indicator */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant">
              <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-high/30 rounded-full border border-outline-variant">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-delay:200ms]"></div>
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-delay:400ms]"></div>
            </div>
          </div>
        </div>

        {/* Footer Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-surface-container-low via-surface-container-low to-transparent">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="flex items-center justify-between px-2 font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
              <div className="flex gap-4">
                <span>Tokens: <b className="text-on-surface">1,024 / 128k</b></span>
                <span>Latency: <b className="text-secondary">42ms</b></span>
              </div>
              <span>Provider: <b className="text-primary">Dodo Compute V2</b></span>
            </div>
            <div className="bg-surface-container-high/80 backdrop-blur-xl border border-outline-variant rounded-xl p-2 flex items-end gap-2 shadow-2xl">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">attachment</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">keyboard_command_key</span>
              </button>
              <textarea 
                title="Command Agent"
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none outline-none text-on-surface" 
                placeholder="Command Agent... (type '/' for tools)" 
                rows={1}
              />
              <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-2">
                Run <span className="material-symbols-outlined text-sm">play_arrow</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Execution Trace (30%) */}
      <section className="w-[30%] border-l border-outline-variant bg-surface-container-low p-6 overflow-y-auto shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Execution Trace</h3>
            <span className="text-[9px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded font-mono font-bold tracking-widest">LIVE</span>
          </div>

          <div className="relative pl-6 space-y-8 border-l border-outline-variant ml-2">
            <TraceStep time="14:22:01.042" title="Message Received" subtitle="Intent: Technical Troubleshooting" />
            <TraceStep time="14:22:01.115" title="Recalling memory..." subtitle="Querying vector database" active color="bg-primary" />
            <TraceStep time="14:22:01.450" title="Calling SQL Tool..." subtitle="Executing schema validation" color="bg-tertiary" />
            <TraceStep time="14:22:01.892" title="Synthesizing answer..." subtitle="Tokenizing response" active animate color="bg-primary" />
            <TraceStep title="Finalizing State" pending />
          </div>

          <div className="mt-8 pt-6 border-t border-outline-variant">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <div className="bg-surface-container-high px-3 py-2 border-b border-outline-variant flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-on-surface-variant">Environment</span>
                <span className="material-symbols-outlined text-xs text-on-surface-variant">unfold_more</span>
              </div>
              <div className="p-3 font-mono text-[11px] space-y-1 text-on-surface-variant">
                <div><span className="text-secondary">OS:</span> "Dodo_Linux_Kernel_x64"</div>
                <div><span className="text-secondary">RUNTIME:</span> "Node_v20.1"</div>
                <div><span className="text-secondary">IS_PROD:</span> <span className="text-error">false</span></div>
                <div><span className="text-secondary">API_KEY:</span> "********"</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const Toggle = ({ label, active }: any) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-on-surface">{label}</span>
    <div className={`w-10 h-5 rounded-full relative flex items-center px-0.5 transition-colors border ${active ? 'bg-primary border-primary' : 'bg-surface-container-highest border-outline-variant'}`}>
      <div className={`w-4 h-4 bg-on-surface rounded-full transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  </div>
);

const Message = ({ sender, role, content, icon, isUser, badges }: any) => (
  <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} group`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isUser ? 'bg-primary-container border-primary/20' : 'bg-surface-container-high border-outline-variant'}`}>
      <span className={`material-symbols-outlined text-lg ${isUser ? 'text-on-primary-container' : 'text-primary'}`}>{icon}</span>
    </div>
    <div className={`space-y-2 flex-1 ${isUser ? 'items-end flex flex-col' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm text-on-surface">{sender}</span>
        {role && <span className="text-[10px] text-on-surface-variant font-mono bg-surface-container-highest px-1.5 py-0.5 rounded font-bold uppercase">{role}</span>}
        {badges?.map((badge: any, i: number) => (
          <span key={i} className={`text-[9px] font-mono border px-1.5 py-0.5 rounded flex items-center gap-1 font-bold uppercase tracking-wider ${badge.color}`}>
            <span className="material-symbols-outlined text-[10px]">{badge.icon}</span> {badge.label}
          </span>
        ))}
      </div>
      <div className={`p-4 rounded-xl border text-sm leading-relaxed ${isUser ? 'bg-secondary-container/10 border-secondary/20 text-right max-w-lg' : 'bg-surface-container-high/50 border-outline-variant text-on-surface'}`}>
        {content}
      </div>
    </div>
  </div>
);

const TraceStep = ({ time, title, subtitle, active, animate, pending, color = "bg-outline-variant" }: any) => (
  <div className={`relative ${pending ? 'opacity-30' : ''}`}>
    <div className={`absolute left-[-29px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-low ${color} ${animate ? 'animate-ping' : ''}`}></div>
    {animate && <div className={`absolute left-[-29px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-low ${color}`}></div>}
    <div className="space-y-1">
      {time && <p className="text-[10px] text-on-surface-variant font-mono">{time}</p>}
      <p className={`text-xs font-bold ${active ? 'text-primary' : 'text-on-surface'}`}>{title}</p>
      {subtitle && <p className="text-[11px] text-on-surface-variant">{subtitle}</p>}
    </div>
  </div>
);
