import test from 'node:test';
import assert from 'node:assert/strict';
import { ASSET_PATHS, GAME_SETTINGS } from '../src/constants';

test('game settings include fever threshold and lane count', () => {
  assert.equal(GAME_SETTINGS.LANE_COUNT, 4);
  assert.equal(GAME_SETTINGS.FEVER_THRESHOLD, 500);
  assert.ok(GAME_SETTINGS.MAX_SPEED > GAME_SETTINGS.INITIAL_SPEED);
});

test('asset path registry includes bug sprites and expected minimum totals', () => {
  assert.ok(Object.keys(ASSET_PATHS.IMAGES).length >= 17);
  assert.equal(Object.keys(ASSET_PATHS.ANIMATIONS).length, 2);
  assert.ok(ASSET_PATHS.IMAGES.BUG_1.endsWith('bug-1.png'));
  assert.ok(ASSET_PATHS.IMAGES.BUG_1_MULTIVIEW.endsWith('bug-1-multiview.png'));
});
