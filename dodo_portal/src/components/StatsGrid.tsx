import React from 'react';
import { Cpu, Database, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Active Agents', value: '142', icon: Cpu, color: 'text-primary', glow: 'neon-glow' },
  { label: 'Memory Capacity', value: '∞', icon: Database, color: 'text-secondary', glow: 'secondary-glow' },
  { label: 'Avg Latency', value: '142ms', icon: Zap, color: 'text-yellow-400', glow: 'shadow-yellow-400/20' },
  { label: 'Total Runs', value: '1.2M', icon: Clock, color: 'text-green-400', glow: 'shadow-green-400/20' },
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
          className="glass-panel p-6 relative overflow-hidden group hover:border-white/20 transition-all duration-500"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color} transition-transform duration-500 group-hover:scale-110`}>
              <stat.icon size={24} />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[10px] text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded-full">+12.5%</span>
            <span className="text-[10px] text-white/20">vs last 24h</span>
          </div>
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-10 rounded-full bg-current ${stat.color}`} />
        </motion.div>
      ))}
    </div>
  );
};
