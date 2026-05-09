import { 
  LayoutDashboard, 
  Users, 
  BrainCircuit, 
  Settings, 
  Activity, 
  ShieldCheck, 
  Terminal, 
  Cpu,
  Layers
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const menuItems = [
  { icon: LayoutDashboard, label: 'Control Center', active: true },
  { icon: Users, label: 'Agents Grid', active: false },
  { icon: Layers, label: 'Workstreams', active: false },
  { icon: BrainCircuit, label: 'Neural Memory', active: false },
  { icon: Terminal, label: 'Operations', active: false },
  { icon: Activity, label: 'Telemetry', active: false },
  { icon: ShieldCheck, label: 'Security Vault', active: false },
  { icon: Settings, label: 'Global Config', active: false },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen glass-panel-heavy rounded-none border-y-0 border-l-0 flex flex-col fixed left-0 top-0 z-50">
      {/* Brand Section */}
      <div className="p-8 flex items-center gap-4">
        <div className="relative group">
          <div className="w-12 h-12 primary-gradient rounded-2xl flex items-center justify-center neon-glow group-hover:scale-110 transition-transform duration-500">
            <Cpu size={24} className="text-background" />
          </div>
          <div className="absolute -inset-1 primary-gradient rounded-2xl opacity-20 blur group-hover:opacity-40 transition-opacity" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-gradient">DODO</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Grid Online</span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            aria-label={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 group relative",
              item.active 
                ? "text-primary bg-primary/5" 
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
          >
            {item.active && (
              <motion.div 
                layoutId="active-pill"
                className="absolute left-0 w-1 h-6 primary-gradient rounded-r-full"
              />
            )}
            <item.icon size={18} className={clsx(
              "transition-colors duration-500",
              item.active ? "text-primary" : "group-hover:text-white"
            )} />
            <span className="font-semibold text-sm tracking-tight">{item.label}</span>
            {item.active && (
              <div className="ml-auto w-1 h-1 rounded-full bg-primary neon-glow-text" />
            )}
          </motion.button>
        ))}
      </nav>
      
      {/* System Integrity Card */}
      <div className="p-6">
        <div className="p-5 glass-panel rounded-3xl border-white/5 relative group cursor-help">
          <div className="absolute inset-0 bg-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <ShieldCheck size={16} className="text-success" />
            </div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Core Integrity</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gradient">99.998%</span>
              <span className="text-[10px] font-bold text-success uppercase tracking-widest">Secure</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '99.998%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-full primary-gradient rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
