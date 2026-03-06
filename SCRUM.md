# SCRUM.md - Decision Log

## Autonomous Agent System

This project uses an **Autonomous Multi-Agent System** where:
- CODEX creates and prioritizes tasks
- Agents self-pick from TASK_POOL.md
- Agents execute independently
- CODEX coordinates, doesn't assign

---

## System Status

| Component | Status |
|-----------|--------|
| CODEX (Head Admin) | ✅ ACTIVE |
| TASK_POOL.md | ✅ ACTIVE |
| Autonomous Workflow | ✅ ACTIVE |

---

## Decision Log

### 2026-03-05: System Design
**Decision**: Created autonomous multi-agent system
**Details**:
- CODEX as coordinator, not assigner
- TASK_POOL.md for task management
- Self-pick model for agents
- Clear authority boundaries

---

## Completed Tasks (By System)

| Date | Item | Status |
|------|------|--------|
| 2026-03-05 | AGENTS.md (Autonomous) | ✅ |
| 2026-03-05 | TASK_POOL.md | ✅ |
| 2026-03-05 | CODEX.md | ✅ |
| 2026-03-05 | AGENT_GENERIC.md | ✅ |
| 2026-03-05 | agent-config.json | ✅ |

---

## Notes

### How It Works
1. CODEX writes tasks in TASK_POOL.md
2. Agents check pool → pick task → execute → mark done
3. CODEX intervenes only when:
   - Conflict between agents
   - Breaking/architecture changes
   - Agent requests help

### Why Autonomous?
- Faster execution (no assignment overhead)
- Agents work when they want
- Trust-based system
- CODEX focuses on direction, not management

---

## Contact Protocol

| Issue | Contact |
|-------|---------|
| Task questions | Check TASK_POOL.md |
| Blocked | Mark BLOCKED, continue |
| Conflict | Wait for CODEX |
| Urgent | Flag as URGENT |

---

**Autonomous agents, execute!**

### 2026-03-05: Universal Workflow Pinboard Remediation
**Decision**: Reworked `UNIVERSAL_WORKFLOW_PINBOARD.md` into a project-specific executable playbook
**Details**:
- Added numbered deep-planning section with concrete constraints, edge cases, and unknowns.
- Added scrutiny scoring table with justifications and targeted remediations.
- Added autonomous completion sweep table and closeout statement requirements.
- Added hardening evidence format and zero-issues closure loop.
- Added current sweep closeout table with blocker and open question tracking.

### 2026-03-06: Branch/PR Index Refresh + Gameplay State Safety + Test Expansion
**Decision**: Treat current `work` head as canonical baseline and harden gameplay/store verification.
**Details**:
- Rebuilt `PR_INDEX.md` from current git graph to remove stale "open PR" assumptions.
- Updated `Game.tsx` engine callbacks to read live state via `useGameStore.getState()` (no stale closure values).
- Expanded store tests to cover reset, subscriptions, persisted high score guards, and game-over transitions.


### 2026-03-06: Follow-up remediation for lint scope and test compile integrity
**Decision**: Remove tsconfig narrowing workaround and make in-repo test files compile without blocked external packages.
**Details**:
- Replaced `src/test/ErrorBoundary.test.tsx` vitest/testing-library imports with `node:test` + `assert` based checks.
- Restored `tsconfig.json` to default full-project behavior (removed include/exclude bypasses).
- Updated `vitest.config.ts` to avoid `vitest/config` import so `tsc --noEmit` can type-check in this environment.


### 2026-03-06: Execute `src/test` in default test pipeline
**Decision**: Promote `src/test/ErrorBoundary.test.tsx` from compile-only coverage to executed coverage in `npm test`.
**Details**:
- Updated package scripts so Node test runner executes both `tests/*.test.ts` and `src/test/*.test.tsx`.
- Verified integrated run now executes 30 tests total (including ErrorBoundary tests).
- Kept runner dependency surface unchanged (`node:test` + `tsx`) to remain compatible with registry restrictions.


### 2026-03-06: Store semantics hardening pass
**Decision**: Tighten store transition correctness and reject invalid scoring inputs.
**Details**:
- Updated `setGameOver(false)` to preserve current play-state rather than force `isPlaying=true`.
- Added guards to `addScore` for non-finite/non-positive values and normalized fractional points to integer increments.
- Added regression tests for transition preservation and invalid scoring edge-cases.


### 2026-03-06: Mobile swipe control implementation
**Decision**: Complete P2 task 001 by adding lane-swipe touch input on canvas gameplay.
**Details**:
- Added swipe lane interpolation helper (`getLanesFromSwipe`) in `src/utils/input.ts`.
- Added touch start/move/end handlers in `Game.tsx` to trigger taps across crossed lanes without duplicate lane triggers.
- Added input tests for forward/reverse/invalid swipe lane interpolation paths.
