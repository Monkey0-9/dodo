import { useState } from 'react';
import { Layout } from './components/portal/Layout';
import { Dashboard } from './components/portal/Dashboard';
import { AgentManagement } from './components/portal/AgentManagement';
import { MemoryExplorer } from './components/portal/MemoryExplorer';
import { RuntimeObservability } from './components/portal/RuntimeObservability';
import { WorkflowBuilder } from './components/portal/WorkflowBuilder';
import { ToolRegistry } from './components/portal/ToolRegistry';
import { LiveLogs } from './components/portal/LiveLogs';
import { Analytics } from './components/portal/Analytics';
import { Settings } from './components/portal/Settings';
import { Playground } from './components/portal/Playground';
import { Governance } from './components/portal/Governance';
import { Topology } from './components/portal/Topology';
import { Chat } from './components/Chat';
import { CreateAgentModal } from './components/CreateAgentModal';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAgentCreated = () => {
    setRefreshKey(prev => prev + 1);
    console.log('Agent created, refresh key:', refreshKey);
  };

  return (
    <Layout currentPath={currentPath} onNavigate={setCurrentPath} onCreateAgent={() => setIsModalOpen(true)}>
      {currentPath === 'dashboard' && <Dashboard onNavigate={setCurrentPath} />}
      {currentPath === 'agents' && (
        <AgentManagement onSelectAgent={setSelectedAgentId} />
      )}
      {currentPath === 'memory' && <MemoryExplorer />}
      {currentPath === 'runtime' && <RuntimeObservability />}
      {currentPath === 'workflows' && <WorkflowBuilder />}
      {currentPath === 'tools' && <ToolRegistry />}
      {currentPath === 'logs' && <LiveLogs />}
      {currentPath === 'analytics' && <Analytics />}
      {currentPath === 'settings' && <Settings />}
      {currentPath === 'playground' && <Playground />}
      {currentPath === 'governance' && <Governance />}
      {currentPath === 'topology' && <Topology />}

      {/* Chat Drawer */}
      <AnimatePresence>
        {selectedAgentId && (
          <Chat 
            agentId={selectedAgentId} 
            onClose={() => setSelectedAgentId(null)} 
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <CreateAgentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleAgentCreated}
      />
    </Layout>
  );
}

export default App;
