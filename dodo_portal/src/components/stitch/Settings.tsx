
export const Settings = () => {
  return (
    <div className="flex h-full overflow-hidden -m-8">
      {/* Settings Sub-Nav */}
      <nav className="hidden md:flex flex-col w-64 bg-surface-container-lowest/50 border-r border-outline-variant/50 p-6 gap-1 shrink-0">
        <p className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant opacity-60 mb-4 ml-4 font-bold">Configurations</p>
        <SettingsNavItem icon="settings" label="General" active />
        <SettingsNavItem icon="hub" label="Model Providers" />
        <SettingsNavItem icon="key" label="API Keys" />
        <SettingsNavItem icon="neurology" label="Memory Policies" />
        <SettingsNavItem icon="security" label="Security" />
        <SettingsNavItem icon="payments" label="Billing" />
      </nav>

      {/* Scrollable Settings Canvas */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-10">
          <div>
            <h2 className="text-3xl font-bold text-on-surface mb-2">Platform Settings</h2>
            <p className="text-on-surface-variant">Manage your organization, workspace identity, and global AI infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Section: General */}
            <section className="lg:col-span-12 glass-panel p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">corporate_fare</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">General Workspace</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Workspace Name</label>
                  <input title="Workspace Name" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:border-primary outline-none transition-all" type="text" defaultValue="Dodo Global Operations"/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Organization ID</label>
                  <div className="flex gap-2">
                    <input title="Organization ID" className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 font-mono text-sm opacity-70 outline-none text-on-surface" readOnly type="text" defaultValue="org_dd_8923456"/>
                    <button className="material-symbols-outlined bg-surface-container-high border border-outline-variant rounded-lg p-2 hover:bg-surface-bright transition-colors text-on-surface">content_copy</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Model Providers */}
            <section className="lg:col-span-8 glass-panel p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-tertiary/10 text-tertiary">
                    <span className="material-symbols-outlined">architecture</span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface">Model Providers</h3>
                </div>
                <button className="text-primary text-sm font-medium hover:underline">Add New</button>
              </div>
              <div className="space-y-4">
                <ProviderCard name="OpenAI" status="Active • gpt-4o-latest" icon="bolt" validated active />
                <ProviderCard name="Anthropic" status="Standby • claude-3-5-sonnet" icon="psychology" iconColor="text-violet-400" />
                <ProviderCard name="Local (Ollama)" status="Not configured" icon="terminal" iconColor="text-primary" setup />
              </div>
            </section>

            {/* Section: Appearance */}
            <section className="lg:col-span-4 glass-panel p-6 rounded-xl flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined">palette</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">Appearance</h3>
              </div>
              <div className="flex-1 space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Theme Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    <ThemeBtn icon="light_mode" label="Light" />
                    <ThemeBtn icon="dark_mode" label="Dark" active />
                    <ThemeBtn icon="monitor" label="Auto" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Accent Color</label>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary ring-2 ring-offset-2 ring-offset-surface ring-primary cursor-pointer"></div>
                    <div className="w-8 h-8 rounded-full bg-violet-500 cursor-pointer hover:scale-110 transition-transform"></div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 cursor-pointer hover:scale-110 transition-transform"></div>
                    <div className="w-8 h-8 rounded-full bg-orange-500 cursor-pointer hover:scale-110 transition-transform"></div>
                    <div className="w-8 h-8 rounded-full bg-rose-500 cursor-pointer hover:scale-110 transition-transform"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Memory Policies */}
            <section className="lg:col-span-12 glass-panel p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded bg-tertiary/20 text-tertiary">
                  <span className="material-symbols-outlined">memory</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">Memory & Persistence</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Knowledge Retention</label>
                      <span className="text-primary font-mono text-sm">6 Months</span>
                    </div>
                    <input title="Retention" className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer" type="range" defaultValue="65"/>
                    <div className="flex justify-between text-[10px] font-mono uppercase text-on-surface-variant opacity-50">
                      <span>Short-Term</span>
                      <span>Indefinite</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant font-bold">Compression Level</label>
                      <span className="text-secondary font-mono text-sm">Balanced</span>
                    </div>
                    <input title="Compression" className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer" type="range" defaultValue="40"/>
                    <div className="flex justify-between text-[10px] font-mono uppercase text-on-surface-variant opacity-50">
                      <span>Lossless</span>
                      <span>Aggressive</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Security Log Preview */}
            <section className="lg:col-span-12 bg-black/50 border border-outline-variant rounded-xl overflow-hidden">
              <div className="bg-surface-container-high px-4 py-2 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-error/40"></div>
                    <div className="w-2 h-2 rounded-full bg-secondary/40"></div>
                    <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant ml-2 font-bold">Recent Security Events</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">terminal</span>
              </div>
              <div className="p-4 font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto">
                <SecurityLog time="2023-10-24 14:22:01" type="AUTH_SUCCESS" typeColor="text-violet-400" content={<>User <span className="text-primary">admin_root</span> logged in from 192.168.1.45</>} />
                <SecurityLog time="2023-10-24 14:25:12" type="CONFIG_UPDATE" typeColor="text-cyan-400" content={<>Provider 'OpenAI' model set to 'gpt-4o-latest'</>} />
                <SecurityLog time="2023-10-24 15:01:44" type="ACCESS_DENIED" typeColor="text-error" content="Invalid API Key attempt on 'Anthropic' gateway" />
                <SecurityLog time="2023-10-24 15:10:00" type="MEMORY_FLUSH" typeColor="text-cyan-400" content="Cleared 2.4GB of expired knowledge vectors" />
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-4 pb-12">
            <button className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface font-medium hover:bg-surface-bright transition-all">
              Discard Changes
            </button>
            <button className="px-8 py-2.5 rounded-lg bg-linear-to-r from-primary to-secondary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsNavItem = ({ icon, label, active = false }: any) => (
  <a className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${active ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-bright/50'}`} href="#">
    <span className="material-symbols-outlined text-[20px]">{icon}</span>
    <span className="text-sm">{label}</span>
  </a>
);

const ProviderCard = ({ name, status, icon, iconColor = "text-on-surface", validated, setup, active }: any) => (
  <div className={`flex items-center justify-between p-4 bg-surface-container rounded-lg border transition-all ${active ? 'border-primary/30' : 'border-outline-variant/30'}`}>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center border border-white/10">
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
      <div>
        <p className="font-bold text-on-surface">{name}</p>
        <p className="text-xs text-on-surface-variant">{status}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {validated && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-mono uppercase rounded border border-emerald-500/20 tracking-widest font-bold">Validated</span>}
      {setup ? (
        <button className="bg-primary/10 text-primary px-3 py-1 rounded text-xs font-bold hover:bg-primary/20 transition-colors">Setup</button>
      ) : (
        <button className="material-symbols-outlined text-on-surface-variant hover:text-on-surface transition-colors">edit</button>
      )}
    </div>
  </div>
);

const ThemeBtn = ({ icon, label, active }: any) => (
  <button className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${active ? 'bg-surface-container-lowest border-primary text-primary' : 'bg-surface-container-high border-outline-variant hover:border-primary text-on-surface-variant'}`}>
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

const SecurityLog = ({ time, type, typeColor, content }: any) => (
  <p className="opacity-80">
    <span className="text-on-surface-variant/40">[{time}]</span> <span className={typeColor}>{type}:</span> <span className="text-on-surface-variant">{content}</span>
  </p>
);
