import { Redis } from '@/database/kv/RedisConnection.js';

class RedisService {
  /**
   * Get a value from Redis.
   *
   * @param {string} key The key to get the value from.
   * @returns {Promise<string | null>} The value.
   */
  public static async get(key: string): Promise<string | null> {
    const redis = new Redis();
    await redis.connect();
    return await redis.get(key);
  }

  /**
   * Set a value in Redis.
   *
   * @param {string} key The key to set the value for.
   * @param {string} value The value to set.
   * @returns {Promise<"OK">} The status.
   */
  public static async set(key: string, value: string): Promise<string | null> {
    const redis = new Redis();
    await redis.connect();
    return await redis.set(key, value);
  }
}

export { RedisService };
