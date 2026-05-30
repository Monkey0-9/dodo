import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { NewKnowledgeBlockModal } from '../NewKnowledgeBlockModal';

export const MemoryExplorer = () => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchBlocks = async () => {
    try {
      const blocksList = await api.blocks.list();
      setBlocks(Array.isArray(blocksList) ? blocksList : []);
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-mono-label text-xs uppercase tracking-widest text-on-surface-variant">Accessing memory blocks...</p>
        </div>
      </div>
    );
  }

  const getCoordinates = (index: number, total: number) => {
    if (total === 0) return { x: 50, y: 50 };
    const angle = (index / total) * 2 * Math.PI;
    const x = 50 + Math.cos(angle) * 35; // percentage coordinates
    const y = 50 + Math.sin(angle) * 30;
    return { x, y };
  };

  return (
    <div className="space-y-6">
      {/* Feature Header & Controls */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container border border-outline-variant p-6 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-primary">Memory Intelligence</h2>
          <p className="font-mono text-xs text-on-surface-variant mt-1">
            {blocks.length} active memory blocks indexed across LLM contexts. Live synchronization active.
          </p>
        </div>
        <div className="flex gap-2 relative z-10">
          <button className="flex items-center gap-2 bg-surface-container-high border border-outline-variant px-3 py-2 rounded-lg text-xs hover:border-primary transition-colors text-on-surface">
            <span className="material-symbols-outlined text-[18px]">smart_toy</span>
            Filter by agent
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary px-3 py-2 rounded-lg text-xs hover:bg-primary/20 transition-all active:scale-95 duration-100 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Knowledge Block
          </button>
        </div>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-linear-to-l from-primary/5 to-transparent pointer-events-none"></div>
      </section>

      {/* Main Content Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-[calc(100vh-320px)] min-h-[500px]">
        {/* Memory Graph (60%) */}
        <section className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Memory Graph Visualization
            </span>
            <div className="flex gap-2 text-on-surface-variant">
              <button className="p-1 hover:bg-surface-bright rounded"><span className="material-symbols-outlined text-[20px]">zoom_in</span></button>
              <button className="p-1 hover:bg-surface-bright rounded"><span className="material-symbols-outlined text-[20px]">zoom_out</span></button>
              <button className="p-1 hover:bg-surface-bright rounded"><span className="material-symbols-outlined text-[20px]">fullscreen</span></button>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden cursor-crosshair canvas-grid">
            <svg className="absolute inset-0 w-full h-full opacity-40">
              {blocks.map((block, i) => {
                const { x, y } = getCoordinates(i, blocks.length);
                return (
                  <line 
                    key={block.id}
                    stroke={i % 2 === 0 ? "#4cd7f6" : "#d0bcff"} 
                    strokeWidth="1" 
                    x1="50%" 
                    y1="50%" 
                    x2={`${x}%`} 
                    y2={`${y}%`}
                  />
                );
              })}
            </svg>
            {/* Center Node */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group">
              <div className="w-6 h-6 rounded-full bg-primary-container shadow-[0_0_20px_rgba(76,215,246,0.6)] z-20 cursor-pointer"></div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest border border-primary px-3 py-1 rounded text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-on-surface">
                Dodo OS Core
              </div>
            </div>
            {/* Surrounding Nodes */}
            {blocks.map((block, i) => {
              const { x, y } = getCoordinates(i, blocks.length);
              return (
                <div 
                  key={block.id}
                  className="absolute group hover:scale-125 transition-transform"
                  style={{ top: `${y}%`, left: `${x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className={`w-4 h-4 rounded-full ${i % 2 === 0 ? 'bg-tertiary shadow-[0_0_15px_rgba(208,188,255,0.4)]' : 'bg-primary shadow-[0_0_10px_rgba(76,215,246,0.3)]'} cursor-pointer`}></div>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface-container-highest border border-primary px-3 py-1 rounded text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-on-surface z-30 shadow-lg">
                    {block.label?.toUpperCase() || 'BLOCK'}: {block.id.slice(0, 8)}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Memories (40%) */}
        <section className="lg:col-span-4 flex flex-col bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low">
            <h3 className="text-lg font-medium text-on-surface">Recent Memories</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {blocks.length > 0 ? (
              blocks.map((block, i) => (
                <MemoryCard 
                  key={block.id}
                  id={block.id}
                  label={block.label || 'context'}
                  importance={0.8 - (i * 0.05) > 0.3 ? parseFloat((0.8 - (i * 0.05)).toFixed(2)) : 0.3} 
                  content={block.value || 'Empty context block value'} 
                  icons={block.label === 'persona' ? ['smart_toy'] : block.label === 'human' ? ['face'] : ['auto_stories']}
                  onDelete={async () => {
                    if (confirm('Are you sure you want to delete this memory block?')) {
                      try {
                        await api.blocks.delete(block.id);
                        setBlocks(prev => prev.filter(b => b.id !== block.id));
                      } catch (err: any) {
                        alert(`Failed to delete block: ${err.message}`);
                      }
                    }
                  }}
                />
              ))
            ) : (
              <div className="text-center text-on-surface-variant font-mono text-xs py-8">
                No memory blocks found.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Retrieval History Heatmap */}
      <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-on-surface">Retrieval History</h3>
          <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant">
            <span>Low Usage</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-surface-container-highest"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
              <div className="w-3 h-3 rounded-sm bg-primary"></div>
            </div>
            <span>Peak Intensity</span>
          </div>
        </div>
        <div className="grid grid-cols-24 gap-1.5 h-20">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="grid grid-rows-7 gap-1.5 h-full">
              {Array.from({ length: 7 }).map((_, j) => (
                <div 
                  key={j} 
                  className={`w-full rounded-sm ${((i * 7 + j) % 5) === 0 ? 'bg-primary' : ((i * 7 + j) % 3) === 0 ? 'bg-primary/40' : 'bg-surface-container-highest'}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
          <span>Mon 12:00 AM</span>
          <span>Tue 12:00 AM</span>
        </div>
      </section>

      <NewKnowledgeBlockModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchBlocks}
      />
    </div>
  );
};

const MemoryCard = ({ id, label, importance, content, icons, onDelete }: { id: string, label: string, importance: number, content: string, icons: string[], onDelete: () => void }) => (
  <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant hover:border-primary/50 transition-all group">
    <div className="flex justify-between items-start mb-3">
      <span className="font-mono text-xs text-primary">
        {label.toUpperCase()} <span className="text-on-surface-variant text-[9px] font-normal opacity-60">({id.slice(0, 8)})</span>
      </span>
      <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider">
        Importance: {importance}
      </div>
    </div>
    <p className="text-sm leading-relaxed mb-4 text-on-surface font-mono overflow-hidden text-ellipsis break-all max-h-24">
      {content}
    </p>
    <div className="flex justify-between items-center">
      <div className="flex -space-x-2">
        {icons.map((icon, i) => (
          <div key={i} className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-[14px] text-on-surface">{icon}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onDelete}
          className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-error hover:underline transition-colors"
        >
          Delete <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>
    </div>
  </div>
);
