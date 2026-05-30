import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../../api/client';
import { useAppStore } from '../../store/appStore';

interface LogMessage {
  time: string;
  source: string;
  level: string;
  message: string;
}

type WsStatus = 'connecting' | 'connected' | 'paused' | 'disconnected' | 'demo';

export const LiveLogs = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<WsStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(isPaused);
  const addNotification = useAppStore((s) => s.addNotification);

  // Keep isPausedRef in sync without triggering reconnect
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);

  const connect = useCallback(() => {
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);

    // ─── Demo mode ───────────────────────────────────────────────────────────
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      setWsStatus('demo');
      const sources = ['AGENT_CORE', 'MEM_CLUSTER', 'ROUTER', 'AUTH_SVC', 'TOOL_EXEC'];
      const messages = [
        'Heartbeat acknowledged. Cluster health nominal.',
        'Memory checkpoint written to persistent store.',
        'Token budget check: 82% capacity remaining.',
        'Routing request to gpt-4o via OpenRouter proxy.',
        'Tool execution sandbox initialized.',
        'Embedding cache hit (cosine sim: 0.94).',
        'Agent context window compacted by 31%.',
      ];
      const interval = setInterval(() => {
        if (isPausedRef.current) return;
        const log: LogMessage = {
          time: new Date().toLocaleTimeString(),
          source: sources[Math.floor(Math.random() * sources.length)],
          level: ['INFO', 'INFO', 'INFO', 'DEBUG', 'WARN', 'ERROR'][Math.floor(Math.random() * 6)],
          message: messages[Math.floor(Math.random() * messages.length)],
        };
        setLogs(prev => [...prev.slice(-199), log]);
      }, 1800);
      return () => clearInterval(interval);
    }

    // ─── Live WebSocket ───────────────────────────────────────────────────────
    setWsStatus('connecting');
    const url = api.logs.getStreamUrl();
    let ws: WebSocket;

    try {
      ws = new WebSocket(url);
    } catch (e) {
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      setWsStatus('connected');
      retryCountRef.current = 0;
    };

    ws.onmessage = (event) => {
      if (isPausedRef.current) return;
      try {
        const log: LogMessage = JSON.parse(event.data);
        setLogs(prev => [...prev.slice(-199), log]);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onerror = () => {
      setWsStatus('disconnected');
    };

    ws.onclose = (e) => {
      setWsStatus('disconnected');
      if (!e.wasClean) {
        scheduleReconnect();
      }
    };

    wsRef.current = ws;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scheduleReconnect = useCallback(() => {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
    const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
    retryCountRef.current += 1;
    retryTimerRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    const cleanup = connect();
    return () => {
      if (typeof cleanup === 'function') cleanup();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close(1000, 'Component unmounted');
    };
  }, [connect]);

  useEffect(() => {
    if (!isPaused) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  const handleClear = () => {
    setLogs([]);
    addNotification({ level: 'info', title: 'Logs Cleared', message: 'Log buffer flushed.' });
  };

  const filteredLogs = severityFilter
    ? logs.filter(l => l.level.includes(severityFilter))
    : logs;

  const getLevelColor = (level: string) => {
    if (level.includes('ERROR')) return 'text-error';
    if (level.includes('WARN')) return 'text-yellow-400';
    if (level.includes('DEBUG')) return 'text-primary-fixed-dim';
    return 'text-emerald-400';
  };

  const statusLabel: Record<WsStatus, { label: string; dot: string }> = {
    connecting:   { label: 'Connecting...', dot: 'bg-yellow-400 animate-pulse' },
    connected:    { label: 'Live',          dot: 'bg-emerald-500 animate-pulse' },
    paused:       { label: 'Paused',        dot: 'bg-yellow-500' },
    disconnected: { label: 'Disconnected',  dot: 'bg-error' },
    demo:         { label: 'Demo Mode',     dot: 'bg-primary animate-pulse' },
  };

  const currentStatus = isPaused ? 'paused' : wsStatus;

  return (
    <div className="flex-1 flex flex-col min-h-0 -m-6 h-[calc(100vh-64px)] overflow-hidden">
      {/* Controls Bar */}
      <div className="h-14 flex items-center justify-between px-6 bg-surface-container border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-4">
          {/* WS status pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-outline-variant bg-surface-container-low text-xs font-mono">
            <div className={`w-2 h-2 rounded-full ${statusLabel[currentStatus].dot}`} />
            <span className="text-on-surface-variant uppercase tracking-widest text-[10px] font-bold">
              {statusLabel[currentStatus].label}
            </span>
          </div>

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
            onClick={handleClear}
            className="px-3 py-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 border border-outline-variant rounded text-xs transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span> CLEAR
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
          <span className="text-[10px] font-mono text-on-surface-variant ml-2">
            {filteredLogs.length} entries
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Terminal View */}
        <section className="flex-1 bg-surface-container-lowest overflow-y-auto p-4 font-mono text-sm border-r border-outline-variant">
          <div className="space-y-0.5">
            {filteredLogs.length === 0 && (
              <div className="text-center text-on-surface-variant/30 text-xs font-mono pt-16 uppercase tracking-widest">
                {severityFilter ? `No ${severityFilter} entries` : 'Waiting for log stream...'}
              </div>
            )}
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
            {!isPaused && wsStatus !== 'disconnected' && (
              <div className="animate-pulse flex items-center gap-4 p-2 text-on-surface-variant/20">
                <span className="material-symbols-outlined text-sm">more_horiz</span>
                <span className="text-[10px] font-mono uppercase tracking-widest">Listening...</span>
              </div>
            )}
            {wsStatus === 'disconnected' && !isPaused && (
              <div className="flex items-center gap-4 p-2 text-error/60">
                <span className="material-symbols-outlined text-sm">wifi_off</span>
                <span className="text-[10px] font-mono uppercase tracking-widest">Reconnecting with backoff...</span>
              </div>
            )}
          </div>
        </section>

        {/* Session Info Panel */}
        <aside className="hidden xl:flex w-80 bg-surface-container flex-col shrink-0">
          <div className="h-14 flex items-center px-6 border-b border-outline-variant bg-surface-container-high shrink-0">
            <span className="text-sm font-bold text-on-surface uppercase tracking-wider">Session Info</span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Stream Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusLabel[currentStatus].dot}`} />
                <span className="text-sm text-on-surface">{statusLabel[currentStatus].label}</span>
              </div>
              {retryCountRef.current > 0 && wsStatus === 'disconnected' && (
                <p className="text-[10px] text-on-surface-variant font-mono">
                  Retry attempt #{retryCountRef.current}
                </p>
              )}
            </div>
            <div className="space-y-2 text-[10px] font-mono text-on-surface-variant">
              <div className="flex justify-between">
                <span>Buffer size:</span>
                <span className="text-on-surface font-bold">{logs.length} / 200</span>
              </div>
              <div className="flex justify-between">
                <span>Filtered count:</span>
                <span className="text-on-surface font-bold">{filteredLogs.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active filter:</span>
                <span className="text-primary font-bold">{severityFilter || 'NONE'}</span>
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant/60 leading-relaxed">
              Logs stream from the Dodo kernel in real-time. Buffer limited to 200 entries for performance. Exponential backoff reconnects on drop.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

const LogEntry = ({ time, source, level, levelColor, content }: {
  time: string;
  source: string;
  level: string;
  levelColor: string;
  content: React.ReactNode;
}) => (
  <div className="group flex items-start gap-3 p-1.5 rounded-sm cursor-pointer border-l-2 border-transparent hover:border-primary hover:bg-surface-container/50 transition-all">
    <span className="text-on-surface-variant opacity-40 select-none whitespace-nowrap text-[10px] mt-0.5 min-w-[60px]">{time}</span>
    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm text-[9px] uppercase font-bold tracking-tight shrink-0">{source}</span>
    <span className={`font-bold text-[10px] uppercase tracking-widest shrink-0 ${levelColor}`}>{level}</span>
    <span className="text-on-surface text-xs flex-1 leading-relaxed">{content}</span>
  </div>
);
