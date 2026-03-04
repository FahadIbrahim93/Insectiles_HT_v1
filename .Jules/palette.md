## 2025-05-14 - Canvas Keyboard Accessibility
**Learning:** Implementing keyboard support for canvas-based games requires simulating interactions and bypassing pointer-specific logic (like vertical range hit detection) while still maintaining the core game rules (like tap order).
**Action:** When adding keyboard support to a game that uses screen coordinates for logic/effects, refactor the core logic to be input-agnostic and provide simulated coordinates or alternative paths for keyboard inputs.
