import test from 'node:test';
import assert from 'node:assert/strict';
import { FEVER_THRESHOLD, HIGHSCORE_KEY, readPersistedHighScore, useGameStore } from '../src/store/useGameStore';

const resetStore = () => {
  localStorage.clear();
  useGameStore.setState({
    score: 0,
    highScore: 0,
    gameOver: false,
    isPlaying: false,
    isFeverMode: false,
    feverProgress: 0,
  });
};

test('readPersistedHighScore clamps invalid values', () => {
  localStorage.setItem(HIGHSCORE_KEY, 'not-a-number');
  assert.equal(readPersistedHighScore(), 0);

  localStorage.setItem(HIGHSCORE_KEY, '-42');
  assert.equal(readPersistedHighScore(), 0);

  localStorage.setItem(HIGHSCORE_KEY, '143.8');
  assert.equal(readPersistedHighScore(), 143);
});

test('readPersistedHighScore returns 0 when key is missing', () => {
  localStorage.removeItem(HIGHSCORE_KEY);
  assert.equal(readPersistedHighScore(), 0);
});

test('startGame initializes playable defaults', () => {
  resetStore();
  useGameStore.getState().startGame();
  const state = useGameStore.getState();

  assert.equal(state.isPlaying, true);
  assert.equal(state.gameOver, false);
  assert.equal(state.score, 0);
  assert.equal(state.isFeverMode, false);
  assert.equal(state.feverProgress, 0);
});

test('addScore updates score/high score and persists to localStorage', () => {
  resetStore();
  useGameStore.getState().addScore(120);

  let state = useGameStore.getState();
  assert.equal(state.score, 120);
  assert.equal(state.highScore, 120);
  assert.equal(localStorage.getItem(HIGHSCORE_KEY), '120');

  useGameStore.getState().addScore(10);
  state = useGameStore.getState();

  assert.equal(state.score, 130);
  assert.equal(state.highScore, 130);
  assert.equal(localStorage.getItem(HIGHSCORE_KEY), '130');
});

test('addScore does not lower persisted high score', () => {
  resetStore();
  localStorage.setItem(HIGHSCORE_KEY, '250');
  useGameStore.setState({ highScore: 250 });
  useGameStore.getState().addScore(120);

  assert.equal(useGameStore.getState().highScore, 250);
  assert.equal(localStorage.getItem(HIGHSCORE_KEY), '250');
});

test('fever progress is capped at 1', () => {
  resetStore();
  useGameStore.getState().addScore(FEVER_THRESHOLD * 2);
  assert.equal(useGameStore.getState().feverProgress, 1);
});

test('setGameOver toggles play state off on game over', () => {
  resetStore();
  useGameStore.getState().startGame();
  useGameStore.getState().setGameOver(true);

  const state = useGameStore.getState();
  assert.equal(state.gameOver, true);
  assert.equal(state.isPlaying, false);
});

test('setGameOver false preserves current playing state', () => {
  resetStore();
  useGameStore.getState().setGameOver(false);
  let state = useGameStore.getState();
  assert.equal(state.gameOver, false);
  assert.equal(state.isPlaying, false);

  useGameStore.getState().startGame();
  useGameStore.getState().setGameOver(false);
  state = useGameStore.getState();
  assert.equal(state.gameOver, false);
  assert.equal(state.isPlaying, true);
});

test('setFeverMode updates fever state', () => {
  resetStore();
  useGameStore.getState().setFeverMode(true);
  assert.equal(useGameStore.getState().isFeverMode, true);

  useGameStore.getState().setFeverMode(false);
  assert.equal(useGameStore.getState().isFeverMode, false);
});

test('resetGame clears active game state', () => {
  resetStore();
  useGameStore.getState().startGame();
  useGameStore.getState().addScore(300);
  useGameStore.getState().setFeverMode(true);
  useGameStore.getState().resetGame();

  const state = useGameStore.getState();
  assert.equal(state.score, 0);
  assert.equal(state.gameOver, false);
  assert.equal(state.isPlaying, false);
  assert.equal(state.isFeverMode, false);
  assert.equal(state.feverProgress, 0);
});

test('subscribe emits when state updates', () => {
  resetStore();
  let called = 0;
  const unsubscribe = useGameStore.subscribe(() => {
    called += 1;
  });

  useGameStore.getState().startGame();
  useGameStore.getState().addScore(10);
  unsubscribe();
  useGameStore.getState().addScore(10);

  assert.equal(called, 2);
});


test('addScore ignores non-finite and non-positive values', () => {
  resetStore();
  useGameStore.getState().startGame();
  useGameStore.getState().addScore(10);
  useGameStore.getState().addScore(-4);
  useGameStore.getState().addScore(0);
  useGameStore.getState().addScore(Number.NaN);

  const state = useGameStore.getState();
  assert.equal(state.score, 10);
  assert.equal(state.highScore, 10);
});

test('addScore floors fractional points to integer increments', () => {
  resetStore();
  useGameStore.getState().addScore(12.9);
  assert.equal(useGameStore.getState().score, 12);
});
