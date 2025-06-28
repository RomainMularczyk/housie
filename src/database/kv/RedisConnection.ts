import { DatabaseError } from '@/errors/DatabaseError.js';
import { createClient, RedisClientType } from 'redis';
import { logger, LogDomain } from '@/utils/logger.js';

const getRedisUrl = (): string => {
  const isProd = process.env.NODE_ENV === 'production';
  return isProd
    ? `redis://redis:${process.env.REDIS_PORT}`
    : `redis://localhost:${process.env.REDIS_PORT}`;
};

class Redis {
  public client: RedisClientType | null = null;

  /**
   * Connect to Redis.
   *
   * @param {string | undefined} host - The connection string to Redis.
   * @returns {Promise<void>} A promise that resolves when the connection with Redis
   * is established.
   */
  public connect = async (host?: string): Promise<void> => {
    this.client = createClient({
      url: host || getRedisUrl(),
    });

    this.client.on('error', (err) => {
      throw new DatabaseError('Connection Error', 'Could not connect to Redis.', err);
    });

    await this.client.connect();
    logger.info([LogDomain.DATABASE], 'Connected to Redis');
  };

  /**
   * Get a value from Redis.
   *
   * @param {string} key - The key to get the value from.
   * @returns {Promise<string | null>} The value.
   */
  public get = async (key: string): Promise<string | null> => {
    if (!this.client)
      throw new DatabaseError('Connection Error', 'The connection does not exist');
    return await this.client?.get(key);
  };

  /**
   * Set a value in Redis.
   *
   * @param {string} key - The key to set the value for.
   * @param {string} value - The value to set.
   * @returns {Promise<'OK' | null>} The status.
   */
  public set = async (key: string, value: string): Promise<string | null> => {
    if (!this.client)
      throw new DatabaseError('Connection Error', 'The connection does not exist');
    return await this.client.set(key, value);
  };
}

export { Redis };
