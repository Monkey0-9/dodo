export interface Block {
  id: string;
  name: string;
  label: string;
  value: string;
  limit: number;
}

export interface Tool {
  id: string;
  name: string;
  description?: string;
  json_schema: Record<string, any>;
  tool_type: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | any[];
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
  created_at: string;
}

export interface AgentState {
  id: string;
  name: string;
  system: string;
  agent_type: string;
  model?: string;
  blocks: Block[];
  tools: Tool[];
  tags: string[];
  last_run_completion?: string;
  last_stop_reason?: string;
}

export interface AnalyticsStats {
  throughput: string;
  active_threads: string;
  neural_entropy: string;
  global_latency: string;
  trends: {
    throughput: 'up' | 'down' | 'neutral';
    active_threads: 'up' | 'down' | 'neutral';
    neural_entropy: 'up' | 'down' | 'neutral';
    global_latency: 'up' | 'down' | 'neutral';
  };
  changes: {
    throughput: string;
    active_threads: string;
    neural_entropy: string;
    global_latency: string;
  };
  chart_data: Array<{
    time: string;
    latency: number;
    requests: number;
  }>;
}

export interface TopologyNode {
  id: string;
  name: string;
  type: 'model' | 'memory' | 'agent';
  status: 'active' | 'idle' | 'error';
  metadata: Record<string, any>;
}

export interface TopologyLink {
  source: string;
  target: string;
  type: 'logic' | 'data';
}

export interface TopologyData {
  nodes: TopologyNode[];
  links: TopologyLink[];
}
