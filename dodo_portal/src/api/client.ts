import axios from 'axios';
import type { AgentState, Message, Tool, AnalyticsStats, TopologyData } from './types';

// Using relative paths to leverage Vite proxy in development
// and backend serving in production
const API_BASE_URL = '/v1';
const WS_BASE_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/v1`;

export class ApiError extends Error {
  public status?: number;
  constructor(status?: number, message?: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-project': 'default',
    'Authorization': 'Bearer dodo-secret',
  },
});

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    throw new ApiError(error.response?.status, error.response?.data?.detail || error.message);
  }
  throw error;
};

export const api = {
  agents: {
    list: async (): Promise<AgentState[]> => {
      try {
        const response = await apiClient.get('/agents');
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    create: async (data: Partial<AgentState>): Promise<AgentState> => {
      try {
        const response = await apiClient.post('/agents', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    get: async (id: string): Promise<AgentState> => {
      try {
        const response = await apiClient.get(`/agents/${id}`);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    sendMessage: async (id: string, message: string): Promise<any> => {
      try {
        const response = await apiClient.post(`/agents/${id}/messages`, {
          messages: [{ role: 'user', content: message }],
          streaming: false
        });
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    listMessages: async (id: string): Promise<Message[]> => {
      try {
        const response = await apiClient.get(`/agents/${id}/messages`);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    getStreamUrl: (id: string) => {
      return `${WS_BASE_URL}/portal/stream/${id}`;
    }
  },
  tools: {
    list: async (): Promise<Tool[]> => {
      try {
        const response = await apiClient.get('/tools');
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    }
  },
  providers: {
    list: async (): Promise<any[]> => {
      try {
        const response = await apiClient.get('/providers');
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    create: async (data: Record<string, unknown>): Promise<any> => {
      try {
        const response = await apiClient.post('/providers', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    }
  },
  organizations: {
    list: async (): Promise<any[]> => {
      try {
        const response = await apiClient.get('/orgs');
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    create: async (data: any): Promise<any> => {
      try {
        const response = await apiClient.post('/orgs', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    update: async (id: string, data: any): Promise<any> => {
      try {
        const response = await apiClient.patch(`/orgs?org_id=${id}`, data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    delete: async (id: string): Promise<any> => {
      try {
        const response = await apiClient.delete(`/orgs?org_id=${id}`);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    }
  },
  blocks: {
    list: async (): Promise<any[]> => {
      try {
        const response = await apiClient.get('/blocks');
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    create: async (data: any): Promise<any> => {
      try {
        const response = await apiClient.post('/blocks', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    delete: async (id: string): Promise<any> => {
      try {
        const response = await apiClient.delete(`/blocks/${id}`);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    }
  },
  runs: {
    list: async (params?: any): Promise<any[]> => {
      try {
        const response = await apiClient.get('/runs', { params });
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    delete: async (id: string): Promise<any> => {
      try {
        const response = await apiClient.delete(`/runs/${id}`);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    }
  },
  analytics: {
    getStats: async (): Promise<AnalyticsStats> => {
      try {
        const response = await apiClient.get('/analytics/stats');
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    getTopology: async (): Promise<TopologyData> => {
      try {
        const response = await apiClient.get('/analytics/topology');
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    }
  },
  groups: {
    list: async (): Promise<any[]> => {
      try {
        const response = await apiClient.get('/groups');
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    create: async (data: any): Promise<any> => {
      try {
        const response = await apiClient.post('/groups', data);
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    }
  },
  logs: {
    getStreamUrl: () => {
      return `${WS_BASE_URL}/logs/stream`;
    }
  }
};
