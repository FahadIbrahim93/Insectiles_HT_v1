import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/useGameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it('should initialize with default values', () => {
    const state = useGameStore.getState();
    expect(state.score).toBe(0);
    expect(state.gameOver).toBe(false);
    expect(state.isPlaying).toBe(false);
  });

  it('should add score and update progress', () => {
    const { addScore } = useGameStore.getState();
    addScore(100);
    expect(useGameStore.getState().score).toBe(100);
    expect(useGameStore.getState().feverProgress).toBe(0.2);
  });

  it('should trigger fever mode at threshold', () => {
    const { addScore } = useGameStore.getState();
    // In our implementation, FEVER_THRESHOLD is 500
    // But store logic just tracks score, Game.tsx triggers setFeverMode
    addScore(500);
    expect(useGameStore.getState().feverProgress).toBe(1);
  });

  it('should handle game over', () => {
    const { setGameOver } = useGameStore.getState();
    setGameOver(true);
    expect(useGameStore.getState().gameOver).toBe(true);
    expect(useGameStore.getState().isPlaying).toBe(false);
  });
});
