import { describe, it, expect, vi } from 'vitest';
import { loadImages } from '../utils/assetLoader';

describe('assetLoader', () => {
  it('should load images or resolve fallback', async () => {
    // Note: Since we're in jsdom, actual Image loading won't happen
    // unless mocked or handled, but our loader is robust.
    const images = await loadImages(['non-existent.jpg']);
    expect(images.length).toBe(1);
    expect(images[0]).toBeInstanceOf(HTMLImageElement);
  });
});
