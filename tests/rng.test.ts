import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeededRng, nextInt, normalizeRandom } from '../src/utils/rng';

test('createSeededRng returns deterministic sequence for same seed', () => {
  const a = createSeededRng(42);
  const b = createSeededRng(42);
  const seqA = [a(), a(), a(), a(), a()];
  const seqB = [b(), b(), b(), b(), b()];
  assert.deepEqual(seqA, seqB);
});

test('normalizeRandom clamps invalid and out-of-range values', () => {
  assert.equal(normalizeRandom(Number.NaN), 0);
  assert.equal(normalizeRandom(-1), 0);
  assert.equal(normalizeRandom(0), 0);
  assert.ok(normalizeRandom(1) < 1);
});

test('nextInt maps rng into bounded integer range', () => {
  const rng = () => 0.75;
  assert.equal(nextInt(rng, 4), 3);
  assert.equal(nextInt(rng, 1), 0);
  assert.equal(nextInt(rng, 0), 0);
});
