import { calculateGameSpeed, calculateSpawnInterval, shouldActivateFeverMode } from '../utils/gameRules';
import { advancePsyEffects, moveInsects, updateScreenShake } from '../utils/loop';
import { findTopTargetInLane } from '../utils/gameplay';

export interface Insect {
  id: number;
  lane: number;
  y: number;
  spriteIndex: number;
  speed: number;
  isFeverTarget?: boolean;
  cachedImage?: HTMLImageElement;
}

export interface PsyEffect {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  hue: number;
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
  setFeverMode: (active: boolean) => void;
  addScore: (points: number) => void;
  setGameOver: (over: boolean) => void;
  playFeverActivation: () => void;
  playTapSound: (isFever: boolean) => void;
  playErrorSound: () => void;
  stopBgm: () => void;
}

export class GameEngine {
  private config: GameEngineConfig;
  private callbacks: EngineCallbacks;
  private canvas: HTMLCanvasElement;
  private images: HTMLImageElement[];
  
  private insects: Insect[] = [];
  private psyEffects: PsyEffect[] = [];
  private speed: number;
  private frames: number = 0;
  private lastSpawnFrame: number = 0;
  private hue: number = 0;
  private insectIdCounter: number = 0;
  private bgIndex: number;
  private shake: number = 0;
  
  private requestRef: number | undefined = undefined;
  private isRunning: boolean = false;
  
  constructor(
    canvas: HTMLCanvasElement,
    images: HTMLImageElement[],
    config: GameEngineConfig,
    callbacks: EngineCallbacks
  ) {
    this.canvas = canvas;
    this.images = images;
    this.config = config;
    this.callbacks = callbacks;
    this.speed = config.initialSpeed;
    this.bgIndex = Math.floor(Math.random() * 4) + 4;
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
    this.psyEffects = [];
    this.speed = this.config.initialSpeed;
    this.frames = 0;
    this.lastSpawnFrame = 0;
    this.hue = 0;
    this.insectIdCounter = 0;
    this.bgIndex = Math.floor(Math.random() * 4) + 4;
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
    
    this.shake = updateScreenShake(this.shake, isFeverMode, this.frames);
    
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
    
    const moved = moveInsects(
      this.insects,
      this.canvas.height,
      isFeverMode,
      this.config.tileHeight
    );
    this.insects = moved.insects;
    
    if (moved.reachedBottom && !isFeverMode) {
      this.callbacks.setGameOver(true);
      this.callbacks.playErrorSound();
      this.callbacks.stopBgm();
    }
    
    this.psyEffects = advancePsyEffects(this.psyEffects);
    
    this.draw();
    
    this.requestRef = requestAnimationFrame(() => this.loop());
  }
  
  private spawnInsect(): void {
    const isFeverMode = this.callbacks.getIsFeverMode();
    const lane = Math.floor(Math.random() * this.config.laneCount);
    const spriteIndex = isFeverMode ? (Math.floor(Math.random() * 4) + 8) : Math.floor(Math.random() * 4);
    const cachedImage = this.images[spriteIndex];
    
    this.insects.push({
      id: this.insectIdCounter++,
      lane,
      y: -this.config.tileHeight,
      spriteIndex,
      speed: this.speed * (isFeverMode ? 1.5 : 1),
      isFeverTarget: isFeverMode,
      cachedImage,
    });
  }
  
  private draw(): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    
    const isFeverMode = this.callbacks.getIsFeverMode();
    
    ctx.save();
    if (this.shake > 0) {
      ctx.translate(Math.random() * this.shake, Math.random() * this.shake);
    }
    
    if (isFeverMode) {
      ctx.fillStyle = `hsla(${this.hue}, 80%, 20%, 1)`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      // Video overlay would go here if available
    } else {
      const bgImage = this.images[this.bgIndex];
      if (bgImage) {
        ctx.drawImage(bgImage, 0, 0, this.canvas.width, this.canvas.height);
      } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
    
    ctx.fillStyle = `hsla(${this.hue}, 50%, 50%, ${isFeverMode ? 0.3 : 0.1})`;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const laneWidth = this.canvas.width / this.config.laneCount;
    const intensity = isFeverMode;
    const currentHue = this.hue;
    const currentFrames = this.frames;
    
    for (const insect of this.insects) {
      const img = insect.cachedImage;
      if (img) {
        const size = this.config.tileHeight * (intensity ? 1.2 : 0.8);
        ctx.save();
        ctx.translate(insect.lane * laneWidth + laneWidth / 2, insect.y + this.config.tileHeight / 2);
        ctx.rotate(currentFrames * (intensity ? 0.2 : 0.05) * (insect.id % 2 === 0 ? 1 : -1));
        if (intensity) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = `hsla(${currentHue}, 100%, 50%, 1)`;
        }
        ctx.drawImage(img, -size/2, -size/2, size, size);
        ctx.restore();
      }
    }
    
    for (const p of this.psyEffects) {
      const progress = p.life / p.maxLife;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = 1 - progress;
      ctx.rotate(progress * Math.PI * 2);
      ctx.font = `${30 + progress * 50}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbols = ['🍄', '🌀', '🧠', '✨', '🐜'];
      ctx.fillText(symbols[Math.floor(p.hue % symbols.length)], 0, 0);
      ctx.restore();
    }
    
    ctx.restore();
  }
  
  handleTap(lane: number): void {
    if (!this.callbacks.getIsPlaying() || this.callbacks.getGameOver()) return;
    
    const topInsect = findTopTargetInLane(this.insects, lane);
    if (!topInsect) return;
    
    this.insects = this.insects.filter(ins => ins.id !== topInsect.id);
    this.callbacks.addScore(100); // Could use calculateHitScore like original
    this.shake = this.callbacks.getIsFeverMode() ? 15 : 5;
    this.createPsyEffect(
      topInsect.lane * (this.canvas.width / this.config.laneCount) + this.canvas.width / this.config.laneCount / 2,
      topInsect.y + this.config.tileHeight / 2
    );
    this.callbacks.playTapSound(this.callbacks.getIsFeverMode());
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
}
