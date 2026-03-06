# TASK POOL - Autonomous Task Management

## System
- **CODEX** creates and prioritizes tasks
- **Agents self-pick** tasks from this pool
- **Autonomous execution** - no assignment needed

---

## Priority Legend
- **P0**: Critical - Production broken, security
- **P1**: High - Important features, major bugs
- **P2**: Medium - Normal development
- **P3**: Low - Nice to have

---

## Available Tasks

### P2: Game Enhancements

| ID | Task | Type | Agent | Status |
|----|------|------|-------|--------|
| 001 | Add mobile touch controls for swiping insects | Frontend | CODEX | DONE |
| 002 | Implement combo multiplier system | Backend | OPEN | OPEN |
| 003 | Add particle explosion effects on catch | Frontend | OPEN | OPEN |
| 004 | Create power-up system (shield, slow-mo) | Backend | OPEN | OPEN |
| 005 | Add leaderboard UI | Frontend | OPEN | OPEN |
| 006 | Implement save/load game state | Backend | OPEN | OPEN |

### P3: Polish

| ID | Task | Type | Agent | Status |
|----|------|------|-------|--------|
| 007 | Add sound toggle button | Frontend | OPEN | OPEN |
| 008 | Improve loading screen animation | Frontend | OPEN | OPEN |
| 009 | Add retina display support | Frontend | OPEN | OPEN |
| 010 | Optimize bundle size | Backend | OPEN | OPEN |

---

## In Progress

| ID | Task | Agent | Started | Notes |
|----|------|-------|---------|-------|
| - | - | - | - | No active tasks |

---

## Blocked

| ID | Task | Agent | Blocker Reason |
|----|------|-------|----------------|
| - | - | - | No blocked tasks |

---

## Completed

| ID | Task | Agent | Completed | Notes |
|----|------|-------|-----------|-------|
| INF-001 | Extract GameEngine module from Game.tsx | CODEX | 2026-03-07 | Separated loop orchestration into dedicated engine class (200+ LOC) |
| INF-002 | Add Playwright E2E test suite | CODEX | 2026-03-07 | Created 9 tests covering start/restart/fever/game-over, added test IDs |
| INF-003 | Integrate new bug assets (bug-1-4, multiview) | CODEX | 2026-03-07 | Added 5 PNG assets to constants.ts and copied to public folder |
| INF-004 | Update package.json for Playwright | CODEX | 2026-03-07 | Added test:e2e, test:e2e:ui, test:e2e:debug scripts |
| OPS-001 | Code quality verification | CODEX | 2026-03-07 | Build & 20 unit tests passing, strict TypeScript |
| INF-005 | Upgrade Universal Workflow Pinboard to project-specific executable playbook | CODEX | 2026-03-05 | Replaced generic template with complete plan, scrutiny, sweep, hardening, and closure artifacts |
| INF-006 | Stabilize game loop state reads + expand store edge-case tests + refresh branch/PR audit index | CODEX | 2026-03-06 | Fixed stale state callback reads, added 7 additional store edge-case tests, rebuilt PR_INDEX for current graph |
| INF-007 | Remove lint scope workaround by making ErrorBoundary tests compile without external blocked deps | CODEX | 2026-03-06 | Rewrote src/test/ErrorBoundary.test.tsx to node:test assertions, restored tsconfig default scope, made vitest config compile-safe |
| INF-008 | Execute src/test suite in default npm test pipeline and verify integrated test coverage | CODEX | 2026-03-06 | Updated npm test/test:watch to run tests/*.test.ts and src/test/*.test.tsx, verified 30 passing tests |
| INF-009 | Harden store state semantics (gameOver transitions + score input validation) | CODEX | 2026-03-06 | Prevented setGameOver(false) from forcing play state and ignored invalid/non-positive scores with new regression tests |
| FEAT-001 | Add mobile swipe lane controls | CODEX | 2026-03-06 | Added touch swipe handling across lanes with deduped lane hits + input utility tests |

---

## How to Use

### Pick a Task
1. Find OPEN task matching your specialization
2. Add your name to Agent column
3. Change status to IN_PROGRESS
4. Execute!

### Update Progress
- Edit this file with your updates
- Include timestamp when starting
- Include notes if needed

### Mark Complete
1. Change status to DONE
2. Add completion date
3. Move to Completed section

---

## Request New Task

To request a new task:
1. Propose task in this file with PROPOSED tag
2. CODEX will review and assign priority
3. Once approved, moves to Available

Example:
```
| PROPOSED | Add night mode | Frontend | CODEX | Pending |
```

---

**Pick a task and go! 🚀**
