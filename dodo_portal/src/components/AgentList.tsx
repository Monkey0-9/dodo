import React from 'react';
import { Activity, Shield, HardDrive, ExternalLink } from 'lucide-react';

const agents = [
  { id: 'ag-001', name: 'Nexus-Quant', status: 'Healthy', type: 'Trading', memory: '1.2 GB', health: 98 },
  { id: 'ag-002', name: 'Risk-Sentry', status: 'Healthy', type: 'Security', memory: '850 MB', health: 100 },
  { id: 'ag-003', name: 'Market-Scanner', status: 'Optimizing', type: 'Inference', memory: '4.5 GB', health: 85 },
  { id: 'ag-004', name: 'Audit-Log-v2', status: 'Healthy', type: 'Database', memory: '256 MB', health: 99 },
];

export const AgentList = () => {
  return (
    <div className="glass-panel p-6 flex-1">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Autonomous Agents</h3>
        <button className="text-primary text-xs font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
          View All <ExternalLink size={14} />
        </button>
      </div>
      
      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 group hover:border-primary/20 transition-all duration-300">
            <div className={`p-3 rounded-xl ${agent.status === 'Healthy' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
              <Shield size={20} />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h4 className="font-bold group-hover:text-primary transition-colors">{agent.name}</h4>
                <span className="text-[10px] text-white/40 uppercase tracking-widest">{agent.type}</span>
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
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${agent.health > 90 ? 'bg-primary' : 'bg-yellow-400'}`} 
                  style={{ width: `${agent.health}%` }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
