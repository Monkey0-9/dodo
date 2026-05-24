import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { AnalyticsStats } from '../../api/types';

export const StatsGrid = () => {
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agents, analyticsData] = await Promise.all([
          api.agents.list(),
          api.analytics.getStats()
        ]);
        setAgentCount(Array.isArray(agents) ? agents.length : 0);
        setStats(analyticsData);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setAgentCount(0);
      }
    };
    fetchData();
  }, []);

  const statsItems = [
    { 
      label: 'Active Agents', 
      value: agentCount !== null ? agentCount.toString() : '--', 
      change: 'Real-time', 
      icon: 'smart_toy', 
      color: 'text-primary',
      trend: 'neutral',
      data: [2, 3, 5, 6, 4, 7, agentCount || 0]
    },
    { 
      label: 'Active Threads', 
      value: stats ? stats.active_threads : '--', 
      change: stats ? stats.changes.active_threads : '--', 
      icon: 'account_tree', 
      color: 'text-secondary',
      trend: stats ? stats.trends.active_threads : 'neutral',
      data: [4, 6, 8, 5, 7, 6, stats ? parseInt(stats.active_threads) % 10 : 8]
    },
    { 
      label: 'Neural Entropy', 
      value: stats ? stats.neural_entropy : '--', 
      change: stats ? stats.changes.neural_entropy : '--', 
      icon: 'psychology', 
      color: 'text-tertiary',
      trend: stats ? stats.trends.neural_entropy : 'neutral',
      data: [7, 8, 7, 8, 8, 8, stats ? Math.round(parseFloat(stats.neural_entropy) * 100) % 10 : 8]
    },
    { 
      label: 'Avg Latency', 
      value: stats ? `${stats.global_latency}ms` : '--', 
      change: stats ? stats.changes.global_latency : '--', 
      icon: 'timer', 
      color: 'text-primary',
      trend: stats ? stats.trends.global_latency : 'neutral',
      data: [3, 2, 4, 6, 8, 7, stats ? parseInt(stats.global_latency) % 10 : 5]
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {statsItems.map((stat) => (
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
                style={{ height: `${Math.max(1, Math.min(8, h)) / 8 * 100}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

