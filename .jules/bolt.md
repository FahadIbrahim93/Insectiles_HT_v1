## 2026-03-04 - [Asset Lookup in Hot Paths]
**Learning:** In high-frequency render loops (60fps Canvas), even O(1) Map lookups for assets (like sprites) can add up when multiplied by the number of active entities. Background selection logic and gradient creation should also be session-persistent rather than per-frame.
**Action:** Cache HTMLImageElement references directly on game objects at spawn time and store session-level visual paths in a persistent state object.
