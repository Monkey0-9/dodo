import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', latency: 120, requests: 400 },
  { time: '04:00', latency: 150, requests: 600 },
  { time: '08:00', latency: 142, requests: 1200 },
  { time: '12:00', latency: 180, requests: 1500 },
  { time: '16:00', latency: 160, requests: 1100 },
  { time: '20:00', latency: 130, requests: 800 },
  { time: '23:59', latency: 125, requests: 500 },
];

export const MainChart = () => {
  return (
    <div className="glass-panel p-6 h-[400px]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold">Network Resilience</h3>
          <p className="text-sm text-white/40">Real-time latency vs request volume tracking</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-white/60">Latency (ms)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-xs text-white/60">Requests</span>
          </div>
        </div>
      </div>
      
      <div className="w-full h-full pb-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B026FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#B026FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#ffffff40', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              hide 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#101010', 
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '12px',
                fontSize: '12px'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke="#00F0FF" 
              fillOpacity={1} 
              fill="url(#colorLatency)" 
              strokeWidth={3}
            />
            <Area 
              type="monotone" 
              dataKey="requests" 
              stroke="#B026FF" 
              fillOpacity={1} 
              fill="url(#colorRequests)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
