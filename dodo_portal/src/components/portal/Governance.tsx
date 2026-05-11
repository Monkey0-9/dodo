
export const Governance = () => {
  return (
    <div className="flex h-full overflow-hidden -m-8">
      {/* Center Workspace */}
      <section className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest overflow-y-auto no-scrollbar relative">
        {/* Header Section */}
        <div className="p-6 border-b border-outline-variant flex justify-between items-end bg-surface/50 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-on-surface mb-1 uppercase tracking-tight">IAM & Governance</h1>
            <p className="text-sm text-on-surface-variant">System-wide entity oversight and resource isolation control.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 h-9 flex items-center gap-2 bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Filters</span>
            </button>
            <button className="px-4 h-9 flex items-center gap-2 bg-primary text-on-primary hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono">New Entity</span>
            </button>
          </div>
        </div>

        {/* Quota Management Bento Grid */}
        <div className="p-6 grid grid-cols-12 gap-6 border-b border-outline-variant">
          <div className="col-span-12">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4 font-mono">System Quota Aggregation</h2>
          </div>
          <QuotaCard label="COMPUTE_THREADS" percent={82} active="4.2k" limit="5.0k" color="bg-primary" />
          <QuotaCard label="MEM_PROVISIONED" percent={94} active="1.8TB" limit="2.0TB" color="bg-tertiary" />
          <QuotaCard label="IOPS_GLOBAL" percent={12} active="125k" limit="1.0M" color="bg-on-surface" />
        </div>

        {/* High-Density Entity Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-high border-b border-outline-variant sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Entity Name</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Type</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono text-right">CPU Util</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono text-right">Mem Util</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono text-right">Policies</th>
                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Last Active</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm text-on-surface divide-y divide-outline-variant/30">
              <EntityRow name="ORG-OMEGA-CORE" type="ORGANIZATION" status="ACTIVE" cpu="64.2%" mem="42.1%" policies="142" active="0.2s AGO" icon="corporate_fare" color="text-primary" />
              <EntityRow name="PRJ-NEURAL-SCAN" type="PROJECT" status="PROVISIONED" cpu="12.5%" mem="8.4%" policies="28" active="4.5m AGO" icon="folder_managed" color="text-primary" />
              <EntityRow name="SVC-AUTH-ROUTER" type="SVC_ACCOUNT" status="PEAK_LOAD" cpu="92.1%" mem="12.0%" policies="8" active="SYNCED" icon="smart_toy" color="text-tertiary" />
              <EntityRow name="PRJ-LEGACY-BACKUP" type="PROJECT" status="QUOTA_EXCD" cpu="--" mem="--" policies="5" active="LOCKED" icon="lock_open" color="text-error" />
              <EntityRow name="ADMIN-CORE-ROOT" type="SVC_ACCOUNT" status="STABLE" cpu="0.1%" mem="2.0%" policies="∞" active="STEADY" icon="shield_person" color="text-on-surface-variant" />
            </tbody>
          </table>
        </div>
      </section>

      {/* Right-Side Policy Inspector Panel */}
      <aside className="w-[360px] h-full bg-surface-container flex flex-col z-20 shrink-0 border-l border-outline-variant">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">policy</span>
            <h3 className="text-[10px] font-bold uppercase tracking-widest font-mono">Policy Inspector</h3>
          </div>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">close</button>
        </div>
        <div className="p-6 flex flex-col gap-8 flex-1 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Target Entity</span>
            <div className="text-xl font-bold text-primary">ORG-OMEGA-CORE</div>
          </div>

          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Permission Manifest</span>
              <button className="flex items-center gap-1 text-primary hover:underline text-[10px] font-mono">
                <span className="material-symbols-outlined text-xs">content_copy</span>
                <span>COPY ID</span>
              </button>
            </div>
            <div className="flex-1 bg-surface-container-lowest border border-outline-variant p-4 overflow-hidden flex flex-col rounded-lg">
              <div className="font-mono text-[11px] text-on-surface-variant overflow-y-auto leading-relaxed">
                <span className="text-tertiary-fixed-dim">{'{'}</span><br/>
                &nbsp;&nbsp;<span className="text-primary">"Version"</span>: <span className="text-secondary">"2024-03-20"</span>,<br/>
                &nbsp;&nbsp;<span className="text-primary">"Statement"</span>: [<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;{'{'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">"Effect"</span>: <span className="text-secondary">"Allow"</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">"Action"</span>: [<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-secondary">"compute:v1:*"</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-secondary">"iam:global:read"</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;],<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">"Resource"</span>: <span className="text-secondary">"arn:dodo:iam::root:*"</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;{'}'},<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;{'{'}<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">"Effect"</span>: <span className="text-secondary">"Deny"</span>,<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-primary">"Action"</span>: <span className="text-secondary">"billing:edit"</span><br/>
                &nbsp;&nbsp;&nbsp;&nbsp;{'}'}<br/>
                &nbsp;&nbsp;]<br/>
                <span className="text-tertiary-fixed-dim">{'}'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-mono">Identity Trace Logs</span>
            <div className="space-y-2">
              <TraceLog label="AUTH_SUCCESS" time="12:44:02" color="text-primary" />
              <TraceLog label="TOKEN_REFRESH" time="12:43:55" color="text-primary" />
              <TraceLog label="POLICY_DENY" time="11:12:30" color="text-error" />
            </div>
          </div>

          <div className="relative w-full h-32 border border-outline-variant bg-surface-container-low overflow-hidden group rounded-lg shrink-0">
             <div className="absolute inset-0 bg-primary/10 opacity-30"></div>
             <div className="absolute inset-0 bg-linear-to-t from-surface-container-low to-transparent"></div>
             <div className="absolute bottom-3 left-3">
               <div className="text-[9px] font-mono font-bold text-primary uppercase">Node Physical Location</div>
               <div className="text-[11px] font-mono text-on-surface">RACK_A9 // DC_NORTH_02</div>
             </div>
          </div>
        </div>
        <div className="p-6 mt-auto border-t border-outline-variant">
          <button className="w-full py-3 bg-surface-container-high border border-outline-variant text-on-surface font-bold text-[10px] font-mono uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all">
            Edit Global Policy
          </button>
        </div>
      </aside>
    </div>
  );
};

const QuotaCard = ({ label, percent, active, limit, color }: { label: string, percent: number, active?: boolean | string, limit?: string | number, color: string }) => (
  <div className="col-span-4 p-4 bg-surface-container border border-outline-variant flex flex-col gap-4 rounded-lg">
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-mono text-on-surface font-bold">{label}</span>
      <span className={`text-[11px] font-mono font-bold ${percent > 90 ? 'text-error' : percent > 75 ? 'text-primary' : 'text-on-surface'}`}>{percent}%</span>
    </div>
    <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
      <div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${percent}%` }}></div>
    </div>
    <div className="flex justify-between text-[9px] font-mono font-bold uppercase text-on-surface-variant">
      <span>{active} Actv</span>
      <span>{limit} Limit</span>
    </div>
  </div>
);

const EntityRow = ({ name, type, status, cpu, mem, policies, active, icon, color }: { name: string, type: string, status: string, cpu: string, mem: string, policies: string, active?: boolean | string, icon: React.ReactNode, color: string }) => (
  <tr className="hover:bg-surface-container transition-colors group">
    <td className="px-6 py-3 flex items-center gap-2">
      <span className={`material-symbols-outlined text-[16px] ${color}`}>{icon}</span>
      <span className="font-bold">{name}</span>
    </td>
    <td className="px-6 py-3 text-on-surface-variant text-[11px]">{type}</td>
    <td className="px-6 py-3">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${status.includes('ACTIVE') || status.includes('SYNCED') || status.includes('STABLE') ? 'bg-primary' : status.includes('PEAK') ? 'bg-tertiary' : 'bg-error'}`}></div>
        <span className="text-[11px] font-bold">{status}</span>
      </div>
    </td>
    <td className={`px-6 py-3 text-right ${cpu.includes('9') ? 'text-tertiary' : ''}`}>{cpu}</td>
    <td className="px-6 py-3 text-right">{mem}</td>
    <td className="px-6 py-3 text-right font-bold">{policies}</td>
    <td className="px-6 py-3 text-on-surface-variant text-[11px] font-bold">{active}</td>
    <td className="px-6 py-3 text-right">
      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-lg">chevron_right</button>
    </td>
  </tr>
);

const TraceLog = ({ label, time, color }: { label: string, time: string, color: string }) => (
  <div className="flex items-center justify-between p-2 border-b border-outline-variant/30 hover:bg-surface-container transition-colors rounded">
    <span className={`text-[10px] font-mono font-bold ${color}`}>{label}</span>
    <span className="text-[10px] font-mono text-on-surface-variant">{time}</span>
  </div>
);
