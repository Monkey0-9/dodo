import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export const StatsGrid = () => {
  const [agentCount, setAgentCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchAgentCount = async () => {
      try {
        const agents = await api.agents.list();
        setAgentCount(Array.isArray(agents) ? agents.length : 0);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setAgentCount(0);
      }
    };
    fetchAgentCount();
  }, []);

  const stats = [
    { 
      label: 'Active Agents', 
      value: agentCount !== null ? agentCount.toString() : '--', 
      change: 'Real-time', 
      icon: 'smart_toy', 
      color: 'text-primary',
      trend: 'neutral',
      data: [2, 3, 5, 6, 4, 7, (agentCount || 0) % 10]
    },
    { 
      label: 'Running Tasks', 
      value: '112', 
      change: 'Stable', 
      icon: 'account_tree', 
      color: 'text-secondary',
      trend: 'neutral',
      data: [4, 6, 8, 5, 7, 6, 8]
    },
    { 
      label: 'Memory Recall Hits', 
      value: '98.4%', 
      change: '+0.2%', 
      icon: 'psychology', 
      color: 'text-tertiary',
      trend: 'up',
      data: [7, 8, 7, 8, 8, 8, 8]
    },
    { 
      label: 'Avg Latency', 
      value: '142ms', 
      change: '+12ms', 
      icon: 'timer', 
      color: 'text-primary',
      trend: 'down',
      data: [3, 2, 4, 6, 8, 7, 5]
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="glass-panel p-5 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <span className="font-mono-label uppercase text-on-surface-variant text-[11px]">{stat.label}</span>
            <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
          </div>
          <div className="flex items-end gap-3">
            <span className="font-headline-lg text-2xl font-semibold">{stat.value}</span>
            <span className={`font-mono-label text-[10px] mb-1 ${stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-error' : 'text-on-surface-variant'}`}>
              {stat.change}
            </span>
          </div>
          <div className="mt-4 h-8 flex items-end gap-0.5">
            {stat.data.map((h, i) => (
              <div 
                key={i} 
                className={`w-full rounded-t-sm ${i === stat.data.length - 1 ? (stat.label === 'Avg Latency' ? 'bg-error' : 'bg-primary') : (stat.color.replace('text-', 'bg-') + '/20')}`}
                style={{ height: `${(h / 8) * 100}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
