## 2025-03-05 - [Consolidated Input Logic for Multi-Device Support]
**Learning:** Combining pointer (mouse/touch) and keyboard logic into a single `handleAction` function ensures consistent hit detection and scoring rules across devices. However, when adding global listeners (like `keydown`) in a React component that relies on game state refs, using a `Ref` to store the latest handler function is crucial to avoid stale closures.
**Action:** Use `updateRef.current = update` pattern (or similar for other logic) when global listeners need to interact with the latest component scope without triggering effect re-runs.

## 2025-03-05 - [High Score Persistence as a Micro-UX Hook]
**Learning:** Even in a simple game, persisting a high score in `localStorage` significantly increases user engagement by providing a persistent goal.
**Action:** Always check for `localStorage` persistence opportunities in session-based applications.

## 2025-03-05 - [Safe Interaction Patterns in Canvas Games]
**Learning:** In fast-paced canvas games, players will inevitably interact with "empty" space or trigger inputs before objects spawn.
**Action:** Always implement null checks for target objects (e.g., `targetInsect`) before accessing properties in interaction handlers to prevent runtime crashes.
