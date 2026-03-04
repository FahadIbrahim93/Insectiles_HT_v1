import { GAME_SETTINGS } from '../constants';

export interface RenderableInsect {
  lane: number;
  y: number;
  spriteIndex: number;
  id: number;
}

export interface RenderableEffect {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  hue: number;
}

/**
 * GameRenderer handle high-performance canvas drawing.
 * Isolated from React state to maximize FPS and maintain clean modular boundaries.
 */
export class GameRenderer {
  public static drawBackground(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    isFeverMode: boolean,
    hue: number,
    bgImage?: HTMLImageElement,
    video?: HTMLVideoElement
  ) {
    // Optimization: avoid state changes if possible, but canvas clearing is necessary
    if (isFeverMode) {
      ctx.fillStyle = `hsla(${hue}, 80%, 20%, 1)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (video && !video.paused) {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
      }
    } else {
      if (bgImage) {
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Dynamic overlay based on current game hue
    ctx.fillStyle = `hsla(${hue}, 50%, 50%, ${isFeverMode ? 0.3 : 0.1})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  public static drawInsects(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    insects: RenderableInsect[],
    images: HTMLImageElement[],
    isFeverMode: boolean,
    hue: number,
    frames: number
  ) {
    const laneWidth = canvas.width / GAME_SETTINGS.LANE_COUNT;
    const tileHeight = GAME_SETTINGS.TILE_HEIGHT;

    for (const insect of insects) {
      const img = images[insect.spriteIndex];
      if (!img) continue;

      const size = tileHeight * (isFeverMode ? 1.2 : 0.8);
      ctx.save();
      ctx.translate(insect.lane * laneWidth + laneWidth / 2, insect.y + tileHeight / 2);

      // Wobble animation logic
      const rotation = frames * (isFeverMode ? 0.2 : 0.05) * (insect.id % 2 === 0 ? 1 : -1);
      ctx.rotate(rotation);

      if (isFeverMode) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = `hsla(${hue}, 100%, 50%, 1)`;
      }

      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    }
  }

  public static drawPsyEffects(
    ctx: CanvasRenderingContext2D,
    effects: RenderableEffect[]
  ) {
    const symbols = ['🍄', '🌀', '🧠', '✨', '🐜'];
    for (const p of effects) {
      const progress = p.life / p.maxLife;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = 1 - progress;
      ctx.rotate(progress * Math.PI * 2);
      ctx.font = `${30 + progress * 50}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbols[Math.floor(p.hue % symbols.length)], 0, 0);
      ctx.restore();
    }
  }
}
