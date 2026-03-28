export type RandomFn = () => number;

export const normalizeRandom = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 0.999999999;
  return value;
};

export const createSeededRng = (seed: number): RandomFn => {
  let state = Math.floor(seed) >>> 0;
  if (state === 0) state = 0x6d2b79f5;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return normalizeRandom(((t ^ (t >>> 14)) >>> 0) / 4294967296);
  };
};

export const nextInt = (random: RandomFn, maxExclusive: number): number => {
  if (!Number.isFinite(maxExclusive) || maxExclusive <= 1) return 0;
  return Math.floor(normalizeRandom(random()) * maxExclusive);
};
