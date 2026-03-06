import sys
import re

def read_file(path):
    with open(path, 'r') as f:
        return f.readlines()

def write_file(path, lines):
    with open(path, 'w') as f:
        f.writelines(lines)

# --- 1. src/utils/gameEngine.ts ---
lines = read_file('src/utils/gameEngine.ts')

# Update Interface: EngineCallbacks
for i, line in enumerate(lines):
    if 'onFrame?: (timestamp: number) => void;' in line:
        lines[i] = '  onFrame?: (timestamp: number) => void;\n  onMultiplierIncrease?: (multiplier: number) => void;\n'
        break

# Hue speed
for i, line in enumerate(lines):
    if 'this.hue = (this.hue + (getIsFeverMode() ? 5 : 1)) % 360;' in line:
        lines[i] = '    this.hue = (this.hue + (getIsFeverMode() ? 8 : 1)) % 360;\n'
        break

# spawnInsect section
# Find the start of the spawnInsect method
start = -1
for i, line in enumerate(lines):
    if 'private spawnInsect(): void {' in line:
        start = i
        break
if start != -1:
    brace_count = 0
    end = -1
    for k in range(start, len(lines)):
        brace_count += lines[k].count('{')
        brace_count -= lines[k].count('}')
        if brace_count == 0:
            end = k + 1
            break
    if end != -1:
        lines[start:end] = [
            '  private spawnInsect(): void {\n',
            '    const isFeverMode = this.callbacks.getIsFeverMode();\n',
            '    const lane = Math.floor(Math.random() * this.config.laneCount);\n',
            '    let spriteIndex: number;\n',
            '    let cachedImage: HTMLImageElement | undefined;\n',
            '    let useSpriteSheet = false;\n',
            '\n',
            '    if (isFeverMode) {\n',
            '      // Use BUG_1-4 (indices 12-15) for fever mode\n',
            '      const feverOffset = Math.floor(Math.random() * GameEngine.SPRITE_COUNT);\n',
            '      spriteIndex = GameEngine.SPRITE_FEVER_START + feverOffset;\n',
            '      cachedImage = this.images[spriteIndex];\n',
            '    } else {\n',
            '      // Use generated 8x4 sprite sheet for walk cycle in normal mode\n',
            '      cachedImage = this.images.find((img) => img.src.includes(GameEngine.WALK_SPRITE_PATH));\n',
            '      if (cachedImage) {\n',
            '        useSpriteSheet = true;\n',
            '        spriteIndex = -1;\n',
            '      } else {\n',
            '        const fallbackOffset = Math.floor(Math.random() * GameEngine.SPRITE_COUNT);\n',
            '        spriteIndex = GameEngine.SPRITE_FALLING_START + fallbackOffset;\n',
            '        cachedImage = this.images[spriteIndex];\n',
            '      }\n',
            '    }\n',
            '\n',
            '    this.insects.push({\n',
            '      id: this.entityIdCounter++,\n',
            '      lane,\n',
            '      y: -this.config.tileHeight,\n',
            '      spriteIndex,\n',
            '      speed: this.speed * (isFeverMode ? 1.5 : 1),\n',
            '      isFeverTarget: isFeverMode,\n',
            '      cachedImage,\n',
            '      frameIndex: 0,\n',
            '      frameCount: GameEngine.WALK_FRAME_COUNT,\n',
            '      frameAdvanceCounter: 0,\n',
            '      frameAdvanceRate: GameEngine.WALK_FRAME_RATE,\n',
            '      useSpriteSheet,\n',
            '      spriteRow: lane % GameEngine.WALK_SPRITE_ROWS,\n',
            '      hitScale: 1,\n',
            '      hitAlpha: 1,\n',
            '      isHit: false,\n',
            '    });\n',
            '  }\n'
        ]

# handleTap
for i, line in enumerate(lines):
    if 'const comboMultiplier = this.callbacks.recordHit();' in line:
        lines[i] = '    const comboMultiplier = this.callbacks.recordHit();\n    if (comboMultiplier > 1) {\n      this.callbacks.onMultiplierIncrease?.(comboMultiplier);\n    }\n'
    if 'this.callbacks.triggerHaptic(this.callbacks.getIsFeverMode() ? [12, 25, 12] : 18);' in line:
        lines[i] = '      this.callbacks.triggerHaptic(this.callbacks.getIsFeverMode() ? [50] : (comboMultiplier > 1 ? [30] : [15]));\n'

# Fever overlay
# First find the if(isFeverMode) block inside draw()
for i, line in enumerate(lines):
    if 'if (isFeverMode) {' in line and 'gradient = ctx.createLinearGradient' in lines[i+1]:
        brace_count = 0
        end = -1
        for k in range(i, len(lines)):
            brace_count += lines[k].count('{')
            brace_count -= lines[k].count('}')
            if brace_count == 0:
                end = k + 1
                break
        if end != -1:
            lines[i:end] = [
                '    if (isFeverMode) {\n',
                '      // AAA-008: Enhanced psychedelic background\n',
                '      const gradient = ctx.createRadialGradient(\n',
                '        this.canvas.width / 2, this.canvas.height / 2, 0,\n',
                '        this.canvas.width / 2, this.canvas.height / 2, this.canvas.height\n',
                '      );\n',
                '      gradient.addColorStop(0, `hsla(${this.hue}, 90%, 55%, ${reducedMotion ? 0.15 : 0.3})`);\n',
                '      gradient.addColorStop(0.5, `hsla(${(this.hue + 60) % 360}, 90%, 50%, ${reducedMotion ? 0.1 : 0.2})`);\n',
                '      gradient.addColorStop(1, `hsla(${(this.hue + 120) % 360}, 95%, 45%, ${reducedMotion ? 0.14 : 0.35})`);\n',
                '      ctx.fillStyle = gradient;\n',
                '      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);\n',
                '\n',
                '      if (!reducedMotion) {\n',
                '        // Intense pulsing border\n',
                '        const feverPulse = 0.4 + Math.sin(this.frames * 0.2) * 0.2;\n',
                '        ctx.strokeStyle = `hsla(${(this.hue + 180) % 360}, 100%, 70%, ${feverPulse})`;\n',
                '        ctx.lineWidth = 8 + Math.sin(this.frames * 0.1) * 4;\n',
                '        ctx.strokeRect(5, 5, this.canvas.width - 10, this.canvas.height - 10);\n',
                '      }\n',
                '    }\n'
            ]
            break

# createExplosion
for i, line in enumerate(lines):
    if 'private createExplosion(lane: number, y: number, color: string): void {' in line:
        brace_count = 0
        end = -1
        for k in range(i, len(lines)):
            brace_count += lines[k].count('{')
            brace_count -= lines[k].count('}')
            if brace_count == 0:
                end = k + 1
                break
        if end != -1:
            lines[i:end] = [
                '  private createExplosion(lane: number, y: number, color: string): void {\n',
                '    const laneWidth = this.canvas.width / this.config.laneCount;\n',
                '    const centerX = lane * laneWidth + laneWidth / 2;\n',
                '    const centerY = y + this.config.tileHeight * 0.4;\n',
                '    const laneColor = GameEngine.LANE_COLORS[lane % GameEngine.LANE_COLORS.length];\n',
                '    const isFever = this.callbacks.getIsFeverMode();\n',
                '    const count = isFever ? 24 : 16;\n',
                '\n',
                '    for (let i = 0; i < count; i++) {\n',
                '      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;\n',
                '      const speed = (isFever ? 2 : 1.5) + Math.random() * 3;\n',
                '      const useLaneColor = Math.random() > 0.3;\n',
                '      let particleColor = useLaneColor ? laneColor : color;\n',
                '\n',
                '      if (isFever) {\n',
                '        particleColor = `hsla(${(this.hue + i * 20) % 360}, 100%, 70%, ALPHA)`;\n',
                '      }\n',
                '\n',
                '      this.emitParticle({\n',
                '        x: centerX,\n',
                '        y: centerY,\n',
                '        vx: Math.cos(angle) * speed,\n',
                '        vy: Math.sin(angle) * speed,\n',
                '        life: 0,\n',
                '        maxLife: 20 + Math.random() * 10,\n',
                '        color: particleColor,\n',
                '      });\n',
                '    }\n',
                '  }\n'
            ]
            break

# createTrailParticle
for i, line in enumerate(lines):
    if 'private createTrailParticle(insect: Insect): void {' in line:
        brace_count = 0
        end = -1
        for k in range(i, len(lines)):
            brace_count += lines[k].count('{')
            brace_count -= lines[k].count('}')
            if brace_count == 0:
                end = k + 1
                break
        if end != -1:
            lines[i:end] = [
                '  private createTrailParticle(insect: Insect): void {\n',
                '    const laneWidth = this.canvas.width / this.config.laneCount;\n',
                '    const centerX = insect.lane * laneWidth + laneWidth / 2;\n',
                '    const isFever = this.callbacks.getIsFeverMode();\n',
                '    const laneColor = isFever \n',
                '      ? `hsla(${(this.hue + insect.id * 30) % 360}, 100%, 70%, ALPHA)`\n',
                '      : GameEngine.LANE_COLORS[insect.lane % GameEngine.LANE_COLORS.length];\n',
                '\n',
                '    this.emitParticle({\n',
                '      x: centerX + (Math.random() - 0.5) * 20,\n',
                '      y: insect.y + this.config.tileHeight * 0.8,\n',
                '      vx: (Math.random() - 0.5) * 0.5,\n',
                '      vy: (isFever ? 0.5 : 0.3) + Math.random() * 0.5,\n',
                '      life: 0,\n',
                '      maxLife: isFever ? 18 : 12,\n',
                '      color: laneColor,\n',
                '    });\n',
                '  }\n'
            ]
            break

write_file('src/utils/gameEngine.ts', lines)

# --- 2. src/components/GameHud.tsx ---
lines = read_file('src/components/GameHud.tsx')
for i, line in enumerate(lines):
    if 'showPerfHud: boolean;' in line:
        lines[i] = '  showPerfHud: boolean;\n  hudPulse?: boolean;\n'
    if 'showPerfHud,' in line:
        lines[i] = '  showPerfHud,\n  hudPulse,\n'
    if 'data-testid="game-hud" className="absolute top-4 left-0 right-0 z-10 flex flex-col px-6"' in line:
        lines[i] = '    <div data-testid="game-hud" className={`absolute top-4 left-0 right-0 z-10 flex flex-col px-6 transition-transform duration-300 ${hudPulse ? "scale-110" : "scale-100"}`}>\n'
    if 'onClick={onToggleSound}' in line:
        lines[i] = '            onClick={onToggleSound}\n            aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}\n'
write_file('src/components/GameHud.tsx', lines)

# --- 3. src/components/Game.tsx ---
lines = read_file('src/components/Game.tsx')
for i, line in enumerate(lines):
    if 'const [perfSnapshot, setPerfSnapshot] = useState<PerfSnapshot | null>(null);' in line:
        lines[i] = '  const [perfSnapshot, setPerfSnapshot] = useState<PerfSnapshot | null>(null);\n  const [hudPulse, setHudPulse] = useState(false);\n'
    if 'onFrame: (timestamp) => {' in line:
        lines[i] = '        onMultiplierIncrease: (multiplier: number) => {\n          setHudPulse(true);\n          setTimeout(() => setHudPulse(false), 300);\n        },\n        onFrame: (timestamp) => {\n'
    if 'showPerfHud={showPerfHud}' in line:
        lines[i] = '        hudPulse={hudPulse}\n        showPerfHud={showPerfHud}\n'
write_file('src/components/Game.tsx', lines)

print("AAA Robust Final Applied.")
