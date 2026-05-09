import axios from 'axios';

const API_BASE_URL = 'http://localhost:8283/v1';
const WS_BASE_URL = 'ws://localhost:8283/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-project': 'default',
  },
});

export const api = {
  agents: {
    list: async () => {
      const response = await apiClient.get('/agents');
      return response.data;
    },
    create: async (data: any) => {
      const response = await apiClient.post('/agents', data);
      return response.data;
    },
    get: async (id: string) => {
      const response = await apiClient.get(`/agents/${id}`);
      return response.data;
    },
    sendMessage: async (id: string, message: string) => {
      const response = await apiClient.post(`/agents/${id}/messages`, {
        messages: [{ role: 'user', content: message }],
        streaming: false
      });
      return response.data;
    },
    listMessages: async (id: string) => {
      const response = await apiClient.get(`/agents/${id}/messages`);
      return response.data;
    },
    getStreamUrl: (id: string) => {
      return `${WS_BASE_URL}/portal/stream/${id}`;
    }
  }
};
