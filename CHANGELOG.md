# Changelog

All notable changes to Pinik Pipra (Insectiles) are documented here.

## [Unreleased] - 2026-03-07

### Added
- **Visual Overhaul (Phase 8)**
  - Centralized `AssetManager` with device-aware quality tiers (Low/Medium/High/Ultra)
  - `QueenReactor` reactive mascot system with pose-based animations (jump, sad, spin, tongue)
  - `MandalaBG` psychedelic parallax background renderer
  - `Profiler` for real-time FPS monitoring and automatic quality adaptation
  - `PostFX` glitch effects layer for miss/hit events
  - `ParticleSystem` and `Firework` visual feedback systems
  - Video asset (`.mp4`) preloading support in `AssetManager`
- **Enhanced Game Systems**
  - `DifficultyManager` with adaptive speed and spawn rate scaling
  - `BattlePass` progression system with seasonal rewards
  - `DailyChallenges` with rotating objectives
  - `Achievements` system with milestone tracking
  - `ReviveSystem` for continue functionality
  - `ShareUtils` for social sharing integration
  - `Haptics` for vibration feedback on mobile
  - `EventBus` centralized event system
- **Tutorial System** with 5-step onboarding flow
- **Store Overlay** for in-game purchases
- **Battle Pass Overlay** with tier progression UI
- **Enhanced Particles** with character-specific effects
- **Sprite Atlas** support via `atlas.ts`
- Organized documentation under `docs/` with subdirectories

### Fixed
- Tutorial "Maximum update depth exceeded" crash (immutable state refactor)
- Asset loading failures for `.mp4` video files
- DifficultyManager integration with game loop

### Changed
- `GameEngine` refactored to use `AssetManager` instead of raw image arrays
- `Game.tsx` updated to use centralized asset preloading
- Insect spawning uses named character asset keys instead of numeric indices
- Documentation reorganized from repo root into `docs/`, `docs/plans/`, `docs/audit-reports/`
- Updated `.gitignore` to exclude `bug-models/`
