import { useState } from 'react';
import { X, Wrench, Loader2, Code, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';

export const AddToolModal = ({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [toolType, setToolType] = useState('custom');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || loading) return;

    setLoading(true);
    try {
      await api.tools.create({
        name: name.trim().toLowerCase().replace(/\s+/g, '_'),
        description: description,
        tool_type: toolType,
        json_schema: {}
      });
      onSuccess();
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setToolType('custom');
    } catch (error) {
      console.error('Failed to register tool:', error);
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
            className="w-full max-w-xl glass-panel-heavy p-10 relative overflow-hidden shadow-[0_0_100px_rgba(76,215,246,0.1)]"
          >
            <div className="grid-overlay absolute inset-0 opacity-10 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 secondary-gradient rounded-2xl flex items-center justify-center neon-glow">
                  <Wrench size={28} className="text-background" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-gradient tracking-tight">Register Tool</h3>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Orchestration & Capabilities Integration</p>
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
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Tool Designation (ID / Name)</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-secondary/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <Code className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-secondary transition-colors" size={20} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="web_search_v2"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-base font-bold focus:outline-none focus:border-secondary/40 transition-all placeholder:text-white/10 text-on-surface"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Tool Capabilities Description</label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-secondary/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <input 
                    type="text" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide description of parameters and functionalities..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm focus:outline-none focus:border-secondary/40 transition-all placeholder:text-white/10 text-on-surface"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Protocol / Connection Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setToolType('custom')}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                      toolType === 'custom' 
                        ? 'bg-secondary/10 border-secondary/40 text-secondary' 
                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Cpu size={20} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">Custom Function</p>
                      <p className="text-[10px] opacity-60">Local execution block</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setToolType('mcp')}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-2 ${
                      toolType === 'mcp' 
                        ? 'bg-secondary/10 border-secondary/40 text-secondary' 
                        : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Wrench size={20} />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider">MCP Protocol</p>
                      <p className="text-[10px] opacity-60">Model Context Protocol server</p>
                    </div>
                  </button>
                </div>
              </div>

              <button 
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className="w-full h-16 relative group disabled:opacity-30 transition-opacity"
              >
                <div className="absolute inset-0 secondary-gradient rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative h-full secondary-gradient text-background font-black uppercase tracking-[0.3em] text-sm rounded-2xl flex items-center justify-center gap-3 group-hover:scale-[1.01] active:scale-[0.98] transition-all">
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Wrench size={20} />
                      Integrate Capacity
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
