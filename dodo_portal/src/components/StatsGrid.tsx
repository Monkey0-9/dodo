import { 
  Zap, 
  Activity, 
  Binary, 
  ChevronUp, 
  ChevronDown,
  Globe
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { AnalyticsStats } from '../api/types';

export const StatsGrid = () => {
  const [statsData, setStatsData] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.analytics.getStats();
        setStatsData(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
    
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !statsData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel p-6 h-32 animate-pulse bg-white/5" />
        ))}
      </div>
    );
  }

  const stats = [
    { 
      label: 'Grid Throughput', 
      value: statsData.throughput, 
      unit: 'req/s', 
      change: statsData.changes.throughput, 
      icon: Zap, 
      color: 'text-primary',
      trend: statsData.trends.throughput
    },
    { 
      label: 'Active Threads', 
      value: statsData.active_threads, 
      unit: 'cores', 
      change: statsData.changes.active_threads, 
      icon: Activity, 
      color: 'text-success',
      trend: statsData.trends.active_threads
    },
    { 
      label: 'Neural Entropy', 
      value: statsData.neural_entropy, 
      unit: 'bits', 
      change: statsData.changes.neural_entropy, 
      icon: Binary, 
      color: 'text-accent',
      trend: statsData.trends.neural_entropy
    },
    { 
      label: 'Global Latency', 
      value: statsData.global_latency, 
      unit: 'ms', 
      change: statsData.changes.global_latency, 
      icon: Globe, 
      color: 'text-warning',
      trend: statsData.trends.global_latency
    },
  ];

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
              {stat.trend === 'down' && <ChevronDown size={10} />}
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

