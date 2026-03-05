import test from 'node:test';
import assert from 'node:assert/strict';
import { FEVER_THRESHOLD, PERSIST_KEY, readPersistedState, useGameStore } from '../src/store/useGameStore';

const resetStore = () => {
  localStorage.clear();
  useGameStore.setState({
    score: 0,
    highScore: 0,
    gameOver: false,
    isPlaying: false,
    isFeverMode: false,
    feverProgress: 0,
    comboMultiplier: 1,
    comboStreak: 0,
    soundEnabled: true,
    shieldCharges: 0,
    slowMoUntil: 0,
    leaderboard: [],
  });
};

test('readPersistedState clamps invalid values', () => {
  localStorage.setItem(PERSIST_KEY, '{"highScore":"bad","soundEnabled":false}');
  const state = readPersistedState();
  assert.equal(state.highScore, 0);
  assert.equal(state.soundEnabled, false);
  assert.deepEqual(state.leaderboard, []);
});

test('startGame initializes playable defaults', () => {
  resetStore();
  useGameStore.getState().startGame();
  const state = useGameStore.getState();

  assert.equal(state.isPlaying, true);
  assert.equal(state.gameOver, false);
  assert.equal(state.score, 0);
  assert.equal(state.comboMultiplier, 1);
});

test('addScore updates score/high score and persists', () => {
  resetStore();
  useGameStore.getState().addScore(120);
  let state = useGameStore.getState();
  assert.equal(state.score, 120);
  assert.equal(state.highScore, 120);

  useGameStore.getState().addScore(10);
  state = useGameStore.getState();
  assert.equal(state.score, 130);
  assert.equal(state.highScore, 130);
  assert.ok(localStorage.getItem(PERSIST_KEY)?.includes('130'));
});

test('fever progress is capped at 1', () => {
  resetStore();
  useGameStore.getState().addScore(FEVER_THRESHOLD * 2);
  assert.equal(useGameStore.getState().feverProgress, 1);
});

test('combo multiplier increases every 4 streak hits and caps at x5', () => {
  resetStore();
  for (let i = 0; i < 20; i++) useGameStore.getState().recordHit();
  const state = useGameStore.getState();
  assert.equal(state.comboMultiplier, 5);
  assert.equal(state.comboStreak, 20);
});

test('recordMiss consumes shield before resetting combo', () => {
  resetStore();
  useGameStore.getState().activateShield();
  useGameStore.setState({ comboStreak: 6, comboMultiplier: 2 });
  useGameStore.getState().recordMiss();
  const state = useGameStore.getState();
  assert.equal(state.shieldCharges, 0);
  assert.equal(state.comboMultiplier, 2);
});

test('recordMiss resets combo when no shield exists', () => {
  resetStore();
  useGameStore.setState({ comboStreak: 6, comboMultiplier: 2 });
  useGameStore.getState().recordMiss();
  const state = useGameStore.getState();
  assert.equal(state.comboStreak, 0);
  assert.equal(state.comboMultiplier, 1);
});

test('slow-mo activation sets a future timestamp and active check responds', async () => {
  resetStore();
  useGameStore.getState().activateSlowMo(30);
  assert.equal(useGameStore.getState().isSlowMoActive(), true);
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(useGameStore.getState().isSlowMoActive(), false);
});

test('toggleSound flips the sound flag', () => {
  resetStore();
  useGameStore.getState().toggleSound();
  assert.equal(useGameStore.getState().soundEnabled, false);
  useGameStore.getState().toggleSound();
  assert.equal(useGameStore.getState().soundEnabled, true);
});

test('leaderboard stores top five scores in descending order', () => {
  resetStore();
  const scores = [60, 400, 10, 900, 200, 700, 300];
  scores.forEach((score) => useGameStore.getState().addLeaderboardScore(score));
  const sorted = useGameStore.getState().leaderboard.map((entry) => entry.score);
  assert.deepEqual(sorted, [900, 700, 400, 300, 200]);
});
