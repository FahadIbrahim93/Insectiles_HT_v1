export interface FallingInsect {
  y: number;
  speed: number;
}

export interface PsyEffectLike {
  life: number;
  maxLife: number;
}

export const updateScreenShake = (currentShake: number, isFeverMode: boolean, frames: number): number => {
  let nextShake = currentShake;
  if (nextShake > 0) nextShake *= 0.85;
  if (nextShake < 0.1) nextShake = 0;
  if (isFeverMode && frames % 8 === 0) nextShake = 18;
  return nextShake;
};

export const advancePsyEffects = <T extends PsyEffectLike>(effects: T[]): T[] => {
  const next: T[] = [];
  for (const effect of effects) {
    if (effect.life + 1 < effect.maxLife) {
      next.push({ ...effect, life: effect.life + 1 });
    }
  }
  return next;
};

export const moveInsects = <T extends FallingInsect>(
  insects: T[],
  canvasHeight: number,
  isFeverMode: boolean,
  tileHeight: number,
  speedMultiplier = 1
): { insects: T[]; reachedBottom: boolean } => {
  let reachedBottom = false;
  const moved: T[] = [];

  for (const insect of insects) {
    const nextY = insect.y + insect.speed * speedMultiplier;

    if (nextY > canvasHeight) {
      if (!isFeverMode) {
        reachedBottom = true;
        moved.push({ ...insect, y: nextY });
      } else {
        moved.push({ ...insect, y: -tileHeight });
      }
    } else {
      moved.push({ ...insect, y: nextY });
    }
  }

  return { insects: moved, reachedBottom };
};
