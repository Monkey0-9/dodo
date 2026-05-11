import { useState } from 'react';
import { Layout } from './components/stitch/Layout';
import { Dashboard } from './components/stitch/Dashboard';
import { AgentManagement } from './components/stitch/AgentManagement';
import { MemoryExplorer } from './components/stitch/MemoryExplorer';
import { RuntimeObservability } from './components/stitch/RuntimeObservability';
import { WorkflowBuilder } from './components/stitch/WorkflowBuilder';
import { ToolRegistry } from './components/stitch/ToolRegistry';
import { LiveLogs } from './components/stitch/LiveLogs';
import { Analytics } from './components/stitch/Analytics';
import { Settings } from './components/stitch/Settings';
import { Playground } from './components/stitch/Playground';
import { Governance } from './components/stitch/Governance';
import { Topology } from './components/stitch/Topology';
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
