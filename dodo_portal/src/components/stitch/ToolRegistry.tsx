
export const ToolRegistry = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Tool Registry</h2>
          <p className="text-on-surface-variant mt-1 text-lg">42 active tools across 12 categories. Configure orchestration capabilities and external integrations.</p>
        </div>
        <button className="flex items-center gap-2 bg-surface-container-high border border-outline-variant px-5 py-2.5 rounded-lg hover:bg-surface-bright transition-all active:scale-95 text-on-surface">
          <span className="material-symbols-outlined text-primary">add</span>
          <span className="font-mono-label uppercase tracking-widest text-[11px]">Add Tool</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <span className="font-mono-label uppercase text-on-surface-variant text-[11px]">Filter by</span>
          <select title="Category Filter" className="bg-surface-container border border-outline-variant rounded-lg text-sm py-1.5 pl-3 pr-8 focus:border-primary outline-none text-on-surface">
            <option>All Categories</option>
            <option>Database</option>
            <option>Search</option>
            <option>API</option>
            <option>Custom</option>
          </select>
          <select title="Status Filter" className="bg-surface-container border border-outline-variant rounded-lg text-sm py-1.5 pl-3 pr-8 focus:border-primary outline-none text-on-surface">
            <option>Active Status</option>
            <option>Disabled</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-surface-container-high/50 rounded hover:text-primary transition-all text-on-surface">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className="p-2 hover:text-on-surface-variant transition-all text-on-surface">
            <span className="material-symbols-outlined">view_list</span>
          </button>
        </div>
      </div>

      {/* Grid of Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <ToolCard 
          title="Google Search" 
          category="SEARCH" 
          icon="travel_explore" 
          status="READ/WRITE" 
          version="v2.1.0" 
          success="98.2%" 
          latency="210ms" 
          active 
        />
        <ToolCard 
          title="PostgreSQL Connect" 
          category="DATABASE" 
          icon="database" 
          status="READ/WRITE" 
          version="v4.0.2" 
          success="99.9%" 
          latency="12ms" 
          active 
          iconColor="text-secondary"
        />
        <ToolCard 
          title="Slack Webhook" 
          category="API" 
          icon="hub" 
          status="WRITE ONLY" 
          version="v1.3.4" 
          success="94.5%" 
          latency="450ms" 
          active 
          iconColor="text-tertiary"
          statusColor="bg-primary/10 text-primary"
        />
      </div>

      {/* Bottom Section: Pending Integrations */}
      <section className="mt-12">
        <h3 className="text-2xl font-bold text-on-surface mb-6">Pending Integrations</h3>
        <div className="glass-panel rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-high border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Integration</th>
                <th className="px-6 py-4 font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Type</th>
                <th className="px-6 py-4 font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium">Issue</th>
                <th className="px-6 py-4 font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              <tr className="hover:bg-surface-variant/20 transition-all">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container border border-outline-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-error">link_off</span>
                  </div>
                  <span className="font-medium text-on-surface">Shopify Admin API</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-on-surface-variant font-mono text-[11px]">E-COMMERCE</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-error text-sm">
                    <span className="material-symbols-outlined text-sm">key</span>
                    <span>Missing API Secret</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onNavigate('settings')}
                    className="text-primary hover:underline font-mono-label text-[11px] uppercase tracking-widest"
                  >
                    Configure
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-variant/20 transition-all">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-surface-container border border-outline-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
                  </div>
                  <span className="font-medium text-on-surface">Redis Cache v6</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-on-surface-variant font-mono text-[11px]">DATABASE</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <span className="material-symbols-outlined text-sm">vpn_lock</span>
                    <span>Awaiting Proxy Auth</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary hover:underline font-mono-label text-[11px] uppercase tracking-widest">Retry</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const ToolCard = ({ title, category, icon, status, version, success, latency, active, iconColor = "text-primary", statusColor = "bg-secondary/10 text-secondary" }: any) => (
  <div className="glass-panel rounded-xl p-5 hover:border-primary/50 transition-all group relative">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center border border-outline-variant group-hover:border-primary/30">
          <span className={`material-symbols-outlined ${iconColor} text-3xl`}>{icon}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-on-surface">{title}</h3>
          <span className="font-mono text-[10px] text-on-surface-variant uppercase bg-surface-container-high px-2 py-0.5 rounded tracking-wider">{category}</span>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input title={`Toggle ${title} active status`} checked={active} className="sr-only peer" type="checkbox" onChange={() => {}} />
        <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`${statusColor} border border-current/20 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-widest`}>{status}</span>
        <span className="text-on-surface-variant font-mono text-[10px] uppercase">{version}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline-variant/30">
        <div>
          <p className="text-on-surface-variant font-mono text-[9px] uppercase tracking-widest">Success Rate</p>
          <p className="text-primary text-xl font-bold">{success}</p>
        </div>
        <div>
          <p className="text-on-surface-variant font-mono text-[9px] uppercase tracking-widest">Avg Latency</p>
          <p className="text-on-surface text-xl font-bold">{latency}</p>
        </div>
      </div>
    </div>
  </div>
);
