# Project: Dodo "Top 1%" Upgrade

Institutional-grade autonomous agent platform refinement and quantitative optimization.

## Context
Dodo is an advanced AI agent framework designed for high-stakes, 24/7 autonomous operation. It features a polyglot architecture (supporting Python, Rust, Go, Zig), institutional-grade observability (OTEL, ClickHouse), and sophisticated memory management (PassageManager with dual-storage). This project aims to harden the platform and optimize it for top-tier performance and software engineering excellence.

## Core Value
Achieve "Top 1%" status by eliminating architectural debt, optimizing latency-critical paths, and enhancing brand consistency.

## Requirements

### Validated
- ✓ Core agent lifecycle management (AgentManager/BaseAgentV2).
- ✓ Distributed memory persistence (PassageManager/Pinecone/Turbopuffer).
- ✓ Institutional monitoring (EventLoopWatchdog/OTEL).
- ✓ Multi-provider LLM support (Anthropic/OpenAI/Google).
- ✓ Brand Sanitization: Purged all "Nexus" references from codebase.
- ✓ Architectural Modularization: Refactored AnthropicClient into modular handlers.
- ✓ Performance Optimization: Implemented L1 in-process caching for PassageManager.
- ✓ UI/UX Excellence: Upgraded Dodo Portal with Framer Motion animations.

### Active
- [ ] Architectural Modularization: Decompose AgentManager into domain services.
- [ ] Quant Hardening: Add high-resolution latency tracking for reasoning-to-action hot paths.
- [ ] Reliability: Implement Payload Snapshot Testing for LLM interactions.

### Out of Scope
- [Non-Dodo Platforms] — Focus is exclusively on the Dodo ecosystem.

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Strategy Pattern for Clients | Reduces complexity of the 2000-line AnthropicClient. | — Pending |
| L1 LRU Cache | Reduces retrieval latency for "hot" agent memories. | — Pending |

## Evolution
This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-05-09 after initialization*
