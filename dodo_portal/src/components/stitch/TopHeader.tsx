export const TopHeader = ({ onNavigate, onCreateAgent }: { onNavigate?: (id: string) => void; onCreateAgent?: () => void }) => {
  return (
    <header className="h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center px-6 z-40 sticky top-0">
      <div className="flex items-center gap-6">
        <div className="relative w-64 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input 
            title="Global Search"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded py-1.5 pl-10 pr-4 text-xs focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all outline-none text-on-surface" 
            placeholder="Search resources..." 
            type="text"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onCreateAgent}
          className="px-4 py-1.5 bg-primary/10 border border-primary/30 text-primary rounded text-sm hover:bg-primary/20 transition-all scale-100 active:scale-95 duration-100"
        >
          Create Agent
        </button>
        
        <div className="flex items-center gap-1">
          <button className="p-2 text-on-surface-variant hover:bg-surface-bright/50 rounded transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button 
            onClick={() => onNavigate?.('settings')}
            className="p-2 text-on-surface-variant hover:bg-surface-bright/50 rounded transition-all"
          >
            <span className="material-symbols-outlined">settings_suggest</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-bright/50 rounded transition-all">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </div>
    </header>
  );
};
