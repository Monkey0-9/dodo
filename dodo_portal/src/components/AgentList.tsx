import React from 'react';
import { Activity, Shield, HardDrive, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const agents = [
  { id: 'ag-001', name: 'Dodo-Alpha', status: 'Healthy', type: 'Trading', memory: '1.2 GB', health: 98 },
  { id: 'ag-002', name: 'Risk-Sentry', status: 'Healthy', type: 'Security', memory: '850 MB', health: 100 },
  { id: 'ag-003', name: 'Market-Scanner', status: 'Optimizing', type: 'Inference', memory: '4.5 GB', health: 85 },
  { id: 'ag-004', name: 'Audit-Log-v2', status: 'Healthy', type: 'Database', memory: '256 MB', health: 99 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export const AgentList = () => {
  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="glass-panel p-6 flex-1"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Autonomous Agents</h3>
        <button className="text-primary text-xs font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
          View All <ExternalLink size={14} />
        </button>
      </div>
      
      <div className="space-y-4">
        {agents.map((agent) => (
          <motion.div 
            key={agent.id} 
            variants={item}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 group cursor-pointer transition-all duration-300"
          >
            <div className={`p-3 rounded-xl relative ${agent.status === 'Healthy' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
              <Shield size={20} />
              {agent.status === 'Healthy' && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold group-hover:text-primary transition-colors">{agent.name}</h4>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">{agent.type}</span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <Activity size={12} className="text-white/30" />
                  <span className={`text-xs ${agent.status === 'Healthy' ? 'text-green-400' : 'text-yellow-400'}`}>{agent.status}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive size={12} className="text-white/30" />
                  <span className="text-xs text-white/60">{agent.memory}</span>
                </div>
              </div>
            </div>
            
            <div className="w-24 text-right">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-white/30 uppercase font-bold">Health</span>
                <span className="text-xs font-bold">{agent.health}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${agent.health}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${agent.health > 90 ? 'bg-primary' : 'bg-yellow-400'}`} 
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
