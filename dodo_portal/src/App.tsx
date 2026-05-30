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
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAgentCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout currentPath={currentPath} onNavigate={setCurrentPath} onCreateAgent={() => setIsModalOpen(true)}>
      {currentPath === 'dashboard' && (
        <ErrorBoundary label="Dashboard">
          <Dashboard onNavigate={setCurrentPath} />
        </ErrorBoundary>
      )}
      {currentPath === 'agents' && (
        <ErrorBoundary label="Agent Management">
          <AgentManagement key={refreshKey} onSelectAgent={setSelectedAgentId} />
        </ErrorBoundary>
      )}
      {currentPath === 'memory' && (
        <ErrorBoundary label="Memory Explorer">
          <MemoryExplorer />
        </ErrorBoundary>
      )}
      {currentPath === 'runtime' && (
        <ErrorBoundary label="Runtime Observability">
          <RuntimeObservability />
        </ErrorBoundary>
      )}
      {currentPath === 'workflows' && (
        <ErrorBoundary label="Workflow Builder">
          <WorkflowBuilder />
        </ErrorBoundary>
      )}
      {currentPath === 'tools' && (
        <ErrorBoundary label="Tool Registry">
          <ToolRegistry />
        </ErrorBoundary>
      )}
      {currentPath === 'logs' && (
        <ErrorBoundary label="Live Logs">
          <LiveLogs />
        </ErrorBoundary>
      )}
      {currentPath === 'analytics' && (
        <ErrorBoundary label="Analytics">
          <Analytics />
        </ErrorBoundary>
      )}
      {currentPath === 'settings' && (
        <ErrorBoundary label="Settings">
          <Settings />
        </ErrorBoundary>
      )}
      {currentPath === 'playground' && (
        <ErrorBoundary label="Playground">
          <Playground />
        </ErrorBoundary>
      )}
      {currentPath === 'governance' && (
        <ErrorBoundary label="Governance">
          <Governance />
        </ErrorBoundary>
      )}
      {currentPath === 'topology' && (
        <ErrorBoundary label="Topology Canvas">
          <Topology />
        </ErrorBoundary>
      )}

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
