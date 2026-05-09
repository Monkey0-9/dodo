import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Maximize2, MoreHorizontal } from 'lucide-react';

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-8 h-[450px] flex flex-col relative group"
    >
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h3 className="text-2xl font-black text-gradient tracking-tight">Neural Pulse</h3>
          </div>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Global Network Telemetry</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white/5 text-white">Live</button>
            <button className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors">History</button>
          </div>
          <button className="p-2.5 glass-panel bg-white/5 border-white/5 hover:bg-white/10 transition-colors rounded-xl text-white/40">
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#ffffff20', fontSize: 10, fontWeight: 700 }} 
              dy={10}
            />
            <YAxis 
              hide 
            />
            <Tooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-panel-heavy p-4 border-white/10 shadow-2xl">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">{payload[0].payload.time}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-xs text-white/60">Latency</span>
                          <span className="text-xs font-bold text-primary">{payload[0].value}ms</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-xs text-white/60">Load</span>
                          <span className="text-xs font-bold text-secondary">{payload[1].value} req</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="latency" 
              stroke="var(--color-primary)" 
              fillOpacity={1} 
              fill="url(#colorLatency)" 
              strokeWidth={4}
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="requests" 
              stroke="var(--color-secondary)" 
              fillOpacity={1} 
              fill="url(#colorRequests)" 
              strokeWidth={4}
              animationDuration={2500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-8">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,242,255,1)]" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Network Response</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(112,0,255,1)]" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Compute Demand</span>
        </div>
      </div>
    </motion.div>
  );
};
