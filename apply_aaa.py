import sys
import re

def read_file(path):
    with open(path, 'r') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w') as f:
        f.write(content)

# 1. src/utils/gameEngine.ts
engine = read_file('src/utils/gameEngine.ts')

# EngineCallbacks interface
if 'onMultiplierIncrease?: (multiplier: number) => void;' not in engine:
    engine = engine.replace(
        'onFrame?: (timestamp: number) => void;',
        'onFrame?: (timestamp: number) => void;\n  onMultiplierIncrease?: (multiplier: number) => void;'
    )

# Faster hue in loop()
engine = engine.replace(
    'this.hue = (this.hue + (getIsFeverMode() ? 5 : 1)) % 360;',
    'this.hue = (this.hue + (getIsFeverMode() ? 8 : 1)) % 360;'
)

# Haptics in handleTap
engine = engine.replace(
    'this.callbacks.triggerHaptic(this.callbacks.getIsFeverMode() ? [12, 25, 12] : 18);',
    'this.callbacks.triggerHaptic(this.callbacks.getIsFeverMode() ? [50] : (comboMultiplier > 1 ? [30] : [15]));'
)

# Callback in handleTap
if 'this.callbacks.onMultiplierIncrease?.(comboMultiplier);' not in engine:
    engine = engine.replace(
        'const comboMultiplier = this.callbacks.recordHit();',
        'const comboMultiplier = this.callbacks.recordHit();\n    if (comboMultiplier > 1) {\n      this.callbacks.onMultiplierIncrease?.(comboMultiplier);\n    }'
    )

# Entire method replacements for safety
def replace_method(content, method_name, new_body):
    pattern = re.compile(rf'  (private|public)? ?{method_name}\(.*?\):? .*? \{{.*?^\n?  \}}', re.DOTALL | re.MULTILINE)
    # The above regex is tricky because of nested braces. Let's find the method start and use brace counting.
    start_match = re.search(rf'  (private|public)? ?{method_name}\(', content)
    if not start_match:
        return content
    start_idx = start_match.start()

    # Find opening brace
    open_brace_idx = content.find('{', start_idx)
    if open_brace_idx == -1:
        return content

    # Count braces
    brace_count = 0
    end_idx = -1
    for i in range(open_brace_idx, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                break

    if end_idx != -1:
        return content[:start_idx] + new_body + content[end_idx:]
    return content

new_spawn = """  private spawnInsect(): void {
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

new_explosion = """  private createExplosion(lane: number, y: number, color: string): void {
    const laneWidth = this.canvas.width / this.config.laneCount;
    const centerX = lane * laneWidth + laneWidth / 2;
    const centerY = y + this.config.tileHeight * 0.4;
    const laneColor = GameEngine.LANE_COLORS[lane % GameEngine.LANE_COLORS.length];
    const isFever = this.callbacks.getIsFeverMode();
    const count = isFever ? 24 : 16;

    // AAA-005/008: Enhanced explosion with more particles and rainbow fever colors
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

new_trail = """  private createTrailParticle(insect: Insect): void {
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

engine = replace_method(engine, 'spawnInsect', new_spawn)
engine = replace_method(engine, 'createExplosion', new_explosion)
engine = replace_method(engine, 'createTrailParticle', new_trail)

# Radial gradient in draw()
fever_overlay_old = """    // Draw psychedelic overlay in fever mode
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

fever_overlay_new = """    // Draw psychedelic overlay in fever mode
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
engine = engine.replace(fever_overlay_old, fever_overlay_new)

write_file('src/utils/gameEngine.ts', engine)

# 2. src/components/GameHud.tsx
hud = read_file('src/components/GameHud.tsx')
if 'hudPulse?: boolean;' not in hud:
    hud = hud.replace('showPerfHud: boolean;', 'showPerfHud: boolean;\n  hudPulse?: boolean;')
    hud = hud.replace('showPerfHud,', 'showPerfHud,\n  hudPulse,')
    hud = hud.replace(
        'data-testid="game-hud" className="absolute top-4 left-0 right-0 z-10 flex flex-col px-6"',
        'data-testid="game-hud" className={`absolute top-4 left-0 right-0 z-10 flex flex-col px-6 transition-transform duration-300 ${hudPulse ? "scale-110" : "scale-100"}`}'
    )
if 'aria-label=' not in hud:
    hud = hud.replace('onClick={onToggleSound}', 'onClick={onToggleSound}\n            aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}')
write_file('src/components/GameHud.tsx', hud)

# 3. src/components/Game.tsx
game = read_file('src/components/Game.tsx')
if 'const [hudPulse, setHudPulse]' not in game:
    game = game.replace(
        'const [perfSnapshot, setPerfSnapshot] = useState<PerfSnapshot | null>(null);',
        'const [perfSnapshot, setPerfSnapshot] = useState<PerfSnapshot | null>(null);\n  const [hudPulse, setHudPulse] = useState(false);'
    )
if 'onMultiplierIncrease' not in game:
    game = game.replace(
        'onFrame: (timestamp) => {',
        'onMultiplierIncrease: (multiplier: number) => {\n          setHudPulse(true);\n          setTimeout(() => setHudPulse(false), 300);\n        },\n        onFrame: (timestamp) => {'
    )
if 'hudPulse={hudPulse}' not in game:
    game = game.replace('showPerfHud={showPerfHud}', 'hudPulse={hudPulse}\n        showPerfHud={showPerfHud}')

write_file('src/components/Game.tsx', game)

print("AAA Polish Final Applied Correctly.")
