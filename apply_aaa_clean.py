import sys
import re

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

# --- 1. src/utils/gameEngine.ts ---
engine = read_file('src/utils/gameEngine.ts')

# Update Interface: append onMultiplierIncrease exactly once
if 'onMultiplierIncrease?: (multiplier: number) => void;' not in engine:
    engine = engine.replace(
        '  onFrame?: (timestamp: number) => void;',
        '  onFrame?: (timestamp: number) => void;\n  onMultiplierIncrease?: (multiplier: number) => void;'
    )

# handleTap callback: exactly once
old_record_hit = '    const comboMultiplier = this.callbacks.recordHit();'
new_record_hit = """    const comboMultiplier = this.callbacks.recordHit();
    if (comboMultiplier > 1) {
      this.callbacks.onMultiplierIncrease?.(comboMultiplier);
    }"""
if 'this.callbacks.onMultiplierIncrease?.(comboMultiplier);' not in engine:
    engine = engine.replace(old_record_hit, new_record_hit)

# Standardize haptics
haptic_old = '      this.callbacks.triggerHaptic(this.callbacks.getIsFeverMode() ? [12, 25, 12] : 18);'
haptic_new = '      this.callbacks.triggerHaptic(this.callbacks.getIsFeverMode() ? [50] : (comboMultiplier > 1 ? [30] : [15]));'
engine = engine.replace(haptic_old, haptic_new)

# hue increment speed in loop()
hue_search = '    this.hue = (this.hue + (getIsFeverMode() ? 5 : 1)) % 360;'
hue_replace = '    this.hue = (this.hue + (getIsFeverMode() ? 8 : 1)) % 360;'
engine = engine.replace(hue_search, hue_replace)

# spawnInsect refactor
spawn_old = """  private spawnInsect(): void {
    const isFeverMode = this.callbacks.getIsFeverMode();
    const lane = Math.floor(Math.random() * this.config.laneCount);
    let spriteIndex: number;
    let cachedImage: HTMLImageElement | undefined;

    if (isFeverMode) {
      // Use BUG_1-4 (indices 12-15) for fever mode
      const feverOffset = Math.floor(Math.random() * GameEngine.SPRITE_COUNT);
      spriteIndex = GameEngine.SPRITE_FEVER_START + feverOffset;
      cachedImage = this.images[spriteIndex];
    } else {
      // Use generated 8x4 sprite sheet for walk cycle in normal mode
      cachedImage = this.images.find((img) => img.src.includes(GameEngine.WALK_SPRITE_PATH));
      const fallbackOffset = Math.floor(Math.random() * GameEngine.SPRITE_COUNT);
      spriteIndex = cachedImage ? -1 : GameEngine.SPRITE_FALLING_START + fallbackOffset;
      if (!cachedImage) cachedImage = this.images[spriteIndex];
    }

    this.insects.push({
      id: this.entityIdCounter++,
      lane,
      y: -this.config.tileHeight,
      spriteIndex,
      speed: this.speed * (isFeverMode ? 1.5 : 1),
      isFeverTarget: isFeverMode,
      cachedImage,
      frameIndex: 0,
      frameCount: GameEngine.WALK_FRAME_COUNT,
      frameAdvanceCounter: 0,
      frameAdvanceRate: GameEngine.WALK_FRAME_RATE,
      useSpriteSheet: !isFeverMode,
      spriteRow: lane % GameEngine.WALK_SPRITE_ROWS,
      hitScale: 1,
      hitAlpha: 1,
      isHit: false,
    });
  }"""

spawn_new = """  private spawnInsect(): void {
    const isFeverMode = this.callbacks.getIsFeverMode();
    const lane = Math.floor(Math.random() * this.config.laneCount);
    let spriteIndex: number;
    let cachedImage: HTMLImageElement | undefined;
    let useSpriteSheet = false;

    if (isFeverMode) {
      // Use BUG_1-4 (indices 12-15) for fever mode
      const feverOffset = Math.floor(Math.random() * GameEngine.SPRITE_COUNT);
      spriteIndex = GameEngine.SPRITE_FEVER_START + feverOffset;
      cachedImage = this.images[spriteIndex];
    } else {
      // Use generated 8x4 sprite sheet for walk cycle in normal mode
      cachedImage = this.images.find((img) => img.src.includes(GameEngine.WALK_SPRITE_PATH));
      if (cachedImage) {
        useSpriteSheet = true;
        spriteIndex = -1;
      } else {
        const fallbackOffset = Math.floor(Math.random() * GameEngine.SPRITE_COUNT);
        spriteIndex = GameEngine.SPRITE_FALLING_START + fallbackOffset;
        cachedImage = this.images[spriteIndex];
      }
    }

    this.insects.push({
      id: this.entityIdCounter++,
      lane,
      y: -this.config.tileHeight,
      spriteIndex,
      speed: this.speed * (isFeverMode ? 1.5 : 1),
      isFeverTarget: isFeverMode,
      cachedImage,
      frameIndex: 0,
      frameCount: GameEngine.WALK_FRAME_COUNT,
      frameAdvanceCounter: 0,
      frameAdvanceRate: GameEngine.WALK_FRAME_RATE,
      useSpriteSheet,
      spriteRow: lane % GameEngine.WALK_SPRITE_ROWS,
      hitScale: 1,
      hitAlpha: 1,
      isHit: false,
    });
  }"""
engine = engine.replace(spawn_old, spawn_new)

# draw() overlay
fever_block_old = """    // Draw psychedelic overlay in fever mode
    if (isFeverMode) {
      const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
      gradient.addColorStop(0, `hsla(${this.hue}, 90%, 55%, ${reducedMotion ? 0.15 : 0.28})`);
      gradient.addColorStop(0.5, `hsla(${(this.hue + 60) % 360}, 90%, 50%, ${reducedMotion ? 0.1 : 0.24})`);
      gradient.addColorStop(1, `hsla(${(this.hue + 140) % 360}, 95%, 45%, ${reducedMotion ? 0.14 : 0.3})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      if (!reducedMotion) {
        const feverPulse = 0.35 + Math.sin(this.frames * 0.14) * 0.15;
        ctx.strokeStyle = `hsla(${(this.hue + 200) % 360}, 100%, 70%, ${feverPulse})`;
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, this.canvas.width - 6, this.canvas.height - 6);
      }
    }"""

fever_block_new = """    // Draw psychedelic overlay in fever mode
    if (isFeverMode) {
      // AAA-008: Enhanced psychedelic background
      const gradient = ctx.createRadialGradient(
        this.canvas.width / 2, this.canvas.height / 2, 0,
        this.canvas.width / 2, this.canvas.height / 2, this.canvas.height
      );
      gradient.addColorStop(0, `hsla(${this.hue}, 90%, 55%, ${reducedMotion ? 0.15 : 0.3})`);
      gradient.addColorStop(0.5, `hsla(${(this.hue + 60) % 360}, 90%, 50%, ${reducedMotion ? 0.1 : 0.2})`);
      gradient.addColorStop(1, `hsla(${(this.hue + 120) % 360}, 95%, 45%, ${reducedMotion ? 0.14 : 0.35})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      if (!reducedMotion) {
        // Intense pulsing border
        const feverPulse = 0.4 + Math.sin(this.frames * 0.2) * 0.2;
        ctx.strokeStyle = `hsla(${(this.hue + 180) % 360}, 100%, 70%, ${feverPulse})`;
        ctx.lineWidth = 8 + Math.sin(this.frames * 0.1) * 4;
        ctx.strokeRect(5, 5, this.canvas.width - 10, this.canvas.height - 10);
      }
    }"""
engine = engine.replace(fever_block_old, fever_block_new)

# createExplosion
explosion_old = """  private createExplosion(lane: number, y: number, color: string): void {
    const laneWidth = this.canvas.width / this.config.laneCount;
    const centerX = lane * laneWidth + laneWidth / 2;
    const centerY = y + this.config.tileHeight * 0.4;
    const laneColor = GameEngine.LANE_COLORS[lane % GameEngine.LANE_COLORS.length];

    // AAA-005: Enhanced explosion with more particles and lane colors
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
      const speed = 1.5 + Math.random() * 3;
      const useLaneColor = Math.random() > 0.3;
      this.emitParticle({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 20 + Math.random() * 10,
        color: useLaneColor ? laneColor : color,
      });
    }
  }"""

new_explosion = """  private createExplosion(lane: number, y: number, color: string): void {
    const laneWidth = this.canvas.width / this.config.laneCount;
    const centerX = lane * laneWidth + laneWidth / 2;
    const centerY = y + this.config.tileHeight * 0.4;
    const laneColor = GameEngine.LANE_COLORS[lane % GameEngine.LANE_COLORS.length];
    const isFever = this.callbacks.getIsFeverMode();
    const count = isFever ? 24 : 16;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = (isFever ? 2 : 1.5) + Math.random() * 3;
      const useLaneColor = Math.random() > 0.3;
      let particleColor = useLaneColor ? laneColor : color;

      if (isFever) {
        particleColor = `hsla(${(this.hue + i * 20) % 360}, 100%, 70%, ALPHA)`;
      }

      this.emitParticle({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 20 + Math.random() * 10,
        color: particleColor,
      });
    }
  }"""
engine = engine.replace(explosion_old, new_explosion)

# createTrailParticle
trail_old = """  // AAA-005: Create trail particles behind falling insects
  private createTrailParticle(insect: Insect): void {
    const laneWidth = this.canvas.width / this.config.laneCount;
    const centerX = insect.lane * laneWidth + laneWidth / 2;
    const laneColor = GameEngine.LANE_COLORS[insect.lane % GameEngine.LANE_COLORS.length];

    this.emitParticle({
      x: centerX + (Math.random() - 0.5) * 20,
      y: insect.y + this.config.tileHeight * 0.8,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.3 + Math.random() * 0.5,
      life: 0,
      maxLife: 12,
      color: laneColor,
    });
  }"""

new_trail = """  // AAA-005/008: Create trail particles behind falling insects
  private createTrailParticle(insect: Insect): void {
    const laneWidth = this.canvas.width / this.config.laneCount;
    const centerX = insect.lane * laneWidth + laneWidth / 2;
    const isFever = this.callbacks.getIsFeverMode();
    const laneColor = isFever
      ? `hsla(${(this.hue + insect.id * 30) % 360}, 100%, 70%, ALPHA)`
      : GameEngine.LANE_COLORS[insect.lane % GameEngine.LANE_COLORS.length];

    this.emitParticle({
      x: centerX + (Math.random() - 0.5) * 20,
      y: insect.y + this.config.tileHeight * 0.8,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (isFever ? 0.5 : 0.3) + Math.random() * 0.5,
      life: 0,
      maxLife: isFever ? 18 : 12,
      color: laneColor,
    });
  }"""
engine = engine.replace(trail_old, new_trail)

write_file('src/utils/gameEngine.ts', engine)

# --- 2. src/components/GameHud.tsx ---
hud = read_file('src/components/GameHud.tsx')
if 'hudPulse?: boolean;' not in hud:
    hud = hud.replace('  showPerfHud: boolean;', '  showPerfHud: boolean;\n  hudPulse?: boolean;')
    hud = hud.replace('  showPerfHud,', '  showPerfHud,\n  hudPulse,')
    hud = hud.replace(
        '    <div data-testid="game-hud" className="absolute top-4 left-0 right-0 z-10 flex flex-col px-6">',
        '    <div data-testid="game-hud" className={`absolute top-4 left-0 right-0 z-10 flex flex-col px-6 transition-transform duration-300 ${hudPulse ? \"scale-110\" : \"scale-100\"}`}>\n'
    )
if 'aria-label=' not in hud:
    hud = hud.replace(
        '            onClick={onToggleSound}',
        '            onClick={onToggleSound}\n            aria-label={soundEnabled ? \"Mute sound\" : \"Unmute sound\"}'
    )
write_file('src/components/GameHud.tsx', hud)

# --- 3. src/components/Game.tsx ---
game = read_file('src/components/Game.tsx')
if 'const [hudPulse, setHudPulse]' not in game:
    game = game.replace(
        '  const [perfSnapshot, setPerfSnapshot] = useState<PerfSnapshot | null>(null);',
        '  const [perfSnapshot, setPerfSnapshot] = useState<PerfSnapshot | null>(null);\n  const [hudPulse, setHudPulse] = useState(false);'
    )
if 'onMultiplierIncrease' not in game:
    game = game.replace(
        '        onFrame: (timestamp) => {',
        '        onMultiplierIncrease: (multiplier: number) => {\n          setHudPulse(true);\n          setTimeout(() => setHudPulse(false), 300);\n        },\n        onFrame: (timestamp) => {'
    )
if 'hudPulse={hudPulse}' not in game:
    game = game.replace('        showPerfHud={showPerfHud}', '        hudPulse={hudPulse}\n        showPerfHud={showPerfHud}')
write_file('src/components/Game.tsx', game)

print("Applied Clean AAA Polish.")
