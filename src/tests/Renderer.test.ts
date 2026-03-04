import { describe, it, expect } from 'vitest';
import { GameRenderer } from '../engine/Renderer';

describe('GameRenderer', () => {
  it('should exist as a static class', () => {
    expect(GameRenderer).toBeDefined();
    expect(typeof GameRenderer.drawBackground).toBe('function');
  });
});
