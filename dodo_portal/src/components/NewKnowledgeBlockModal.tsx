import { useState } from 'react';
import { X, Database, Loader2, Edit3, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';

export const NewKnowledgeBlockModal = ({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [limit, setLimit] = useState(2000);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!label.trim() || !value.trim() || loading) return;

    setLoading(true);
    try {
      await api.blocks.create({
        label: label.trim(),
        value: value.trim(),
        limit: Number(limit)
      });
      onSuccess();
      onClose();
      // Reset form
      setLabel('');
      setValue('');
      setLimit(2000);
    } catch (error) {
      console.error('Failed to create memory block:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
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
            className="w-full max-w-xl glass-panel-heavy p-10 relative overflow-hidden shadow-[0_0_100px_rgba(208,188,255,0.1)]"
          >
            <div className="grid-overlay absolute inset-0 opacity-10 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 tertiary-gradient rounded-2xl flex items-center justify-center neon-glow">
                  <Database size={28} className="text-background" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gradient tracking-tight">Index Block</h3>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Memory Matrix Registration</p>
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
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Block Label / Category</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-tertiary/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-tertiary transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="E.g., human, persona, system_override"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-base font-bold focus:outline-none focus:border-tertiary/40 transition-all placeholder:text-white/10 text-on-surface"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Context Value (Data Payload)</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-tertiary/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <Edit3 className="absolute left-5 top-6 text-white/20 group-focus-within:text-tertiary transition-colors" size={20} />
                  <textarea 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter the factual parameters, prompts, or data points to store in this context block..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-tertiary/40 transition-all min-h-[120px] resize-none leading-relaxed text-on-surface"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Token Limit Context Window</label>
                  <span className="text-tertiary font-mono text-sm font-bold">{limit} tokens</span>
                </div>
                <div className="flex items-center gap-4">
                  <input 
                    title="Token Limit Slider"
                    type="range"
                    min="500"
                    max="16000"
                    step="500"
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-tertiary focus:outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleCreate}
                disabled={!label.trim() || !value.trim() || loading}
                className="w-full h-16 relative group disabled:opacity-30 transition-opacity"
              >
                <div className="absolute inset-0 tertiary-gradient rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative h-full tertiary-gradient text-background font-black uppercase tracking-[0.3em] text-sm rounded-2xl flex items-center justify-center gap-3 group-hover:scale-[1.01] active:scale-[0.98] transition-all">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Database size={20} />
                      Commit to Memory
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
