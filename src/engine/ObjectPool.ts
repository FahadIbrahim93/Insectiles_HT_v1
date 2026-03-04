export class ObjectPool<T> {
  private pool: T[] = [];
  private create: () => T;
  private reset: (obj: T) => void;

  constructor(create: () => T, reset: (obj: T) => void, initialSize = 10) {
    this.create = create;
    this.reset = reset;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.create());
    }
  }

  acquire(): T {
    const obj = this.pool.pop() || this.create();
    return obj;
  }

  release(obj: T) {
    this.reset(obj);
    this.pool.push(obj);
  }
}
