import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import type { AgentState, Message as APIMessage } from '../../api/types';

export const Playground = () => {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [messages, setMessages] = useState<APIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const agentsData = await api.agents.list();
        setAgents(agentsData);
        if (agentsData.length > 0) {
          setSelectedAgentId(agentsData[0].id);
        }
      } catch (err) {
        console.error("Failed to load agents", err);
      } finally {
        setInitLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      api.agents.listMessages(selectedAgentId).then(data => {
        setMessages(data || []);
      }).catch(err => {
        console.error("Failed to load messages", err);
        setMessages([]);
      });
    } else {
      setMessages([]);
    }
  }, [selectedAgentId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgentId || loading) return;
    
    const text = input;
    setInput('');
    setLoading(true);
    
    // Optimistic user message
    const tempUserMsg: APIMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, tempUserMsg]);
    
    try {
      await api.agents.sendMessage(selectedAgentId, text);
      const updatedMessages = await api.agents.listMessages(selectedAgentId);
      setMessages(updatedMessages || []);
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="flex h-full overflow-hidden -m-8">
      {/* Left Column: Configuration (20%) */}
      <section className="w-1/5 border-r border-outline-variant bg-surface-container-lowest p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
        <div className="space-y-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Configuration</h3>
          
          {initLoading ? (
            <div className="text-on-surface-variant text-sm font-mono animate-pulse">Loading Agents...</div>
          ) : (
            <div className="space-y-2">
              <label className="block text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">Agent Profile</label>
              <select 
                title="Agent Profile" 
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-2.5 text-sm focus:border-primary outline-none text-on-surface"
              >
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {selectedAgent && (
            <>
              <div className="space-y-2">
                <label className="block text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">Inference Model</label>
                <div className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface">
                  {selectedAgent.model || 'Default Model'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] text-on-surface-variant font-mono uppercase tracking-widest font-bold">Agent Type</label>
                <div className="w-full bg-surface-container-high border border-outline-variant rounded-lg p-2.5 text-sm text-on-surface">
                  {selectedAgent.agent_type}
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-outline-variant space-y-4">
            <Toggle label="Persistent Memory" active />
            <Toggle label="Tool Access" active={selectedAgent?.tools && selectedAgent.tools.length > 0} />
            <Toggle label="Strict Schema" />
          </div>
        </div>
      </section>

      {/* Middle Column: Chat Interface (50%) */}
      <section className="flex-1 flex flex-col bg-surface-container-low relative min-w-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
          {/* Agent Greeting */}
          <Message 
            sender={selectedAgent?.name || "System"} 
            role="SYSTEM" 
            content={`System initialized. I am ready to process your commands. Select an agent to begin interaction.`} 
            icon="smart_toy"
          />

          {messages.map((msg) => (
             <Message 
               key={msg.id}
               sender={msg.role === 'user' ? 'User' : (msg.role === 'tool' ? 'Tool Return' : (selectedAgent?.name || 'Agent'))}
               content={
                 typeof msg.content === 'string' 
                   ? msg.content 
                   : (Array.isArray(msg.content) ? msg.content.map((c: any) => c.text || JSON.stringify(c)).join('\n') : JSON.stringify(msg.content))
               }
               icon={msg.role === 'user' ? 'account_circle' : (msg.role === 'tool' ? 'build' : 'smart_toy')}
               isUser={msg.role === 'user'}
               role={msg.role.toUpperCase()}
               badges={msg.tool_calls ? msg.tool_calls.map((tc: any) => ({
                 label: tc.function?.name || tc.name || 'Tool Call',
                 icon: 'terminal',
                 color: 'text-tertiary bg-tertiary/10 border-tertiary/20'
               })) : []}
             />
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline-variant">
                <span className="material-symbols-outlined text-primary text-lg">smart_toy</span>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-surface-container-high/30 rounded-full border border-outline-variant">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-delay:200ms]"></div>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-delay:400ms]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-surface-container-low via-surface-container-low to-transparent">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="bg-surface-container-high/80 backdrop-blur-xl border border-outline-variant rounded-xl p-2 flex items-end gap-2 shadow-2xl">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">attachment</span>
              </button>
              <textarea 
                title="Command Agent"
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none outline-none text-on-surface" 
                placeholder={selectedAgentId ? "Message Agent..." : "Select an agent first..."}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!selectedAgentId || loading}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || !selectedAgentId || loading}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-[11px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:active:scale-100"
              >
                Run <span className="material-symbols-outlined text-sm">play_arrow</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Right Column: Execution Trace (30%) */}
      <section className="w-[30%] border-l border-outline-variant bg-surface-container-low p-6 overflow-y-auto shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant pb-4">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Execution Trace</h3>
            <span className="text-[9px] bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded font-mono font-bold tracking-widest">{loading ? 'LIVE' : 'IDLE'}</span>
          </div>

          <div className="relative pl-6 space-y-8 border-l border-outline-variant ml-2">
             {loading && <TraceStep title="Awaiting Agent Response..." subtitle="Processing inference" active animate color="bg-primary" />}
             {!loading && messages.length > 0 && <TraceStep title="Finalizing State" subtitle="Sync Complete" />}
             {!loading && messages.length === 0 && <TraceStep title="Idle" pending />}
          </div>
        </div>
      </section>
    </div>
  );
};

const Toggle = ({ label, active }: { label: string, active?: boolean }) => (
  <div className="flex items-center justify-between opacity-70">
    <span className="text-sm text-on-surface">{label}</span>
    <div className={`w-10 h-5 rounded-full relative flex items-center px-0.5 transition-colors border ${active ? 'bg-primary border-primary' : 'bg-surface-container-highest border-outline-variant'}`}>
      <div className={`w-4 h-4 bg-on-surface rounded-full transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  </div>
);

const Message = ({ sender, role, content, icon, isUser, badges }: { sender?: string, role?: string, content: React.ReactNode, icon: React.ReactNode, isUser?: boolean, badges?: {text?: string, color?: string, label?: string, icon?: React.ReactNode}[] }) => (
  <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} group`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isUser ? 'bg-primary-container border-primary/20' : 'bg-surface-container-high border-outline-variant'}`}>
      <span className={`material-symbols-outlined text-lg ${isUser ? 'text-on-primary-container' : 'text-primary'}`}>{icon}</span>
    </div>
    <div className={`space-y-2 flex-1 ${isUser ? 'items-end flex flex-col' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm text-on-surface">{sender}</span>
        {role && <span className="text-[10px] text-on-surface-variant font-mono bg-surface-container-highest px-1.5 py-0.5 rounded font-bold uppercase">{role}</span>}
        {badges?.map((badge: {text?: string, color?: string, label?: string, icon?: React.ReactNode}, i: number) => (
          <span key={i} className={`text-[9px] font-mono border px-1.5 py-0.5 rounded flex items-center gap-1 font-bold uppercase tracking-wider ${badge.color}`}>
            <span className="material-symbols-outlined text-[10px]">{badge.icon}</span> {badge.label}
          </span>
        ))}
      </div>
      <div className={`p-4 rounded-xl border text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'bg-secondary-container/10 border-secondary/20 text-right max-w-lg' : 'bg-surface-container-high/50 border-outline-variant text-on-surface'}`}>
        {content}
      </div>
    </div>
  </div>
);

const TraceStep = ({ time, title, subtitle, active, animate, pending, color = "bg-outline-variant" }: { time?: string, title: string, subtitle?: string, active?: boolean, animate?: boolean, pending?: boolean, color?: string }) => (
  <div className={`relative ${pending ? 'opacity-30' : ''}`}>
    <div className={`absolute left-[-29px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-low ${color} ${animate ? 'animate-ping' : ''}`}></div>
    {animate && <div className={`absolute left-[-29px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-low ${color}`}></div>}
    <div className="space-y-1">
      {time && <p className="text-[10px] text-on-surface-variant font-mono">{time}</p>}
      <p className={`text-xs font-bold ${active ? 'text-primary' : 'text-on-surface'}`}>{title}</p>
      {subtitle && <p className="text-[11px] text-on-surface-variant">{subtitle}</p>}
    </div>
  </div>
);
