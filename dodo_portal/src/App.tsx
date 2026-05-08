import React from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { MainChart } from './components/MainChart';
import { AgentList } from './components/AgentList';
import { Search, Bell, Command, ChevronRight } from 'lucide-react';

function App() {
  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      
      <main className="flex-1 pl-64 p-8">
        {/* Top Navigation */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search institutional data, agents, or memory..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:bg-white/[0.07] transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-lg border border-white/10">
                <Command size={12} className="text-white/40" />
                <span className="text-[10px] font-bold text-white/40">K</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-8">
            <button className="p-3 glass-panel bg-white/5 border-white/10 relative group">
              <Bell size={20} className="text-white/60 group-hover:text-white transition-colors" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full neon-glow" />
            </button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-bold">Praveen P.</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Institutional Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Praveen" 
                  alt="Avatar" 
                  className="w-full h-full rounded-full bg-white/5"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-white/40 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
                <ChevronRight size={12} />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Overview</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight">Institutional Intelligence</h2>
            </div>
            <button className="bg-primary text-background font-bold px-6 py-3 rounded-2xl neon-glow hover:scale-105 active:scale-95 transition-all">
              Initialize New Agent
            </button>
          </div>

          <StatsGrid />
          
          <div className="flex flex-col xl:flex-row gap-8">
            <div className="flex-[2]">
              <MainChart />
            </div>
            <div className="flex-1 flex">
              <AgentList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
