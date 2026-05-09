import { useState, useEffect, useRef } from 'react';
import { X, Shield, Loader2, Database, Zap, Send, Terminal, Hash, Sparkles, Brain, History, Activity, Save, Bot, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { clsx } from 'clsx';

export const Chat = ({ agentId, onClose }: { agentId: string; onClose: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'memory' | 'logs'>('chat');
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [, setAgentData] = useState<any>(null);
  const [persona, setPersona] = useState('');
  const [human, setHuman] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [msgData, agentInfo] = await Promise.all([
          api.agents.listMessages(agentId),
          api.agents.get(agentId)
        ]);
        setMessages(msgData);
        setAgentData(agentInfo);
        setPersona(agentInfo.persona || '');
        setHuman(agentInfo.human || '');
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [agentId]);

  useEffect(() => {
    const url = api.agents.getStreamUrl(agentId);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = event.data;
      if (data.includes('[DONE]')) {
        setMessages(prev => {
          // Only add if we actually have streaming content
          if (streamingMessage) {
             return [...prev, { role: 'assistant', content: streamingMessage }];
          }
          return prev;
        });
        setStreamingMessage('');
        setSending(false);
        return;
      }

      // Handle raw SSE chunks
      if (data.startsWith('data: ')) {
        const content = data.replace('data: ', '').trim();
        try {
          // Try parsing as JSON (OpenAI format)
          const json = JSON.parse(content);
          const text = json.choices?.[0]?.delta?.content || json.content || '';
          if (text) setStreamingMessage(prev => prev + text);
        } catch (e) {
          // Raw text fallback
          if (content && !content.startsWith('{')) {
            setStreamingMessage(prev => prev + content);
          }
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket Closed');
    };

    return () => {
      ws.close();
    };
  }, [agentId, streamingMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleSend = () => {
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: input,
        actor_id: 'default_actor'
      }));
      setSending(true);
    } else {
      setSending(true);
      api.agents.sendMessage(agentId, input).then(() => {
        api.agents.listMessages(agentId).then(data => {
          setMessages(data);
          setSending(false);
        });
      });
    }
    
    setInput('');
  };

  const handleSaveMemory = async () => {
    // Implement memory update logic here
    console.log('Saving memory...', { persona, human });
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-y-0 right-0 w-[1100px] glass-panel-heavy rounded-none border-y-0 border-r-0 z-[100] flex shadow-2xl overflow-hidden"
    >
      <div className="grid-overlay absolute inset-0 opacity-5 pointer-events-none" />
      
      {/* Left Column: Chat Interface */}
      <div className="flex-1 flex flex-col border-r border-white/5 relative z-10 bg-background/50">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <Bot size={20} className="text-primary neon-glow-text" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gradient uppercase tracking-tighter">Neural Stream</h3>
              <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">Active Link</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['chat', 'memory', 'logs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Syncing Neural Cores</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx("flex gap-5", msg.role === 'user' ? 'flex-row-reverse' : '')}
                >
                  <div className={clsx(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
                    msg.role === 'user' ? 'bg-primary text-background border-primary' : 'bg-white/5 text-white/40 border-white/5'
                  )}>
                    {msg.role === 'user' ? <Hash size={16} /> : <Terminal size={16} />}
                  </div>
                  <div className={clsx(
                    "max-w-[80%] p-4 rounded-2xl text-[13px] leading-relaxed",
                    msg.role === 'user' ? 'bg-primary/5 text-white border border-primary/20' : 'bg-white/[0.02] text-white/80 border border-white/5'
                  )}>
                    <p className={msg.role === 'user' ? '' : 'font-mono'}>
                      {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                    </p>
                  </div>
                </motion.div>
              ))}
              {streamingMessage && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 text-primary border border-primary/20">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                  <div className="max-w-[80%] p-4 rounded-2xl text-[13px] leading-relaxed bg-white/[0.02] text-white/80 border border-white/5 font-mono">
                    {streamingMessage}
                    <span className="inline-block w-1.5 h-4 bg-primary ml-1 animate-pulse align-middle" />
                  </div>
                </motion.div>
              )}
              {sending && !streamingMessage && (
                <div className="flex gap-4 opacity-50">
                  <div className="w-9 h-9 rounded-lg bg-white/5 animate-pulse" />
                  <div className="h-12 w-32 bg-white/5 rounded-2xl animate-pulse" />
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-white/[0.01] border-t border-white/5">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Transmit neural command..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-xs focus:outline-none focus:border-primary/40 transition-all placeholder:text-white/10"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-background rounded-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Memory & Systems */}
      <div className="w-[400px] flex flex-col bg-white/[0.01] relative z-10">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Brain size={18} className="text-secondary" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Cognitive Core</h4>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/20">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          {/* Persona Block */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                <Shield size={12} />
                Persona Configuration
              </label>
              <button onClick={handleSaveMemory} className="p-1.5 hover:bg-white/5 rounded-md text-white/20 hover:text-primary transition-all">
                <Save size={14} />
              </button>
            </div>
            <textarea 
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full h-32 bg-white/5 border border-white/5 rounded-xl p-4 text-[11px] leading-relaxed font-mono focus:outline-none focus:border-primary/20 transition-all text-white/70"
              placeholder="Define unit persona..."
            />
          </section>

          {/* Human Profile Block */}
          <section className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-secondary/60 flex items-center gap-2">
              <User size={12} />
              Operator Profile
            </label>
            <textarea 
              value={human}
              onChange={(e) => setHuman(e.target.value)}
              className="w-full h-24 bg-white/5 border border-white/5 rounded-xl p-4 text-[11px] leading-relaxed font-mono focus:outline-none focus:border-secondary/20 transition-all text-white/70"
              placeholder="Specify operator context..."
            />
          </section>

          {/* System Telemetry */}
          <section className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 flex items-center gap-2">
              <Activity size={12} />
              Unit Telemetry
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Uptime', value: '247h 12m', icon: Zap },
                { label: 'Memory', value: '1.2GB Archival', icon: Database },
                { label: 'Latency', value: '42ms', icon: History },
                { label: 'Integrity', value: '99.9%', icon: Shield }
              ].map((stat, i) => (
                <div key={i} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <stat.icon size={10} className="text-white/20" />
                    <span className="text-[8px] font-black uppercase text-white/20 tracking-tighter">{stat.label}</span>
                  </div>
                  <p className="text-[10px] font-mono font-bold text-white/60">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Archival Search */}
          <section className="space-y-4 pt-4 border-t border-white/5">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Archival Indices</span>
                <ChevronRight size={14} className="text-white/10" />
             </div>
             <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white/[0.01] rounded-lg border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      <span className="text-[10px] font-mono text-white/40">index_node_0x{i}f</span>
                    </div>
                    <span className="text-[8px] font-bold text-white/10">SYNCED</span>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
