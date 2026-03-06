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
| - | - | - | - | No open P2 tasks |

### P3: Polish

| ID | Task | Type | Agent | Status |
|----|------|------|-------|--------|
| - | - | - | - | No open P3 tasks |

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
| 001 | Add mobile touch controls for swiping insects | CODEX | 2026-03-05 | Added swipe lane detection via touchmove with de-dup lane tracking |
| 002 | Implement combo multiplier system | CODEX | 2026-03-05 | Added streak-based combo multiplier (x1..x5) and HUD display |
| 003 | Add particle explosion effects on catch | CODEX | 2026-03-05 | Added canvas particle burst effect for hits and power-up pickups |
| 004 | Create power-up system (shield, slow-mo) | CODEX | 2026-03-05 | Added falling powerups with shield consume and slow-mo timer |
| 005 | Add leaderboard UI | CODEX | 2026-03-05 | Added top-5 leaderboard panel in overlay with persisted scores |
| 006 | Implement save/load game state | CODEX | 2026-03-05 | Added persistent game meta state (high score/leaderboard/sound) |
| 007 | Add sound toggle button | CODEX | 2026-03-05 | Added HUD sound toggle and audio mute integration |
| 008 | Improve loading screen animation | CODEX | 2026-03-05 | Added spinner + animated gradient loading treatment |
| 009 | Add retina display support | CODEX | 2026-03-05 | Added DPR-aware canvas sizing + transform scaling |
| 010 | Optimize bundle size | CODEX | 2026-03-05 | Added lazy-loaded Game component via React Suspense |
| INF-006 | Stabilize lint gate and fix runtime regressions after gameplay sweep | CODEX | 2026-03-05 | Added lint-specific tsconfig, fixed DPR canvas scaling, and respected sound toggle for power-up SFX |

---


## Merge-Ready Baseline

- Completed tasks (001-010, INF-001..INF-006) are intentionally tracked **only** in `Completed` to reduce merge conflicts.
- Keep `Available Tasks` limited to OPEN work items.
- When resolving PR conflicts, prefer preserving latest `Completed` rows by date.

---

## How to Use

### Pick a Task
1. Find OPEN task matching your specialization
2. Add your name to Agent column
3. Change status to IN_PROGRESS
4. Execute!

### Update Progress
- Edit this file with your updates
- Include **UTC timestamp** when starting (required)
- Include owner, dependencies, and notes as needed

### Mark Complete
1. Change status to DONE
2. Add completion date/time in UTC (required)
3. Add proof link/location in notes (required)
4. Move to Completed section

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
