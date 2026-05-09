# Roadmap: Dodo "Top 1%" Upgrade

## Milestone 1: Institutional Hardening & Performance

### Phase 1: Brand Sanitization & Quick Refinement
**Goal**: Ensure 100% brand consistency and fix obvious debt.
- **Task 1.1**: Global purge of "Nexus" references in code, docs, and mocks.
- **Task 1.2**: Update README and documentation for 2026 standards.
- **Verification**: `grep -r "Nexus"` returns zero results.

### Phase 2: Architectural Deconstruction (Provider Layer)
**Goal**: Modularize the massive Anthropic and OpenAI clients.
- **Task 2.1**: Extract Feature Handlers for AnthropicClient.
- **Task 2.2**: Consolidate Client Manager logic.
- **Verification**: Unit tests for LLM clients pass with modular structure.

### Phase 3: Memory Optimization (Latency)
**Goal**: Reduce retrieval latency for autonomous agents.
- **Task 3.1**: Implement L1 LRU Cache in PassageManager.
- **Task 3.2**: Add latency-aware metrics for the memory hot-path.
- **Verification**: Metrics show <1ms retrieval for L1 cache hits.

### Phase 4: UI/UX "Wow" Implementation
**Goal**: Elevate the portal to a premium feel.
- **Task 4.1**: Implement real-time agent status streaming in Portal.
- **Task 4.2**: Add Framer Motion animations and glassmorphism polish.
- **Verification**: Visual audit confirms 6-pillar aesthetic excellence.

### Phase 5: Reliability & CI Hardening
**Goal**: Ensure zero-regression for high-stakes operation.
- **Task 5.1**: Implement LLM Payload Snapshot Testing.
- **Task 5.2**: Final verification of BaseAgentV2 architecture.
- **Verification**: Snapshot tests pass for all major LLM providers.
