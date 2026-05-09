import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { MainChart } from './components/MainChart';
import { AgentList } from './components/AgentList';
import { Chat } from './components/Chat';
import { CreateAgentModal } from './components/CreateAgentModal';
import { Search, Bell, Command, ChevronRight, LayoutGrid, List, Filter } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAgentCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex bg-background min-h-screen text-white overflow-x-hidden selection:bg-primary/30 selection:text-white">
      <Sidebar />
      
      <main className="flex-1 pl-64 p-10 relative">
        <div className="grid-overlay absolute inset-0 opacity-[0.03] pointer-events-none" />
        
        {/* Top Navigation */}
        <header className="flex justify-between items-center mb-12 relative z-10">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <div className="relative w-full group">
              <div className="absolute inset-0 bg-white/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search the grid, neural logs, or encrypted vault..." 
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-sm font-medium focus:outline-none focus:border-primary/30 focus:bg-white/[0.05] transition-all text-white placeholder:text-white/10"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/5">
                <Command size={14} className="text-white/20" />
                <span className="text-[10px] font-black text-white/20 tracking-tighter">K</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 ml-10">
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-1">
                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(0,255,170,0.5)]" />
              </div>
              <span className="text-[10px] font-black text-success uppercase tracking-[0.2em]">Live Connection</span>
            </div>

            <button className="p-4 glass-panel bg-white/[0.02] border-white/5 relative group rounded-2xl hover:bg-white/5 transition-all">
              <Bell size={20} className="text-white/30 group-hover:text-white transition-colors" />
              <span className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full neon-glow shadow-[0_0_10px_rgba(0,242,255,1)]" />
            </button>
            
            <div className="flex items-center gap-4 pl-6 border-l border-white/5">
              <div className="text-right">
                <p className="text-sm font-black text-gradient tracking-tight">Institutional Admin</p>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Master Access</p>
              </div>
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 primary-gradient rounded-full opacity-20 blur group-hover:opacity-40 transition-opacity" />
                <div className="w-12 h-12 rounded-full border border-white/10 p-0.5 relative z-10 overflow-hidden">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=DodoAdmin" 
                    alt="Avatar" 
                    className="w-full h-full rounded-full bg-white/5 grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="space-y-12 relative z-10">
          <div className="flex justify-between items-end">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 text-white/20 mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Institutional</span>
                <ChevronRight size={10} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Grid Console</span>
              </div>
              <h2 className="text-5xl font-black tracking-tighter text-gradient leading-tight">Neural Command Center</h2>
            </motion.div>
            
            <div className="flex items-center gap-4">
               <div className="flex bg-white/[0.02] p-1.5 rounded-2xl border border-white/5">
                <button className="p-2.5 rounded-xl bg-white/5 text-primary shadow-xl">
                  <LayoutGrid size={18} />
                </button>
                <button className="p-2.5 rounded-xl text-white/20 hover:text-white transition-colors">
                  <List size={18} />
                </button>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="h-14 px-8 relative group"
              >
                <div className="absolute inset-0 primary-gradient rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative h-full primary-gradient text-background font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl flex items-center justify-center gap-3 shadow-2xl group-hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Initialize Unit
                </div>
              </button>
            </div>
          </div>

          <StatsGrid />
          
          <div className="flex flex-col 2xl:flex-row gap-10">
            <div className="flex-[1.6]">
              <MainChart />
            </div>
            <div className="flex-1 flex">
              <AgentList key={refreshKey} onSelectAgent={setSelectedAgentId} />
            </div>
          </div>
        </div>

        {/* Floating Background Accents */}
        <div className="fixed -bottom-20 -left-20 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="fixed -top-20 -right-20 w-[600px] h-[600px] bg-secondary/5 blur-[150px] rounded-full pointer-events-none" />

        {/* Chat Drawer */}
        <AnimatePresence>
          {selectedAgentId && (
            <Chat 
              agentId={selectedAgentId} 
              onClose={() => setSelectedAgentId(null)} 
            />
          )}
        </AnimatePresence>

        {/* Modals */}
        <CreateAgentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAgentCreated}
        />
      </main>
    </div>
  );
}

export default App;
