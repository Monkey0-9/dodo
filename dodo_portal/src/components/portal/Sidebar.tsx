import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItemProps {
  icon: string;
  label: string;
  id: string;
  active?: boolean;
  onNavigate: (id: string) => void;
}

const NavItem = ({ icon, label, id, active, onNavigate }: NavItemProps) => (
  <button 
    onClick={() => onNavigate(id)}
    className={cn(
      "w-full flex items-center gap-3 px-6 py-3 transition-all text-left",
      active 
        ? "bg-secondary-container/20 text-primary border-r-2 border-primary translate-x-1" 
        : "text-on-surface-variant hover:bg-surface-variant/30 hover:text-on-surface"
    )}
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="font-mono-label uppercase tracking-widest text-[11px]">{label}</span>
  </button>
);

export const Sidebar = ({ currentPath, onNavigate }: { currentPath: string, onNavigate: (id: string) => void }) => {
  return (
    <aside className="hidden lg:flex flex-col h-full w-64 bg-surface-container-low/90 backdrop-blur-lg border-r border-outline-variant py-5 z-50 fixed left-0 top-0">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-tertiary)" />
              </linearGradient>
            </defs>
            <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="url(#logo-grad)" />
            <path d="M16 6L24 11V21L16 26L8 21V11L16 6Z" fill="#131316" />
            <circle cx="16" cy="16" r="4" fill="url(#logo-grad)" />
          </svg>
          <div>
            <h1 className="font-headline-sm text-lg font-bold text-primary tracking-tight">Dodo OS</h1>
            <p className="font-mono-label text-[10px] uppercase tracking-widest text-on-surface-variant">v2.4.0-stable</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1">
        <NavItem id="dashboard" icon="dashboard" label="Dashboard" active={currentPath === 'dashboard'} onNavigate={onNavigate} />
        <NavItem id="agents" icon="smart_toy" label="Agents" active={currentPath === 'agents'} onNavigate={onNavigate} />
        <NavItem id="memory" icon="memory" label="Memory" active={currentPath === 'memory'} onNavigate={onNavigate} />
        <NavItem id="workflows" icon="account_tree" label="Workflows" active={currentPath === 'workflows'} onNavigate={onNavigate} />
        <NavItem id="runtime" icon="terminal" label="Runtime" active={currentPath === 'runtime'} onNavigate={onNavigate} />
        <NavItem id="tools" icon="construction" label="Tools" active={currentPath === 'tools'} onNavigate={onNavigate} />
        <NavItem id="logs" icon="list_alt" label="Logs" active={currentPath === 'logs'} onNavigate={onNavigate} />
        <NavItem id="topology" icon="hub" label="Topology" active={currentPath === 'topology'} onNavigate={onNavigate} />
        <NavItem id="playground" icon="sports_esports" label="Playground" active={currentPath === 'playground'} onNavigate={onNavigate} />
        <NavItem id="analytics" icon="monitoring" label="Analytics" active={currentPath === 'analytics'} onNavigate={onNavigate} />
        <NavItem id="governance" icon="policy" label="Governance" active={currentPath === 'governance'} onNavigate={onNavigate} />
        <NavItem id="settings" icon="settings" label="Settings" active={currentPath === 'settings'} onNavigate={onNavigate} />
      </nav>

      <div className="px-4 mt-auto">
        <button className="w-full cyan-violet-gradient text-on-primary py-3 rounded font-mono-label uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-[11px]">
          <span className="material-symbols-outlined">bolt</span>
          Upgrade Plan
        </button>
        
        <div className="mt-6 border-t border-outline-variant pt-4 space-y-2">
          <a className="flex items-center gap-3 text-on-surface-variant px-2 py-2 hover:text-on-surface text-xs" href="#">
            <span className="material-symbols-outlined text-sm">description</span> 
            Documentation
          </a>
          <a className="flex items-center gap-3 text-on-surface-variant px-2 py-2 hover:text-on-surface text-xs" href="#">
            <span className="material-symbols-outlined text-sm">contact_support</span> 
            Support
          </a>
        </div>
      </div>
    </aside>
  );
};
