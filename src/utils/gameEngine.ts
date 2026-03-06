import { calculateGameSpeed, calculateSpawnInterval, shouldActivateFeverMode } from '../utils/gameRules';
import { advancePsyEffects, moveInsects, updateScreenShake } from '../utils/loop';
import { findTopTargetInLane } from '../utils/gameplay';
import { triggerHaptic } from '../utils/input';
export interface Insect {
  id: number;
  lane: number;
  y: number;
  spriteIndex: number;
  speed: number;
  isFeverTarget?: boolean;
  cachedImage?: HTMLImageElement;
  frameIndex: number;
  frameCount: number;
  frameAdvanceCounter: number;
  frameAdvanceRate: number;
  hitScale?: number;
  hitAlpha?: number;
  isHit?: boolean;
}
export interface PowerUp {
  id: number;
  lane: number;
  y: number;
  type: 'shield' | 'slowmo';
}
export interface PsyEffect {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  hue: number;
}
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}
export interface ScorePopup {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  scale: number;
  color: string;
}
export interface GameEngineConfig {
  laneCount: number;
  tileHeight: number;
  initialSpeed: number;
  speedIncrement: number;
  maxSpeed: number;
  feverThreshold: number;
}
export interface EngineCallbacks {
  getScore: () => number;
  getIsFeverMode: () => boolean;
  getIsPlaying: () => boolean;
  getGameOver: () => boolean;
  getIsSlowMo: () => boolean;
  getSoundEnabled: () => boolean;
  setFeverMode: (active: boolean) => void;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
  addLeaderboardScore: (score: number) => void;
  recordHit: () => number;
  recordMiss: () => void;
  consumeShield: () => boolean;
  activateShield: () => void;
  activateSlowMo: (durationMs: number) => void;
  playFeverActivation: () => void;
  playTapSound: (isFever: boolean, lane: number) => void;
  playErrorSound: () => void;
  stopBgm: () => void;
}
export class GameEngine {
  private config: GameEngineConfig;
  private callbacks: EngineCallbacks;
  private canvas: HTMLCanvasElement;
  private images: HTMLImageElement[];
  private insects: Insect[] = [];
  private powerUps: PowerUp[] = [];
  private psyEffects: PsyEffect[] = [];
  private particles: Particle[] = [];
  private scorePopups: ScorePopup[] = [];
  private speed: number;
  private frames = 0;
  private lastSpawnFrame = 0;
  private lastPowerUpFrame = 0;
  private hue = 0;
  private entityIdCounter = 0;
  private bgIndex: number;
  private shake = 0;
  private prefersReducedMotion = false;
  // Sprite index constants based on ASSET_PATHS.IMAGES order
  private static readonly SPRITE_FALLING_START = 12;  // BUG_1-4 (PNG with transparency) - was 0 for FALLING_1-4 (JPEG boxes)
  private static readonly SPRITE_FEVER_START = 12;    // BUG_1-4 (PNG with transparency) - was 8 for ANT_MASCOT_1-4
  private static readonly SPRITE_COUNT = 4;
  private static readonly WALK_FRAME_COUNT = 8;
  private static readonly WALK_FRAME_RATE = 5;
  private static readonly LANE_COLORS = [
    'rgba(255,100,150,ALPHA)',  // Lane 0: Pink
    'rgba(100,200,255,ALPHA)',  // Lane 1: Blue
    'rgba(150,255,150,ALPHA)',  // Lane 2: Green
    'rgba(255,220,100,ALPHA)',  // Lane 3: Gold
  ];
  private requestRef: number | undefined;
  private isRunning = false;
  constructor(canvas: HTMLCanvasElement, images: HTMLImageElement[], config: GameEngineConfig, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    this.images = images;
    this.config = config;
    this.callbacks = callbacks;
    this.speed = config.initialSpeed;
    this.bgIndex = Math.floor(Math.random() * 4) + 4; this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  start(): void {
    this.stop();
    this.reset();
    this.isRunning = true;
    this.loop();
  }
  stop(): void {
    this.isRunning = false;
    if (this.requestRef !== undefined) {
      cancelAnimationFrame(this.requestRef);
      this.requestRef = undefined;
    }
  }
  reset(): void {
    this.insects = [];
    this.powerUps = [];
    this.psyEffects = [];
    this.particles = [];
    this.scorePopups = [];
    this.speed = this.config.initialSpeed;
    this.frames = 0;
    this.lastSpawnFrame = 0;
    this.lastPowerUpFrame = 0;
    this.hue = 0;
    this.entityIdCounter = 0;
    this.bgIndex = Math.floor(Math.random() * 4) + 4; this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.shake = 0;
  }
  private loop(): void {
    if (!this.isRunning) return;
    const { getIsPlaying, getGameOver, getScore, getIsFeverMode } = this.callbacks;
    const isPlaying = getIsPlaying();
    const gameOver = getGameOver();
    if (gameOver || !isPlaying) {
      this.stop();
      return;
    }
    this.frames++;
    this.hue = (this.hue + (getIsFeverMode() ? 5 : 1)) % 360;
    const score = getScore();
    const isFeverMode = getIsFeverMode();
    if (shouldActivateFeverMode(score, this.config.feverThreshold, isFeverMode)) {
      this.callbacks.setFeverMode(true);
      this.callbacks.playFeverActivation();
    }
    this.shake = this.prefersReducedMotion ? 0 : updateScreenShake(this.shake, isFeverMode, this.frames);
    this.speed = calculateGameSpeed({
      score,
      initialSpeed: this.config.initialSpeed,
      speedIncrement: this.config.speedIncrement,
      maxSpeed: this.config.maxSpeed,
    });
    const spawnInterval = calculateSpawnInterval({ isFeverMode, score });
    if (this.frames - this.lastSpawnFrame > spawnInterval) {
      this.spawnInsect();
      this.lastSpawnFrame = this.frames;
    }
    if (this.frames - this.lastPowerUpFrame > 540) {
      this.spawnPowerUp();
      this.lastPowerUpFrame = this.frames;
    }
    const speedMultiplier = this.callbacks.getIsSlowMo() ? 0.55 : 1;
    const moved = moveInsects(this.insects, this.canvas.height, isFeverMode, this.config.tileHeight, speedMultiplier);
    this.insects = moved.insects;
    if (moved.reachedBottom && !isFeverMode) {
      if (this.callbacks.consumeShield()) {
        this.insects = this.insects.filter((ins) => ins.y < this.canvas.height);
        this.shake = 18;
      } else {
        triggerHaptic([30, 30, 30]); this.callbacks.recordMiss();
        this.callbacks.setGameOver(true);
        this.callbacks.addLeaderboardScore(score);
        this.callbacks.playErrorSound();
        this.callbacks.stopBgm();
      }
    }
    this.advancePowerUps(speedMultiplier);
    this.psyEffects = advancePsyEffects(this.psyEffects);
    this.advanceParticles();
    this.advanceInsectAnimations();
    this.advanceScorePopups();
    this.draw();
    this.requestRef = requestAnimationFrame(() => this.loop());
  }
  private spawnInsect(): void {
    const isFeverMode = this.callbacks.getIsFeverMode();
    const lane = Math.floor(Math.random() * this.config.laneCount);
    let spriteIndex: number;
    let cachedImage: HTMLImageElement | undefined;
    if (isFeverMode) {
      const feverOffset = Math.floor(Math.random() * GameEngine.SPRITE_COUNT);
      spriteIndex = GameEngine.SPRITE_FEVER_START + feverOffset;
      cachedImage = this.images[spriteIndex];
    } else {
      const normalOffset = Math.floor(Math.random() * GameEngine.SPRITE_COUNT);
      spriteIndex = GameEngine.SPRITE_FALLING_START + normalOffset;
      cachedImage = this.images[spriteIndex];
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
      hitScale: 1,
      hitAlpha: 1,
      isHit: false,
    });
  }
  private spawnPowerUp(): void {
    const lane = Math.floor(Math.random() * this.config.laneCount);
    const type: PowerUp['type'] = Math.random() > 0.5 ? 'shield' : 'slowmo';
    this.powerUps.push({ id: this.entityIdCounter++, lane, y: -this.config.tileHeight * 0.5, type });
  }
  private advancePowerUps(speedMultiplier: number): void {
    const fallSpeed = Math.max(2, this.speed * 0.7 * speedMultiplier);
    const next: PowerUp[] = [];
    for (let i = 0; i < this.powerUps.length; i++) { const powerUp = this.powerUps[i];
      const movedY = powerUp.y + fallSpeed;
      if (movedY <= this.canvas.height + this.config.tileHeight) {
        next.push({ ...powerUp, y: movedY });
      }
    }
    this.powerUps = next;
  }
  private advanceParticles(): void {
    const next: Particle[] = [];
    for (let i = 0; i < this.particles.length; i++) { const particle = this.particles[i];
      const life = particle.life + 1;
      if (life >= particle.maxLife) continue;
      next.push({ ...particle, life, x: particle.x + particle.vx, y: particle.y + particle.vy, vy: particle.vy + 0.08 });
    }
    this.particles = next;
  }
  private advanceInsectAnimations(): void {
    const next: Insect[] = [];
    for (let i = 0; i < this.insects.length; i++) { const insect = this.insects[i];
      if (insect.isHit) {
        insect.hitAlpha = (insect.hitAlpha || 1) - 0.08;
        insect.hitScale = (insect.hitScale || 1) + 0.02;
        if (insect.hitAlpha <= 0) continue; // Remove after fade out
      }
      if (!insect.isHit) {
        insect.frameAdvanceCounter++;
        if (insect.frameAdvanceCounter >= insect.frameAdvanceRate) {
          insect.frameAdvanceCounter = 0;
          insect.frameIndex = (insect.frameIndex + 1) % insect.frameCount;
        }
        if (this.frames % (this.prefersReducedMotion ? 24 : 6) === 0) {
          this.createTrailParticle(insect);
        }
      }
      next.push(insect);
    }
    this.insects = next;
  }
  private advanceScorePopups(): void {
    const next: ScorePopup[] = [];
    for (let i = 0; i < this.scorePopups.length; i++) { const popup = this.scorePopups[i];
      popup.y -= 1.5;
      popup.scale = 1.3 - (popup.life / popup.maxLife) * 0.4;
      popup.life++;
      if (popup.life < popup.maxLife) {
        next.push(popup);
      }
    }
    this.scorePopups = next;
  }
   private draw(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    const isFeverMode = this.callbacks.getIsFeverMode();
    // Clear with dark background (no distracting images)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.filter = "none";
    const laneWidth = this.canvas.width / this.config.laneCount;
    const strikeZoneY = this.canvas.height - this.config.tileHeight;
    if (!isFeverMode) {
      // Base strike zone with pulsing glow
      const pulseAlpha = 0.05 + Math.sin(this.frames * 0.08) * 0.02;
      ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha})`;
      for (let i = 0; i < this.config.laneCount; i++) {
        ctx.fillRect(i * laneWidth, strikeZoneY, laneWidth, this.config.tileHeight);
      }
      for (let i = 0; i < this.insects.length; i++) { const insect = this.insects[i];
        if (insect.y > strikeZoneY - this.config.tileHeight && !insect.isHit) {
          const laneColor = GameEngine.LANE_COLORS[insect.lane % GameEngine.LANE_COLORS.length].replace('ALPHA', '0.15');
          ctx.fillStyle = laneColor;
          ctx.fillRect(insect.lane * laneWidth, strikeZoneY, laneWidth, this.config.tileHeight);
        }
      }
      // Draw strike line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, strikeZoneY);
      ctx.lineTo(this.canvas.width, strikeZoneY);
      ctx.stroke();
    }
    if (isFeverMode) {
      ctx.filter = "blur(1px) contrast(1.2)";
      const gradient = ctx.createRadialGradient(this.canvas.width/2, this.canvas.height/2, 0, this.canvas.width/2, this.canvas.height/2, this.canvas.height); gradient.addColorStop(0, `hsla(${this.hue}, 100%, 30%, 0.4)`); gradient.addColorStop(1, `hsla(${this.hue + 60}, 100%, 10%, 0.2)`); ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.filter = "none";
    }
    // Draw insects with lively wobble (not rotation)
    for (let i = 0; i < this.insects.length; i++) { const insect = this.insects[i];
      const img = insect.cachedImage;
      if (!img) continue;
      const size = this.config.tileHeight * (isFeverMode ? 1.2 : 0.8);
      const wobble = Math.sin(this.frames * 0.1 + insect.id) * 5;
      const shadowY = insect.y + this.config.tileHeight + 10;
      const shadowScale = Math.max(0.3, 1 - (insect.y / this.canvas.height) * 0.5);
      ctx.save();
      ctx.translate(insect.lane * laneWidth + laneWidth / 2, shadowY);
      ctx.scale(shadowScale, shadowScale * 0.3);
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();
      ctx.restore();
      ctx.save();
      // Position with slight horizontal wobble for "scurrying" effect
      const centerX = insect.lane * laneWidth + laneWidth / 2 + wobble;
      const centerY = insect.y + this.config.tileHeight / 2;
      ctx.translate(centerX, centerY);
      const pulse = 1 + Math.sin(this.frames * 0.15 + insect.id) * 0.05;
      ctx.scale(pulse, pulse);
      if (insect.isHit && insect.hitScale !== undefined) {
        ctx.scale(insect.hitScale, insect.hitScale);
        ctx.globalAlpha = Math.max(0, insect.hitAlpha || 1);
      }
      if (isFeverMode) {
        ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, 1)`;
      }
      const frameWidth = img.width / 8;
      const frameHeight = img.height / 4;
      const sx = insect.frameIndex * frameWidth;
      const sy = (insect.lane % 4) * frameHeight;
      ctx.drawImage(img, sx, sy, frameWidth, frameHeight, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
    for (let i = 0; i < this.powerUps.length; i++) { const powerUp = this.powerUps[i];
      const centerX = powerUp.lane * laneWidth + laneWidth / 2;
      const centerY = powerUp.y + this.config.tileHeight * 0.2;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(this.frames * 0.04);
      ctx.font = '42px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(powerUp.type === 'shield' ? '🛡️' : '🐌', 0, 0);
      ctx.restore();
    }
    for (let i = 0; i < this.psyEffects.length; i++) { const p = this.psyEffects[i];
      const progress = p.life / p.maxLife;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = 1 - progress;
      ctx.rotate(progress * Math.PI * 2);
      ctx.font = `${30 + progress * 50}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbols = ['🍄', '🌀', '🧠', '✨', '🐜'];
      ctx.fillText(symbols[Math.floor(p.hue % symbols.length)] ?? '✨', 0, 0);
      ctx.restore();
    }
    for (let i = 0; i < this.particles.length; i++) { const particle = this.particles[i];
      const alpha = 1 - particle.life / particle.maxLife;
      ctx.fillStyle = particle.color.replace('ALPHA', alpha.toFixed(2));
      ctx.fillRect(particle.x, particle.y, 3, 3);
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < this.scorePopups.length; i++) { const popup = this.scorePopups[i];
      const alpha = 1 - popup.life / popup.maxLife;
      ctx.save();
      ctx.translate(popup.x, popup.y);
      ctx.scale(popup.scale, popup.scale);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = popup.color;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(popup.text, 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }
  handleTap(lane: number): void {
    if (!this.callbacks.getIsPlaying() || this.callbacks.getGameOver()) return;
    const tappedPowerUp = this.powerUps.find((powerUp) => powerUp.lane === lane);
    if (tappedPowerUp) {
      this.powerUps = this.powerUps.filter((powerUp) => powerUp.id !== tappedPowerUp.id);
      if (tappedPowerUp.type === 'shield') {
        this.callbacks.activateShield();
      } else {
        this.callbacks.activateSlowMo(5000);
      }
      this.createExplosion(lane, tappedPowerUp.y, 'rgba(130,255,255,ALPHA)');
      if (this.callbacks.getSoundEnabled()) {
        this.callbacks.playTapSound(true, lane);
      }
      return;
    }
    const topInsect = findTopTargetInLane(this.insects, lane);
    if (!topInsect) {
      triggerHaptic([30, 30, 30]); this.callbacks.recordMiss();
      return;
    }
    const hitInsect = this.insects.find((ins) => ins.id === topInsect.id);
    if (hitInsect) {
      hitInsect.isHit = true;
      hitInsect.hitScale = 1.3;
      hitInsect.hitAlpha = 1;
    }
    triggerHaptic(10); const comboMultiplier = this.callbacks.recordHit();
    const baseScore = this.callbacks.getIsFeverMode() ? 200 : 100;
    const totalScore = baseScore * comboMultiplier;
    this.callbacks.addScore(totalScore);
    this.shake = this.callbacks.getIsFeverMode() ? 15 : 5;
    const hitX = topInsect.lane * (this.canvas.width / this.config.laneCount) + this.canvas.width / this.config.laneCount / 2;
    const hitY = topInsect.y + this.config.tileHeight / 2;
    this.createPsyEffect(hitX, hitY);
    this.createExplosion(lane, topInsect.y, this.callbacks.getIsFeverMode() ? 'rgba(255,70,200,ALPHA)' : 'rgba(255,220,80,ALPHA)');
    this.createScorePopup(hitX, hitY, totalScore, comboMultiplier);
    if (this.callbacks.getSoundEnabled()) {
      this.callbacks.playTapSound(this.callbacks.getIsFeverMode(), lane);
    }
  }
  private createPsyEffect(x: number, y: number): void {
    this.psyEffects.push({
      x,
      y,
      life: 0,
      maxLife: 30,
      hue: Math.random() * 360,
    });
  }
  private createExplosion(lane: number, y: number, color: string): void {
    const laneWidth = this.canvas.width / this.config.laneCount;
    const centerX = lane * laneWidth + laneWidth / 2;
    const centerY = y + this.config.tileHeight * 0.4;
    const laneColor = GameEngine.LANE_COLORS[lane % GameEngine.LANE_COLORS.length];
    for (let i = 0; i < (this.prefersReducedMotion ? 4 : 16); i++) {
      const angle = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
      const speed = 1.5 + Math.random() * 3;
      const useLaneColor = Math.random() > 0.3;
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 20 + Math.random() * 10,
        color: useLaneColor ? laneColor : color,
      });
    }
  }
  private createTrailParticle(insect: Insect): void {
    const laneWidth = this.canvas.width / this.config.laneCount;
    const centerX = insect.lane * laneWidth + laneWidth / 2;
    const laneColor = GameEngine.LANE_COLORS[insect.lane % GameEngine.LANE_COLORS.length];
    this.particles.push({
      x: centerX + (Math.random() - 0.5) * 20,
      y: insect.y + this.config.tileHeight * 0.8,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.3 + Math.random() * 0.5,
      life: 0,
      maxLife: 12,
      color: laneColor,
    });
  }
  private createScorePopup(x: number, y: number, points: number, combo: number): void {
    let color = '#fff';
    let text = `+${points}`;
    if (combo >= 3) {
      color = '#ffd700'; // Gold for combo
      text = `${points} x${combo}`;
    }
    if (this.callbacks.getIsFeverMode()) {
      color = '#ff46c8'; // Fever pink
      text = `${points} FEVER!`;
    }
    this.scorePopups.push({
      x,
      y,
      text,
      life: 0,
      maxLife: 40,
      scale: 1.3,
      color,
    });
  }
}
