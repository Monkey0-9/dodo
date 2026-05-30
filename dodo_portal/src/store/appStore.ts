import { create } from 'zustand';
import type { AgentState, Tool } from '../api/types';

// ─── Notification types ────────────────────────────────────────────────────

export type NotificationLevel = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  level: NotificationLevel;
  title: string;
  message?: string;
  ts: number;
}

// ─── Agent execution tracking ─────────────────────────────────────────────

export type AgentRunStatus = 'idle' | 'running' | 'success' | 'error';

export interface AgentRun {
  agentId: string;
  status: AgentRunStatus;
  startedAt?: number;
  finishedAt?: number;
  lastMessage?: string;
  errorMessage?: string;
}

// ─── Tool execution tracking ──────────────────────────────────────────────

export interface ToolExecResult {
  toolId: string;
  status: 'pending' | 'success' | 'error';
  result?: unknown;
  error?: string;
  ts: number;
}

// ─── Root store ───────────────────────────────────────────────────────────

interface AppStore {
  // --- Navigation ---
  currentPath: string;
  setCurrentPath: (path: string) => void;

  // --- Agents cache ---
  agents: AgentState[];
  setAgents: (agents: AgentState[]) => void;
  upsertAgent: (agent: AgentState) => void;

  // --- Selected agent ---
  selectedAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;

  // --- Tools cache ---
  tools: Tool[];
  setTools: (tools: Tool[]) => void;

  // --- Agent run statuses ---
  agentRuns: Record<string, AgentRun>;
  setAgentRun: (agentId: string, run: Partial<AgentRun>) => void;
  clearAgentRun: (agentId: string) => void;

  // --- Tool execution results ---
  toolResults: ToolExecResult[];
  addToolResult: (result: ToolExecResult) => void;
  clearToolResults: () => void;

  // --- Notifications ---
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'ts'>) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;

  // --- Global loading ---
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // --- Refresh signals ---
  agentListRefreshKey: number;
  triggerAgentListRefresh: () => void;
}

let notifCounter = 0;

export const useAppStore = create<AppStore>((set) => ({
  // --- Navigation ---
  currentPath: 'dashboard',
  setCurrentPath: (path) => set({ currentPath: path }),

  // --- Agents cache ---
  agents: [],
  setAgents: (agents) => set({ agents }),
  upsertAgent: (agent) =>
    set((state) => {
      const idx = state.agents.findIndex((a) => a.id === agent.id);
      if (idx === -1) return { agents: [...state.agents, agent] };
      const next = [...state.agents];
      next[idx] = agent;
      return { agents: next };
    }),

  // --- Selected agent ---
  selectedAgentId: null,
  setSelectedAgentId: (id) => set({ selectedAgentId: id }),

  // --- Tools cache ---
  tools: [],
  setTools: (tools) => set({ tools }),

  // --- Agent run statuses ---
  agentRuns: {},
  setAgentRun: (agentId, run) =>
    set((state) => ({
      agentRuns: {
        ...state.agentRuns,
        [agentId]: { ...state.agentRuns[agentId], agentId, ...run },
      },
    })),
  clearAgentRun: (agentId) =>
    set((state) => {
      const next = { ...state.agentRuns };
      delete next[agentId];
      return { agentRuns: next };
    }),

  // --- Tool execution results ---
  toolResults: [],
  addToolResult: (result) =>
    set((state) => ({
      toolResults: [...state.toolResults.slice(-49), result],
    })),
  clearToolResults: () => set({ toolResults: [] }),

  // --- Notifications ---
  notifications: [],
  addNotification: (n) =>
    set((state) => ({
      notifications: [
        ...state.notifications.slice(-9),
        { ...n, id: `notif-${++notifCounter}`, ts: Date.now() },
      ],
    })),
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),

  // --- Global loading ---
  globalLoading: false,
  setGlobalLoading: (globalLoading) => set({ globalLoading }),

  // --- Refresh signals ---
  agentListRefreshKey: 0,
  triggerAgentListRefresh: () =>
    set((state) => ({ agentListRefreshKey: state.agentListRefreshKey + 1 })),
}));

// ─── Typed selectors (memoized via selector pattern) ─────────────────────

export const selectAgentRun = (agentId: string) => (state: AppStore) =>
  state.agentRuns[agentId] ?? { agentId, status: 'idle' as AgentRunStatus };

export const selectHasActiveRuns = (state: AppStore) =>
  Object.values(state.agentRuns).some((r) => r.status === 'running');

export const selectUnreadNotifications = (state: AppStore) =>
  state.notifications.length;
