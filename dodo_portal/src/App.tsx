import { useEffect, useState } from 'react';
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
import { NotificationToast } from './components/NotificationToast';
import { useAppStore } from './store/appStore';
import { AnimatePresence } from 'framer-motion';

function App() {
  const currentPath = useAppStore((s) => s.currentPath);
  const setCurrentPath = useAppStore((s) => s.setCurrentPath);
  const selectedAgentId = useAppStore((s) => s.selectedAgentId);
  const setSelectedAgentId = useAppStore((s) => s.setSelectedAgentId);
  const triggerAgentListRefresh = useAppStore((s) => s.triggerAgentListRefresh);
  const addNotification = useAppStore((s) => s.addNotification);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Announce demo mode on load
  useEffect(() => {
    if (import.meta.env.VITE_DEMO_MODE === 'true') {
      addNotification({
        level: 'info',
        title: 'Demo Mode Active',
        message: 'Set VITE_DEMO_MODE=false for live backend.',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAgentCreated = () => {
    triggerAgentListRefresh();
    setIsModalOpen(false);
    addNotification({ level: 'success', title: 'Agent Created', message: 'New agent is ready to use.' });
  };

  return (
    <>
      <Layout currentPath={currentPath} onNavigate={setCurrentPath} onCreateAgent={() => setIsModalOpen(true)}>
        {currentPath === 'dashboard' && (
          <ErrorBoundary label="Dashboard">
            <Dashboard onNavigate={setCurrentPath} />
          </ErrorBoundary>
        )}
        {currentPath === 'agents' && (
          <ErrorBoundary label="Agent Management">
            <AgentManagement onSelectAgent={setSelectedAgentId} />
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

        {/* Create Agent Modal */}
        <CreateAgentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAgentCreated}
        />
      </Layout>

      {/* Global notification toast shelf (outside Layout so it stacks above all panels) */}
      <NotificationToast />
    </>
  );
}

export default App;
