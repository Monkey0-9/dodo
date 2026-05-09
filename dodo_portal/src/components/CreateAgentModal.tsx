import { useState } from 'react';
import { X, Bot, Wand2, Shield, BrainCircuit, Loader2, Cpu, Database, Network, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';

export const CreateAgentModal = ({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [name, setName] = useState('');
  const [system, setSystem] = useState('You are an institutional intelligence unit. Focus on mission-critical execution and data integrity.');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || loading) return;

    setLoading(true);
    try {
      await api.agents.create({
        name: name,
        system: system,
        agent_type: 'dodo_v1_agent',
        model: 'openai/gpt-4o',
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create agent:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="w-full max-w-xl glass-panel-heavy p-10 relative overflow-hidden shadow-[0_0_100px_rgba(0,242,255,0.1)]"
          >
            <div className="grid-overlay absolute inset-0 opacity-10 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 primary-gradient rounded-2xl flex items-center justify-center neon-glow">
                  <Cpu size={28} className="text-background" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gradient tracking-tight">Deploy Unit</h3>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Autonomous Grid Initialization</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 hover:bg-white/5 rounded-2xl transition-all text-white/20 hover:text-white"
                aria-label="Close Modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Codename / Designation</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="UNIT-ALPHA-7"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-base font-bold focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Cognitive Architecture</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <BrainCircuit className="absolute left-5 top-6 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
                  <textarea 
                    value={system}
                    onChange={(e) => setSystem(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-primary/40 transition-all min-h-[160px] resize-none leading-relaxed"
                    placeholder="Describe the unit's core mission and operational parameters..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 group hover:bg-white/[0.04] transition-colors">
                  <Database size={16} className="text-primary/40" />
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Storage</p>
                    <p className="text-xs font-black text-white/60">Encrypted</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 group hover:bg-white/[0.04] transition-colors">
                  <Network size={16} className="text-secondary/40" />
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Protocol</p>
                    <p className="text-xs font-black text-white/60">v1.4 Neural</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 group hover:bg-white/[0.04] transition-colors">
                  <Zap size={16} className="text-success/40" />
                  <div>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Priority</p>
                    <p className="text-xs font-black text-white/60">High-Tier</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className="w-full h-16 relative group disabled:opacity-30 transition-opacity"
              >
                <div className="absolute inset-0 primary-gradient rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative h-full primary-gradient text-background font-black uppercase tracking-[0.3em] text-sm rounded-2xl flex items-center justify-center gap-3 group-hover:scale-[1.01] active:scale-[0.98] transition-all">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Wand2 size={20} />
                      Authorize Deployment
                    </>
                  )}
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
