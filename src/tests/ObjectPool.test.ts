import { describe, it, expect } from 'vitest';
import { ObjectPool } from '../engine/ObjectPool';

describe('ObjectPool', () => {
  it('should acquire objects and reuse them', () => {
    const pool = new ObjectPool<{ id: number }>(
      () => ({ id: Math.random() }),
      (obj) => { obj.id = 0; },
      2
    );

    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    expect(obj1).not.toBe(obj2);

    pool.release(obj1);
    const obj3 = pool.acquire();
    expect(obj3).toBe(obj1);
    expect(obj3.id).toBe(0);
  });
});
