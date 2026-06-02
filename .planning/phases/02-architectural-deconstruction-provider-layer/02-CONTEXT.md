# Phase 2: Architectural Deconstruction (Provider Layer) - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Modularize the massive Anthropic and OpenAI clients.

</domain>

<decisions>
## Implementation Decisions

### Architectural Modularization
- Extract specific handlers from AnthropicClient.
- Consolidate Client Manager logic to ensure modularity.
- Implement tests to prevent regressions.

### the agent's Discretion
All implementation choices are at the agent's discretion.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `dodo/llm_api/anthropic/beta_builder.py`
- `dodo/llm_api/anthropic/caching.py`
- `dodo/llm_api/anthropic/thinking.py`

### Established Patterns
- Client Strategy pattern

### Integration Points
- `dodo/llm_api/anthropic_client.py`

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
