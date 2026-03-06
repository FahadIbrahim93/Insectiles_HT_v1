# Pinik Pipra (Insectiles) 🎮

**A psychedelic insect tile-matching falling game**  
*Owner: Fahad Ibrahim (HopeTheory)*

---

## 🎯 Quick Start

```bash
# Clone
git clone https://github.com/FahadIbrahim93/Insectiles_HT_v1.git
cd Insectiles_HT_v1

# Install & Run
npm install
npm run dev
```

**Game runs on:** http://localhost:3000

---

## 🎮 Gameplay

- Tap the lowest insect before it reaches the bottom
- Don't tap empty lanes!
- Build combos for score multipliers
- Score points to trigger **FEVER MODE**
- Collect power-ups: 🛡️ Shield and ⏰ Slow-Mo
- Beat the high score!

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|--------|
| React 19 | UI Framework |
| Vite | Build Tool |
| TypeScript | Type Safety |
| Tailwind CSS 4 | Styling |
| Canvas 2D | Game Rendering |
| Web Audio API | Psytrance Audio Engine |
| Zustand | State Management |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Game.tsx              # Main game canvas & lifecycle
│   ├── GameHud.tsx           # Score, combo, fever UI
│   ├── GameOverlay.tsx       # Game over, title screen
│   ├── BattlePassOverlay.tsx # Season pass progression
│   ├── StoreOverlay.tsx      # In-game store
│   ├── TutorialOverlay.tsx   # Onboarding tutorial
│   └── ErrorBoundary.tsx     # Crash protection
├── utils/
│   ├── gameEngine.ts         # Core game loop & rendering
│   ├── visualEffects.ts      # MandalaBG, PostFX, Particles, QueenReactor
│   ├── enhancedAssets.ts     # Adaptive asset loading & quality tiers
│   ├── enhancedParticles.ts  # Character-specific particle effects
│   ├── audio.ts              # Psytrance audio generator
│   ├── difficultyManager.ts  # Adaptive difficulty scaling
│   ├── achievements.ts       # Achievement tracking
│   ├── battlePass.ts         # Battle pass progression
│   ├── dailyChallenges.ts    # Daily challenge rotation
│   ├── tutorial.ts           # Tutorial state machine
│   ├── store.ts              # Zustand game store
│   ├── haptics.ts            # Mobile vibration feedback
│   ├── events.ts             # EventBus system
│   ├── shareUtils.ts         # Social sharing
│   ├── reviveSystem.ts       # Continue/revive logic
│   └── ...                   # atlas, flags, logger, etc.
├── App.tsx
├── main.tsx
└── index.css
public/assets/               # Game assets
├── images/                  # Sprites & backgrounds
├── animations/              # .mp4 idle animations
└── sprites/                 # Sprite atlas data
docs/                        # Documentation
├── audit-reports/           # Code & CTO audits
├── plans/                   # Roadmaps & task boards
├── visual/                  # Visual masterplans
└── *.md                     # Design docs, guides
tests/                       # Unit tests (15 files)
e2e/                         # End-to-end tests
scripts/                     # CI/CD helpers
```

---

## ✨ Key Features

- **Adaptive Visual Engine**: Device-aware quality tiers with real-time FPS profiling
- **Reactive Queen Mascot**: Responds to hits, misses, and fever with pose animations
- **Psychedelic Mandala Backgrounds**: Parallax-driven rotating neon patterns
- **PostFX Layer**: Glitch effects, screen shake, and chromatic aberration
- **Adaptive Difficulty**: AI-driven speed and spawn rate scaling
- **Battle Pass**: Seasonal progression with tiered rewards
- **Tutorial System**: Interactive 5-step onboarding
- **Psytrance Audio**: Procedurally generated soundtrack

---

## 🤖 For AI Agents

See [docs/AGENTS.md](./docs/AGENTS.md) for:
- Branch strategy
- Commit format
- Code standards
- Task workflow

### Branch Flow
```
main ← Production (live)
  ↑
dev ← Integration (PRs go here)
  ↑
feat/* or fix/* ← Your branches
```

---

## 🚀 Deployment (Vercel)

```bash
npm run build
npx vercel --prod
```

---

## ✅ CI Quality Gate

GitHub Actions workflow at `.github/workflows/ci.yml` enforces:
- `npm run lint`
- `npm run test`
- `npm run build`

---

## 📊 Current Status

| Metric | Status |
|--------|--------|
| Build | ✅ Passing |
| Lint | ✅ Passing |
| Visual Overhaul | ✅ Phase 8 Complete |
| Assets | ✅ 18+ Integrated |
| Test Coverage | ⚠️ Needs Work |

---

## 📜 Documentation

| File | Description |
|------|-------------|
| [CHANGELOG.md](./CHANGELOG.md) | Version history |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution workflow |
| [SECURITY.md](./SECURITY.md) | Security policy |
| [docs/GAME_DESIGN_DOCUMENT.md](./docs/GAME_DESIGN_DOCUMENT.md) | Full game design spec |
| [docs/BRANDING.md](./docs/BRANDING.md) | Visual identity guide |
| [docs/SPRITE_ATLAS_GUIDE.md](./docs/SPRITE_ATLAS_GUIDE.md) | Sprite atlas reference |
| [docs/plans/](./docs/plans/) | Roadmaps & task boards |
| [docs/audit-reports/](./docs/audit-reports/) | Code & CTO audits |

---

## 🔗 Important Links

- **GitHub:** https://github.com/FahadIbrahim93/Insectiles_HT_v1
- **Linear:** https://linear.app/hope-theory
- **Game Demo:** (Coming Soon)

---

## 📄 License

MIT

---

*Built with ❤️ by HopeTheory*
