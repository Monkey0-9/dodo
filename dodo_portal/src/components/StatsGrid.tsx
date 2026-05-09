import { 
  Zap, 
  Activity, 
  Binary, 
  ShieldAlert, 
  ChevronUp, 
  TrendingUp,
  Globe,
  Database
} from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { 
    label: 'Grid Throughput', 
    value: '1.2M', 
    unit: 'req/s', 
    change: '+12.5%', 
    icon: Zap, 
    color: 'text-primary',
    trend: 'up'
  },
  { 
    label: 'Active Threads', 
    value: '842', 
    unit: 'cores', 
    change: 'Stable', 
    icon: Activity, 
    color: 'text-success',
    trend: 'neutral'
  },
  { 
    label: 'Neural Entropy', 
    value: '0.042', 
    unit: 'bits', 
    change: '-5.2%', 
    icon: Binary, 
    color: 'text-accent',
    trend: 'down'
  },
  { 
    label: 'Global Latency', 
    value: '24', 
    unit: 'ms', 
    change: '+2ms', 
    icon: Globe, 
    color: 'text-warning',
    trend: 'up'
  },
];

export const StatsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5 }}
          className="glass-panel p-6 relative group overflow-hidden"
        >
          {/* Subtle Glow Effect */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity bg-current ${stat.color}`} />
          
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div className={clsx(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
              stat.trend === 'up' ? "bg-success/10 text-success" : 
              stat.trend === 'down' ? "bg-accent/10 text-accent" : "bg-white/10 text-white/40"
            )}>
              {stat.trend === 'up' && <ChevronUp size={10} />}
              {stat.change}
            </div>
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-gradient leading-none">{stat.value}</h3>
              <span className="text-xs font-bold text-white/20 uppercase tracking-widest">{stat.unit}</span>
            </div>
          </div>
          
          {/* Progress Bar Simulation */}
          <div className="mt-4 w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ duration: 1.5, delay: i * 0.1 + 0.5 }}
              className={`h-full primary-gradient opacity-40`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

import { clsx } from 'clsx';
