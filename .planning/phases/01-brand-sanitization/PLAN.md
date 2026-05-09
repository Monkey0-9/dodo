# Plan: Brand Sanitization & Quick Refinement

Execute a comprehensive brand update and fix initial technical debt in the Dodo framework.

## Context
Phase 1 of the "Top 1%" Upgrade. Goal is 100% brand consistency.

## Tasks

### Wave 1: Global Replacement
- [ ] **Task 1.1**: Replace all instances of "Nexus" with "Dodo" (case-sensitive) and "nexus" with "dodo".
    - Target: `dodo/`, `dodo_portal/`, `tests/`, `README.md`.
    - Note: Already updated some instances in README and AgentList.tsx.
- [ ] **Task 1.2**: Update specific compound names:
    - "Nexus-Core" -> "Dodo-Core"
    - "Nexus-Quant" -> "Dodo-Alpha"
    - "Nexus-Trading" -> "Dodo-Execution"

### Wave 2: Documentation & Cleanup
- [ ] **Task 2.1**: Update `README.md` diagrams or text to reflect "Dodo" architecture.
- [ ] **Task 2.2**: Audit `pyproject.toml` and other config files for legacy metadata.

## Verification
- [ ] `grep -r "Nexus"` returns 0 matches.
- [ ] `grep -r "nexus"` returns 0 matches (excluding external library dependencies if possible).
- [ ] Frontend `AgentList.tsx` displays "Dodo-Alpha".
- [ ] All unit tests pass (`pytest`).
