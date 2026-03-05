import test from 'node:test';
import assert from 'node:assert/strict';
import { ASSET_PATHS, GAME_SETTINGS } from '../src/constants';

test('game settings include fever threshold and lane count', () => {
  assert.equal(GAME_SETTINGS.LANE_COUNT, 4);
  assert.equal(GAME_SETTINGS.FEVER_THRESHOLD, 500);
  assert.ok(GAME_SETTINGS.MAX_SPEED > GAME_SETTINGS.INITIAL_SPEED);
});

test('asset path registry includes required image groups and animation assets', () => {
  const imageKeys = Object.keys(ASSET_PATHS.IMAGES);
  assert.ok(imageKeys.length >= 12);
  assert.ok(imageKeys.some((key) => key.startsWith('BUG_')));
  assert.equal(Object.keys(ASSET_PATHS.ANIMATIONS).length, 2);
});
