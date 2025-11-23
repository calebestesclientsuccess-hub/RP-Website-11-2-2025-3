/**
 * In-memory Redis mock for testing
 * Simulates basic Redis operations with TTL support
 */

type RedisValue = string | number | Buffer;
type RedisData = Map<string, { value: RedisValue; expiry?: number }>;

export class RedisMock {
  private data: RedisData = new Map();
  private subscribers: Map<string, Set<(...args: any[]) => void>> = new Map();

  async get(key: string): Promise<string | null> {
    const item = this.data.get(key);
    if (!item) return null;
    
    if (item.expiry && item.expiry < Date.now()) {
      this.data.delete(key);
      return null;
    }
    
    return String(item.value);
  }

  async set(
    key: string,
    value: RedisValue,
    mode?: string,
    duration?: number,
    option?: string
  ): Promise<'OK'> {
    let expiry: number | undefined;
    
    if (mode === 'EX' && typeof duration === 'number') {
      expiry = Date.now() + duration * 1000;
    } else if (mode === 'PX' && typeof duration === 'number') {
      expiry = Date.now() + duration;
    }
    
    this.data.set(key, { value, expiry });
    return 'OK';
  }

  async setex(key: string, seconds: number, value: RedisValue): Promise<'OK'> {
    return this.set(key, value, 'EX', seconds);
  }

  async psetex(key: string, milliseconds: number, value: RedisValue): Promise<'OK'> {
    return this.set(key, value, 'PX', milliseconds);
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.data.delete(key)) count++;
    }
    return count;
  }

  async exists(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.data.has(key)) count++;
    }
    return count;
  }

  async incr(key: string): Promise<number> {
    const item = this.data.get(key);
    const current = item ? Number(item.value) || 0 : 0;
    const newValue = current + 1;
    this.data.set(key, { value: newValue, expiry: item?.expiry });
    return newValue;
  }

  async incrby(key: string, increment: number): Promise<number> {
    const item = this.data.get(key);
    const current = item ? Number(item.value) || 0 : 0;
    const newValue = current + increment;
    this.data.set(key, { value: newValue, expiry: item?.expiry });
    return newValue;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.data.get(key);
    if (!item) return 0;
    
    item.expiry = Date.now() + seconds * 1000;
    return 1;
  }

  async pexpire(key: string, milliseconds: number): Promise<number> {
    const item = this.data.get(key);
    if (!item) return 0;
    
    item.expiry = Date.now() + milliseconds;
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const item = this.data.get(key);
    if (!item) return -2;
    if (!item.expiry) return -1;
    
    const remaining = Math.ceil((item.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async pttl(key: string): Promise<number> {
    const item = this.data.get(key);
    if (!item) return -2;
    if (!item.expiry) return -1;
    
    const remaining = item.expiry - Date.now();
    return remaining > 0 ? remaining : -2;
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return Array.from(this.data.keys()).filter((key) => regex.test(key));
  }

  async flushdb(): Promise<'OK'> {
    this.data.clear();
    return 'OK';
  }

  async flushall(): Promise<'OK'> {
    return this.flushdb();
  }

  // Pub/Sub support
  async publish(channel: string, message: string): Promise<number> {
    const handlers = this.subscribers.get(channel);
    if (!handlers) return 0;
    
    handlers.forEach((handler) => handler('message', channel, message));
    return handlers.size;
  }

  subscribe(channel: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      if (!this.subscribers.has(channel)) {
        this.subscribers.set(channel, new Set());
      }
      this.subscribers.get(channel)!.add(callback);
    }
  }

  unsubscribe(channel?: string): void {
    if (channel) {
      this.subscribers.delete(channel);
    } else {
      this.subscribers.clear();
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    // Event emitter compatibility for ioredis
  }

  // Utility for testing
  clear(): void {
    this.data.clear();
    this.subscribers.clear();
  }

  // Simulate connection for ioredis compatibility
  connect(): Promise<void> {
    return Promise.resolve();
  }

  disconnect(): void {
    // noop
  }

  quit(): Promise<'OK'> {
    this.disconnect();
    return Promise.resolve('OK');
  }
}

export const mockRedis = new RedisMock();

