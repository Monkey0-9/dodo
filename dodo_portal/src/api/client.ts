import axios from 'axios';

// Using relative paths to leverage Vite proxy in development
// and backend serving in production
const API_BASE_URL = '/v1';
const WS_BASE_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/v1`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-project': 'default',
  },
});

// Mock data for initial bootstrap or development without backend
const MOCK_AGENTS = [
  { id: 'agent_8819_xa', name: 'AutoCoder_V4', agent_type: 'coding_agent', status: 'active', persona: 'Expert software engineer.', human: 'Wants efficient code.' },
  { id: 'agent_2241_zb', name: 'DataScribe_X', agent_type: 'reasoning_agent', status: 'active', persona: 'Data analyst.', human: 'Needs reports.' }
];

export const api = {
  agents: {
    list: async () => {
      try {
        const response = await apiClient.get('/agents');
        return response.data;
      } catch (error) {
        console.warn('Backend connection failed, using mock agents.');
        return MOCK_AGENTS;
      }
    },
    create: async (data: any) => {
      try {
        const response = await apiClient.post('/agents', data);
        return response.data;
      } catch (error) {
        console.warn('Backend connection failed, simulating creation.');
        return { ...data, id: `agent_${Math.random().toString(36).substr(2, 4)}`, status: 'active' };
      }
    },
    get: async (id: string) => {
      try {
        const response = await apiClient.get(`/agents/${id}`);
        return response.data;
      } catch (error) {
        return MOCK_AGENTS.find(a => a.id === id) || MOCK_AGENTS[0];
      }
    },
    sendMessage: async (id: string, message: string) => {
      try {
        const response = await apiClient.post(`/agents/${id}/messages`, {
          messages: [{ role: 'user', content: message }],
          streaming: false
        });
        return response.data;
      } catch (error) {
        return { role: 'assistant', content: 'Connection to AI Core is currently offline. Please check .env configuration.' };
      }
    },
    listMessages: async (id: string) => {
      try {
        const response = await apiClient.get(`/agents/${id}/messages`);
        return response.data;
      } catch (error) {
        return [{ role: 'assistant', content: 'System is in offline mode.' }];
      }
    },
    getStreamUrl: (id: string) => {
      return `${WS_BASE_URL}/portal/stream/${id}`;
    }
  },
  tools: {
    list: async () => {
      try {
        const response = await apiClient.get('/tools');
        return response.data;
      } catch (error) {
        return [];
      }
    }
  },
  providers: {
    list: async () => {
      try {
        const response = await apiClient.get('/providers');
        return response.data;
      } catch (error) {
        return [
          { id: 'p1', name: 'OpenAI', provider_type: 'openai', base_url: 'https://api.openai.com/v1' },
          { id: 'p2', name: 'Anthropic', provider_type: 'anthropic', base_url: 'https://api.anthropic.com/v1' }
        ];
      }
    },
    create: async (data: any) => {
      const response = await apiClient.post('/providers', data);
      return response.data;
    }
  },
  organizations: {
    list: async () => {
      try {
        const response = await apiClient.get('/orgs');
        return response.data;
      } catch (error) {
        return [{ id: 'org_dd_8923456', name: 'Dodo Global Operations' }];
      }
    },
    update: async (id: string, data: any) => {
      const response = await apiClient.patch(`/orgs?org_id=${id}`, data);
      return response.data;
    }
  }
};
