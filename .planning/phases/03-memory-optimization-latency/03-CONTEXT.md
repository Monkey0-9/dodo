# Phase 3: Memory Optimization (Latency) - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Reduce retrieval latency for autonomous agents.

</domain>

<decisions>
## Implementation Decisions

### Memory Cache
- Implement L1 LRU Cache in PassageManager.
- Add latency-aware metrics for the memory hot-path.

### the agent's Discretion
All implementation choices are at the agent's discretion.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `dodo/services/passage_manager.py`

### Established Patterns
- LRU caching decorator (using `async_lru` package)

### Integration Points
- Passage retrieval methods

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None.

</deferred>
