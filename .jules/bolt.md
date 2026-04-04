## 2025-05-15 - Optimize 60fps render loop and asset lookups
**Learning:** Per-frame asset lookups (Map/Object) and expensive canvas state changes like `shadowBlur` can significantly impact performance in a 60fps loop. Caching references on objects at spawn and making expensive effects conditional is a highly effective optimization pattern for canvas games.
**Action:** Always cache image references and other assets on the game objects themselves during initialization or spawning. Use musical intensity or game state (like Fever mode) to toggle expensive rendering effects.
