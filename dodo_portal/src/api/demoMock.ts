import MockAdapter from 'axios-mock-adapter';
import type { AxiosInstance } from 'axios';
import type { AgentState, AnalyticsStats, TopologyData, Message } from './types';

export const setupDemoMock = (axiosInstance: AxiosInstance) => {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 300 });

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

  mock.onGet('/agents').reply(() => [200, mockAgents]);
  mock.onPost('/agents').reply(config => {
    const data = JSON.parse(config.data);
    const newAgent: AgentState = {
      id: 'agent-' + Math.random().toString(36).substring(2, 10),
      name: data.name || 'Unnamed Agent',
      system: data.system || '',
      agent_type: data.agent_type || 'dodo_v1_agent',
      model: data.model || 'openai/gpt-4o',
      blocks: data.blocks || [],
      tools: data.tools || [],
      tags: data.tags || ['custom'],
      last_run_completion: new Date().toISOString(),
      last_stop_reason: 'end_turn'
    };
    mockAgents.push(newAgent);
    return [200, newAgent];
  });
  mock.onGet(/\/agents\/[^\/]+$/).reply(config => {
    const id = config.url?.split('/').pop();
    const agent = mockAgents.find(a => a.id === id);
    return agent ? [200, agent] : [404, { detail: 'Agent not found' }];
  });

  let mockMessages: Record<string, Message[]> = {
    'agent-1f9a2b3c': [
      { id: 'msg-1', role: 'user', content: 'What is the current PE ratio of AAPL?', created_at: new Date(Date.now() - 100000).toISOString() },
      { id: 'msg-2', role: 'assistant', content: 'Let me fetch that for you using the SQL Connector.', tool_calls: [{ name: 'sql_connector' }], created_at: new Date(Date.now() - 95000).toISOString() },
      { id: 'msg-3', role: 'tool', content: '{"pe_ratio": 28.5}', created_at: new Date(Date.now() - 90000).toISOString() },
      { id: 'msg-4', role: 'assistant', content: 'The current PE ratio of AAPL is 28.5.', created_at: new Date(Date.now() - 85000).toISOString() }
    ]
  };

  mock.onGet(/\/agents\/[^\/]+\/messages/).reply(config => {
    const id = config.url?.split('/')[2];
    return [200, mockMessages[id as string] || []];
  });

  mock.onPost(/\/agents\/[^\/]+\/messages/).reply(config => {
    const id = config.url?.split('/')[2];
    if (!id) return [404, {}];
    const data = JSON.parse(config.data);
    const newMsg: Message = {
      id: Math.random().toString(),
      role: 'assistant',
      content: 'Simulated response to: ' + data.messages[0].content,
      created_at: new Date().toISOString()
    };
    if (!mockMessages[id]) mockMessages[id] = [];
    mockMessages[id].push(data.messages[0]);
    mockMessages[id].push(newMsg);
    return [200, { success: true }];
  });

  // Mock Runs
  const mockRuns = [
    { id: 'run-9f8e7d6c', agent_id: 'agent-1f9a2b3c', status: 'Completed', created_at: new Date(Date.now() - 60000).toISOString(), completed_at: new Date(Date.now() - 55000).toISOString() },
    { id: 'run-5a4b3c2d', agent_id: 'agent-4c8d5e6f', status: 'Failed', created_at: new Date(Date.now() - 180000).toISOString(), completed_at: new Date(Date.now() - 170000).toISOString() },
    { id: 'run-1b2c3d4e', agent_id: 'agent-7a1b2c3d', status: 'Running', created_at: new Date(Date.now() - 15000).toISOString(), completed_at: null },
    { id: 'run-8x7y6z5w', agent_id: 'agent-1f9a2b3c', status: 'Completed', created_at: new Date(Date.now() - 300000).toISOString(), completed_at: new Date(Date.now() - 290000).toISOString() },
    { id: 'run-2v3u4t5s', agent_id: 'agent-4c8d5e6f', status: 'Completed', created_at: new Date(Date.now() - 3600000).toISOString(), completed_at: new Date(Date.now() - 3595000).toISOString() },
  ];

  mock.onGet('/runs').reply(200, mockRuns);

  // Mock Tools
  let mockTools = [
    { id: 't-1', name: 'web_search', description: 'Searches the web', json_schema: {}, tool_type: 'custom' },
    { id: 't-2', name: 'sql_connector', description: 'Connects to DB', json_schema: {}, tool_type: 'custom' },
    { id: 't-3', name: 'zendesk_lookup', description: 'Looks up tickets', json_schema: {}, tool_type: 'custom' }
  ];
  mock.onGet('/tools').reply(() => [200, mockTools]);
  mock.onPost('/tools').reply(config => {
    const data = JSON.parse(config.data);
    const newTool = {
      id: 't-' + Math.random().toString(36).substring(2, 10),
      name: data.name || 'unnamed_tool',
      description: data.description || '',
      json_schema: data.json_schema || {},
      tool_type: data.tool_type || 'custom'
    };
    mockTools.push(newTool);
    return [200, newTool];
  });
  mock.onDelete(/\/tools\/.+/).reply(config => {
    const id = config.url?.split('/').pop();
    mockTools = mockTools.filter(t => t.id !== id);
    return [200, { success: true }];
  });

  // Mock Blocks
  let mockBlocks = [
    { id: 'b-1', name: 'human', label: 'Human Context', value: 'Focusing on ESG metrics.', limit: 2000 },
    { id: 'b-2', name: 'persona', label: 'Persona Context', value: 'Quant Analyst', limit: 2000 }
  ];
  mock.onGet('/blocks').reply(() => [200, mockBlocks]);
  mock.onPost('/blocks').reply(config => {
    const data = JSON.parse(config.data);
    const newBlock = {
      id: 'b-' + Math.random().toString(36).substring(2, 10),
      name: data.name || data.label?.toLowerCase().replace(/\s+/g, '_') || 'custom',
      label: data.label || 'Custom Block',
      value: data.value || '',
      limit: data.limit || 2000
    };
    mockBlocks.push(newBlock);
    return [200, newBlock];
  });
  mock.onDelete(/\/blocks\/.+/).reply(config => {
    const id = config.url?.split('/').pop();
    mockBlocks = mockBlocks.filter(b => b.id !== id);
    return [200, { success: true }];
  });
  
  // Mock Organizations
  let mockOrgs = [
    { id: 'org-1', name: 'Default Org', privileged_tools: true },
    { id: 'org-2', name: 'Finance Team', privileged_tools: false }
  ];
  mock.onGet('/orgs').reply(200, mockOrgs);
  mock.onPost('/orgs').reply(config => {
    const data = JSON.parse(config.data);
    const newOrg = { id: 'org-' + Math.random().toString(), ...data };
    mockOrgs.push(newOrg);
    return [200, newOrg];
  });
  mock.onPatch(/\/orgs.*/).reply(config => {
    // /orgs?org_id=org-1
    const urlParams = new URLSearchParams(config.url?.split('?')[1]);
    const id = urlParams.get('org_id');
    const data = JSON.parse(config.data);
    const idx = mockOrgs.findIndex(o => o.id === id);
    if (idx !== -1) {
      mockOrgs[idx] = { ...mockOrgs[idx], ...data };
      return [200, mockOrgs[idx]];
    }
    return [404, {}];
  });
  mock.onDelete(/\/orgs.*/).reply(config => {
    const urlParams = new URLSearchParams(config.url?.split('?')[1]);
    const id = urlParams.get('org_id');
    mockOrgs = mockOrgs.filter(o => o.id !== id);
    return [200, { success: true }];
  });

  // Mock Providers
  mock.onGet('/providers').reply(200, [
    { id: 'p-1', name: 'openai', status: 'connected', provider_type: 'LLM Gateway' },
    { id: 'p-2', name: 'anthropic', status: 'connected', provider_type: 'LLM Gateway' },
    { id: 'p-3', name: 'google', status: 'connected', provider_type: 'Vertex AI' },
  ]);

  // Mock Groups
  mock.onPost('/groups').reply(200, { id: 'g-' + Math.random(), success: true });

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

  console.log('🚀 Dodo Portal Demo Mode Initialized with Mock Data (All endpoints)');
};
