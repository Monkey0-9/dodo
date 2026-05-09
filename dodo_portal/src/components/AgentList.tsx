import { useEffect, useState } from 'react';
import { Shield, HardDrive, Loader2, Cpu, Zap, Signal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';

export const AgentList = ({ onSelectAgent }: { onSelectAgent: (id: string) => void }) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await api.agents.list();
        setAgents(data);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel p-8 flex-1 flex items-center justify-center min-h-[500px] relative overflow-hidden">
        <div className="grid-overlay absolute inset-0 opacity-20" />
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <div className="absolute inset-0 blur-lg bg-primary/20 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-white font-black uppercase tracking-[0.3em] text-sm mb-1">Synchronizing Grid</p>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Accessing Secure Vault...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-panel p-8 flex-1 flex flex-col min-h-[500px] relative overflow-hidden"
    >
      <div className="grid-overlay absolute inset-0 opacity-10" />
      
      <div className="flex justify-between items-end mb-8 relative z-10">
        <div>
          <h3 className="text-2xl font-black text-gradient tracking-tight">Active Units</h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Deployed Agent Portfolio</p>
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center gap-2 group">
          Filter <Signal size={12} className="group-hover:text-primary transition-colors" />
        </button>
      </div>
      
      <div className="space-y-4 relative z-10">
        <AnimatePresence mode="popLayout">
          {agents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 px-6 text-center glass-panel bg-white/[0.02] border-white/5 rounded-4xl"
            >
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <Shield size={40} className="text-white/10 group-hover:text-primary/40 transition-colors" />
              </div>
              <h4 className="font-black text-xl mb-2 text-gradient">No Active Deployments</h4>
              <p className="text-xs text-white/30 max-w-[240px] leading-relaxed">Initialize your first autonomous agent unit to begin institutional grid operations.</p>
            </motion.div>
          ) : (
            agents.map((agent, i) => (
              <motion.div 
                key={agent.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
                onClick={() => onSelectAgent(agent.id)}
                className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-5 group cursor-pointer transition-all duration-500"
              >
                <div className="relative">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors border border-white/5">
                    <Cpu size={24} className="text-white/20 group-hover:text-primary transition-colors duration-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background border-2 border-surface rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,170,0.5)]" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black text-lg group-hover:text-primary transition-colors tracking-tight">{agent.name}</h4>
                    <span className="px-2 py-1 bg-white/5 rounded-lg text-[9px] font-black text-white/40 uppercase tracking-widest border border-white/5">{agent.agent_type.replace('_agent', '')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Zap size={10} className="text-primary" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Latency: 12ms</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HardDrive size={10} className="text-white/20" />
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{agent.id.substring(0, 8)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="w-20 text-right shrink-0">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Sync</span>
                    <span className="text-xs font-black text-white/60">100%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `100%` }}
                      transition={{ duration: 1.5, delay: i * 0.1 }}
                      className="h-full primary-gradient rounded-full shadow-[0_0_10px_rgba(0,242,255,0.3)]" 
                    />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-auto pt-8 border-t border-white/5 relative z-10 flex justify-between items-center">
        <div className="flex -space-x-3">
          {[1,2,3].map(i => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-white/5 flex items-center justify-center overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=agent${i}`} alt="Agent" className="w-full h-full" />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-surface bg-white/10 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white/60">+12</span>
          </div>
        </div>
        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:neon-glow-text transition-all">Grid Console &rarr;</button>
      </div>
    </motion.div>
  );
};
