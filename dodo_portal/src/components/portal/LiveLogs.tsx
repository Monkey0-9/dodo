import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../../api/client';

interface LogMessage {
  time: string;
  source: string;
  level: string;
  message: string;
}

export const LiveLogs = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const connect = useCallback(() => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      const interval = setInterval(() => {
        if (isPaused) return;
        const log = {
          time: new Date().toLocaleTimeString(),
          source: ['AGENT_CORE', 'MEM_CLUSTER', 'ROUTER', 'AUTH'][Math.floor(Math.random() * 4)],
          level: ['INFO', 'DEBUG', 'WARN', 'ERROR'][Math.floor(Math.random() * 4)],
          message: 'Simulated log message from demo mock engine.',
        };
        setLogs(prev => [...prev.slice(-199), log]);
      }, 2000);
      return () => clearInterval(interval);
    }

    const url = api.logs.getStreamUrl();
    const ws = new WebSocket(url);

    ws.onmessage = (event) => {
      if (isPaused) return;
      const log = JSON.parse(event.data);
      setLogs(prev => [...prev.slice(-199), log]); // Keep last 200 logs
    };

    ws.onclose = () => {
      console.log('Logs WebSocket closed. Reconnecting...');
      setTimeout(connect, 3000);
    };

    wsRef.current = ws;
  }, [isPaused]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      if (typeof cleanup === 'function') cleanup();
      wsRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    if (!isPaused) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  const filteredLogs = severityFilter 
    ? logs.filter(l => l.level.includes(severityFilter))
    : logs;

  const getLevelColor = (level: string) => {
    if (level.includes('ERROR')) return 'text-error';
    if (level.includes('WARN')) return 'text-tertiary';
    if (level.includes('DEBUG')) return 'text-primary-fixed-dim';
    return 'text-primary';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 -m-6 h-[calc(100vh-64px)] overflow-hidden">
      {/* Controls Bar */}
      <div className="h-14 flex items-center justify-between px-6 bg-surface-container border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex bg-surface-container-lowest border border-outline-variant rounded p-0.5">
            <button 
              onClick={() => setIsPaused(true)}
              className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 ${isPaused ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[18px]">pause</span> PAUSE
            </button>
            <button 
              onClick={() => setIsPaused(false)}
              className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 ${!isPaused ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span> RESUME
            </button>
          </div>
          <button 
            onClick={() => setLogs([])}
            className="px-3 py-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 border border-outline-variant rounded text-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span> CLEAR LOGS
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant mr-1">Severity:</span>
          <div className="flex gap-1">
            {['ERROR', 'WARN', 'INFO', 'DEBUG'].map(level => (
              <button
                key={level}
                onClick={() => setSeverityFilter(severityFilter === level ? null : level)}
                className={`px-2 py-0.5 border text-[9px] font-mono rounded-sm uppercase tracking-widest transition-all ${
                  severityFilter === level 
                    ? 'bg-primary text-on-primary border-primary' 
                    : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Terminal View */}
        <section className="flex-1 bg-surface-container-lowest overflow-y-auto p-4 font-mono text-sm border-r border-outline-variant">
          <div className="space-y-1">
            {filteredLogs.map((log, i) => (
              <LogEntry 
                key={i}
                time={log.time} 
                source={log.source} 
                level={log.level} 
                levelColor={getLevelColor(log.level)} 
                content={log.message} 
              />
            ))}
            <div ref={logsEndRef} />
            {!isPaused && (
              <div className="animate-pulse flex items-center gap-4 p-2 text-on-surface-variant/30">
                <span className="material-symbols-outlined text-sm">more_horiz</span>
                <span className="text-[10px] font-mono uppercase tracking-widest">Listening for new logs...</span>
              </div>
            )}
          </div>
        </section>

        {/* Log Details Side Panel (Simplified for now) */}
        <aside className="hidden xl:flex w-96 bg-surface-container flex-col shrink-0">
          <div className="h-14 flex items-center justify-between px-6 border-b border-outline-variant bg-surface-container-high shrink-0">
            <span className="text-sm font-bold text-on-surface uppercase tracking-wider">Session Info</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="bg-primary/5 p-4 rounded border border-primary/20">
              <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">Streaming Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-warning' : 'bg-success animate-pulse'}`} />
                <span className="text-sm text-on-surface">{isPaused ? 'Paused' : 'Active Connection'}</span>
              </div>
            </div>
            <div className="text-xs text-on-surface-variant leading-relaxed">
              Logs are streamed in real-time from the Dodo kernel. Severity filtering is applied locally. The buffer is limited to the last 200 events to ensure frontend performance.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const LogEntry = ({ time, source, level, levelColor, content, active = false }: { time: string, source: string, level: string, levelColor: string, content: React.ReactNode, active?: boolean }) => (
  <div className={`group flex items-start gap-4 p-2 rounded-sm cursor-pointer border-l-2 transition-all
    ${active ? 'bg-surface-container border-primary' : 'hover:bg-surface-container/50 border-transparent hover:border-primary'}`}>
    <span className="text-on-surface-variant opacity-40 select-none whitespace-nowrap text-xs">{time}</span>
    <span className="bg-primary/10 text-primary px-1.5 rounded-sm text-[10px] uppercase font-bold tracking-tight">{source}</span>
    <span className={`font-bold text-xs ${levelColor}`}>{level}</span>
    <span className="text-on-surface text-sm flex-1">{content}</span>
  </div>
);

