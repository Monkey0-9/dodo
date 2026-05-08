import React from 'react';
import { LayoutDashboard, Users, BrainCircuit, Settings, Activity, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Users, label: 'Agents', active: false },
  { icon: BrainCircuit, label: 'Memory', active: false },
  { icon: Activity, label: 'Telemetry', active: false },
  { icon: ShieldCheck, label: 'Security', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen glass-panel rounded-none border-y-0 border-l-0 flex flex-col p-6 fixed left-0 top-0 z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center neon-glow">
          <span className="text-background font-bold text-xl">D</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">DODO</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
              item.active 
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon size={20} className={clsx(item.active ? "text-primary" : "text-white/40 group-hover:text-white")} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="mt-auto p-4 glass-panel bg-white/5 border-white/5 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">System Status</span>
        </div>
        <p className="text-sm font-medium">Production Healthy</p>
        <p className="text-[10px] text-white/30 mt-1">Uptime: 99.998%</p>
      </div>
    </aside>
  );
};
