import MockAdapter from 'axios-mock-adapter';
import type { AxiosInstance } from 'axios';
import type { AgentState, AnalyticsStats, TopologyData } from './types';

export const setupDemoMock = (axiosInstance: AxiosInstance) => {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 500 });

  // Mock Agents
  const mockAgents: AgentState[] = [
    {
      id: 'agent-1f9a2b3c',
      name: 'Delta-9 Research Analyst',
      system: 'You are an advanced quantitative research analyst.',
      agent_type: 'core_v1',
      model: 'gpt-4o',
      blocks: [
        { id: 'b-1', name: 'human', label: 'Human Context', value: 'Focusing on ESG metrics.', limit: 2000 },
        { id: 'b-2', name: 'persona', label: 'Persona Context', value: 'Quant Analyst', limit: 2000 }
      ],
      tools: [
        { id: 't-1', name: 'web_search', json_schema: {}, tool_type: 'custom' },
        { id: 't-2', name: 'sql_connector', json_schema: {}, tool_type: 'custom' }
      ],
      tags: ['production', 'finance', 'quant'],
      last_run_completion: new Date().toISOString(),
      last_stop_reason: 'end_turn'
    },
    {
      id: 'agent-4c8d5e6f',
      name: 'Omega Data Processor',
      system: 'Process incoming data streams and categorize them.',
      agent_type: 'core_v1',
      model: 'claude-3-5-sonnet',
      blocks: [
        { id: 'b-3', name: 'persona', label: 'Persona Context', value: 'Data Processor', limit: 2000 }
      ],
      tools: [],
      tags: ['backend', 'processing'],
      last_run_completion: new Date(Date.now() - 3600000).toISOString(),
      last_stop_reason: 'max_tokens'
    },
    {
      id: 'agent-7a1b2c3d',
      name: 'Customer Success Bot',
      system: 'You are a helpful customer success agent.',
      agent_type: 'core_v1',
      model: 'gemini-1.5-pro',
      blocks: [],
      tools: [
        { id: 't-3', name: 'zendesk_lookup', json_schema: {}, tool_type: 'custom' }
      ],
      tags: ['frontend', 'support'],
      last_run_completion: new Date(Date.now() - 120000).toISOString(),
      last_stop_reason: 'end_turn'
    }
  ];

  mock.onGet('/agents').reply(200, mockAgents);
  mock.onGet(/\/agents\/.+/).reply(200, mockAgents[0]);

  // Mock Runs
  const mockRuns = [
    { id: 'run-9f8e7d6c', agent_id: 'agent-1f9a2b3c', status: 'Completed', created_at: new Date(Date.now() - 60000).toISOString(), completed_at: new Date(Date.now() - 55000).toISOString() },
    { id: 'run-5a4b3c2d', agent_id: 'agent-4c8d5e6f', status: 'Failed', created_at: new Date(Date.now() - 180000).toISOString(), completed_at: new Date(Date.now() - 170000).toISOString() },
    { id: 'run-1b2c3d4e', agent_id: 'agent-7a1b2c3d', status: 'Running', created_at: new Date(Date.now() - 15000).toISOString(), completed_at: null },
    { id: 'run-8x7y6z5w', agent_id: 'agent-1f9a2b3c', status: 'Completed', created_at: new Date(Date.now() - 300000).toISOString(), completed_at: new Date(Date.now() - 290000).toISOString() },
    { id: 'run-2v3u4t5s', agent_id: 'agent-4c8d5e6f', status: 'Completed', created_at: new Date(Date.now() - 3600000).toISOString(), completed_at: new Date(Date.now() - 3595000).toISOString() },
  ];

  mock.onGet('/runs').reply(200, mockRuns);

  // Mock Analytics Stats
  const mockStats: AnalyticsStats = {
    throughput: "1.2M",
    active_threads: "842",
    neural_entropy: "0.042",
    global_latency: "24",
    trends: {
      throughput: "up",
      active_threads: "neutral",
      neural_entropy: "down",
      global_latency: "up"
    },
    changes: {
      throughput: "+12.5%",
      active_threads: "Stable",
      neural_entropy: "-5.2%",
      global_latency: "+2ms"
    },
    chart_data: [
      { time: "00:00", latency: 120, requests: 400 },
      { time: "04:00", latency: 150, requests: 600 },
      { time: "08:00", latency: 142, requests: 1200 },
      { time: "12:00", latency: 180, requests: 1500 },
      { time: "16:00", latency: 160, requests: 1100 },
      { time: "20:00", latency: 130, requests: 800 },
      { time: "23:59", latency: 125, requests: 500 }
    ]
  };

  mock.onGet('/analytics/stats').reply(200, mockStats);

  // Mock Topology
  const mockTopology: TopologyData = {
    nodes: [
      { id: "CORE_01", name: "Core Intelligence 01", type: "model", status: "active", metadata: { load: "44.2%", temp: "72.4°C" } },
      { id: "CORE_02", name: "Core Intelligence 02", type: "model", status: "idle", metadata: { load: "12.1%", temp: "45.0°C" } },
      { id: "MEM_A", name: "Mem Cluster A", type: "memory", status: "active", metadata: { health: "99.9%" } },
      { id: "MEM_B", name: "Mem Cluster B", type: "memory", status: "active", metadata: { health: "100%" } },
      { id: "AGENT_01", name: "Delta-9 Research Analyst", type: "agent", status: "active", metadata: { status: "ACTIVE" } },
      { id: "AGENT_02", name: "Omega Data Processor", type: "agent", status: "error", metadata: { status: "ERROR" } },
      { id: "AGENT_03", name: "Customer Success Bot", type: "agent", status: "active", metadata: { status: "ACTIVE" } }
    ],
    links: [
      { source: "MEM_A", target: "CORE_01", type: "data" },
      { source: "MEM_B", target: "CORE_02", type: "data" },
      { source: "AGENT_01", target: "CORE_01", type: "logic" },
      { source: "AGENT_02", target: "CORE_01", type: "logic" },
      { source: "AGENT_03", target: "CORE_02", type: "logic" },
      { source: "AGENT_01", target: "MEM_A", type: "data" },
      { source: "AGENT_03", target: "MEM_B", type: "data" }
    ]
  };

  mock.onGet('/analytics/topology').reply(200, mockTopology);

  // Auth mock
  mock.onPost('/auth/login').reply(200, { access_token: 'mock-demo-token-12345' });

  // Default catch-all
  mock.onAny().reply(config => {
    console.log('[MockAdapter] Unhandled request:', config.method?.toUpperCase(), config.url);
    return [404, { detail: 'Not found in mock' }];
  });

  console.log('🚀 Dodo Portal Demo Mode Initialized with Mock Data');
};
