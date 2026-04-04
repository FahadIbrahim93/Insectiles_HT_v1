# CTO Critical Audit Report — 2026-03-28

## Scope and Evidence
This audit is based on direct repository inspection and executable checks run on **March 28, 2026 (UTC)**.

### Commands executed
- `npm run lint`
- `npm run build`
- `npm test`
- `npm run test:coverage`
- `npm run perf:smoke`
- `npm run audit:prod` *(failed: npm advisory endpoint returned HTTP 403 in this environment)*
- `npm run test:e2e -- --project=chromium` *(failed: Playwright browser binary missing in this environment)*
- `rg -n "TODO|FIXME|HACK|any\b|ts-ignore|eslint-disable|console\." src tests .github README.md`
- `wc -l src/components/*.tsx src/utils/*.ts src/store/*.ts tests/*.ts .github/workflows/ci.yml README.md`

## Executive Verdict
The codebase is **functional and much healthier than a typical indie prototype**, but it is **not yet 10/10 production-grade**. The core game loop is test-backed and CI-gated, yet architectural concentration, browser-only runtime assumptions, and non-deterministic audio logic leave measurable risk for scale and reliability.

---

## Scorecard (1–10)

| Dimension | Score | Brutal assessment |
|---|---:|---|
| 1) Code quality & structure | 7.4 | Core logic is extracted (`GameEngine`, utility modules), but one dominant class (`src/utils/gameEngine.ts`, 679 LOC) still carries too much rendering + gameplay + state mutation responsibility. |
| 2) Readability & maintainability | 7.2 | Naming is mostly clear, but long functions and tightly coupled callback contracts in `Game.tsx`↔`GameEngine` increase cognitive load and change risk. |
| 3) Performance & scalability | 7.8 | Basic FPS instrumentation and particle caps are in place; smoke perf passes. However, random spawn/audio plus per-frame object churn still limit deterministic scaling and profiling confidence. |
| 4) Security best practices | 6.3 | No obvious secrets in app code; persistence is constrained and sanitized. But dependency vulnerability scanning is currently non-verifiable in this environment (`npm audit` blocked), and no SAST/secret scan tooling appears in CI. |
| 5) Test coverage & reliability | 8.0 | Unit/integration depth is good (84 passing tests; 86.73% line coverage), but reliability is uneven due to E2E environment brittleness and low coverage in key runtime-heavy files (`audio.ts`, `gameEngine.ts`). |
| 6) Architecture & modularity | 7.0 | Good extraction into utility modules, but game domain still lacks clear boundaries (rendering, simulation, and effects in single engine class). Hard to evolve to multiplayer/modes without refactor. |
| 7) Standards & compliance discipline | 6.8 | CI quality gates exist and run lint/test/build, but no explicit OWASP ASVS mapping, accessibility verification automation, or license/dependency policy checks. |
| 8) Team collaboration readiness | 7.1 | Documentation volume is high, but quality is uneven/outdated (README still references old architecture metrics). No conventional commit enforcement or code ownership rules beyond basic CODEOWNERS. |
| 9) Business/product alignment | 7.6 | Feature set maps to arcade MVP goals (score loop, fever mode, leaderboard, mobile input). Missing explicit product telemetry and KPI instrumentation limits business decision quality. |
| 10) Release readiness & operations | 6.9 | CI is decent; build is healthy. But production confidence is weakened by failing local E2E setup in standard environment and incomplete security scan signal. |
| 11) Observability & diagnostics | 7.0 | Logger and perf HUD exist, but no structured telemetry pipeline, no error reporting integration, and no SLO-based runtime monitoring. |
| 12) Dependency/runtime hygiene | 6.7 | Modern stack and narrow runtime deps are positives, but versions use broad semver ranges (`^`) and there is no lockfile policy validation or Renovate/Dependabot automation documented. |

### Overall weighted score: **7.2 / 10**

---

## High-Priority Issues (P0/P1)

### P0-1: Monolithic engine hotspot
- `src/utils/gameEngine.ts` is 679 LOC and mixes simulation, draw calls, lifecycle, collision, effects, and spawn logic.
- Consequence: regression risk grows superlinearly with each feature.
- Impact: slow feature throughput, brittle bug fixes, difficult onboarding.

### P0-2: Runtime-critical paths under-tested
- Coverage report highlights low line coverage in `audio.ts` (58.11%) and `gameEngine.ts` (65.98%).
- These files are exactly where user-facing runtime instability would surface first.
- Impact: confidence gap between “tests pass” and “game is resilient in real browsers/devices.”

### P0-3: E2E reliability not portable
- E2E suite fails in this environment because Playwright browser binary is absent.
- Even if CI uses a Playwright image, local reproducibility is currently fragile.
- Impact: hidden regressions and delayed incident discovery.

### P1-1: Security signal incomplete
- `npm audit` could not fetch advisories (HTTP 403), leaving unresolved dependency risk signal.
- No secondary scanner fallback (e.g., OSV-Scanner, Snyk, Trivy) was detected in scripts/CI.

### P1-2: Documentation drift
- README structure still references historical line counts and old architecture notes.
- Drift between docs and current implementation causes operational confusion.

### P1-3: Product analytics blind spot
- No event instrumentation for retention funnels (session start, streak depth, fever trigger rate, fail reason, restart conversion).
- Business cannot optimize gameplay based on real evidence.

---

## Technical Debt Inventory

1. **God object tendency** in game engine (render + update + orchestration in one class).
2. **Weak determinism** (heavy `Math.random()` usage without injectable PRNG seed).
3. **UI/game coupling** via broad callback interface from React component to engine.
4. **Insufficient contract tests** for browser/device quirks (audio context resume policies, touch move edge-cases).
5. **Version drift risk** from permissive semver ranges.
6. **No formal architecture decision log for current engine boundaries** despite many historical audit docs.

---

## Concrete Improvement Plan

## A) Code-level (1–2 sprints)
1. Split `GameEngine` into:
   - `SimulationSystem` (spawn/collision/score events)
   - `RenderSystem` (canvas draw only)
   - `EffectSystem` (particles, shake, popups)
   - `EngineOrchestrator` (loop + sequencing)
2. Replace ad-hoc callback contract with typed domain events:
   - e.g., `onHit`, `onMiss`, `onPowerup`, `onGameOver`.
3. Introduce deterministic PRNG (seeded) injected into systems.
4. Add hard assertions around lane bounds and entity invariants in non-prod builds.

## B) Test architecture (1 sprint)
1. Raise coverage floors by file, not global average:
   - `audio.ts` ≥ 80%
   - `gameEngine.ts` ≥ 85%
2. Add deterministic simulation replay tests (fixed seed, fixed frame count).
3. Add a browser bootstrap check in preflight that installs/verifies Playwright binaries before E2E.
4. Add mutation testing (Stryker) for scoring and game-over logic.

## C) Security/process (1 sprint)
1. Add fallback vulnerability scanning:
   - `osv-scanner` against lockfile
   - optional `npm audit` as non-blocking secondary signal.
2. Add secret scanning in CI (gitleaks/trufflehog).
3. Enforce dependency update automation (Renovate/Dependabot).
4. Pin CI toolchain versions and document threat model for localStorage data.

## D) Product/business instrumentation (1 sprint)
1. Add event schema and analytics adapter (PostHog/Amplitude).
2. Track:
   - session starts/completions
   - fever activations
   - average combo streak
   - tap accuracy
   - retry conversion.
3. Tie telemetry to roadmap outcomes (retention and engagement targets).

---

## Recommended Tools/Practices

- **Architecture/quality**: ESLint + `typescript-eslint`, Madge (dep graph), dependency-cruiser.
- **Testing**: Playwright with deterministic fixtures, Stryker mutation testing, per-file coverage gates.
- **Security**: OSV-Scanner, gitleaks, npm-package-json-lint, supply-chain policy checks.
- **Perf/diagnostics**: Web Vitals + custom gameplay metrics, Sentry for runtime errors, benchmark.js for micro-benchmarks.
- **Process**: Conventional Commits, PR checklist with risk tiering, ADR templates for major design decisions.

---

## Risks and Unknowns

1. Real-device performance and input latency on low-end Android are not validated in this run.
2. npm advisory API access was blocked; dependency risk cannot be conclusively rated “clean.”
3. E2E browser binaries were unavailable locally; full end-user path verification remains pending.
4. No direct evidence of production monitoring/alerting configuration in repo scope.

---

## Best Possible Plan to Reach 10/10 (prioritized)

### Week 1 (stability first)
- Refactor engine boundaries (Simulation/Render separation).
- Add deterministic seedable simulation.
- Increase coverage gates on runtime-critical files.

### Week 2 (confidence and security)
- Harden E2E preflight + browser install strategy.
- Add OSV + secret scan in CI.
- Create architecture ADRs and enforce PR risk checklist.

### Week 3 (business leverage)
- Ship gameplay telemetry schema + dashboards.
- Define SLOs for crash-free sessions and frame budget adherence.
- Run device matrix validation and publish evidence.

### Exit criteria for “10/10” claim
- 0 critical/high vulns from at least one reliable scanner
- Deterministic replay tests for core game loop
- Runtime-critical modules above agreed coverage thresholds
- Reproducible E2E pass path locally + CI
- Product telemetry reporting active with KPI dashboard
- Documented rollback + incident playbook

