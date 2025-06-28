import { Client, createClient } from '@libsql/client';
import { LogDomain, logger } from '../logger.js';
import dotenv from 'dotenv';
dotenv.config();

class Connect {
  /**
   * Get the URL of the RabbitMQ server.
   *
   * @returns {string} The URL of the RabbitMQ server.
   */
  public static getRabbitMQUrl = (): string => {
    const isProd = process.env.NODE_ENV === 'production';
    return isProd
      ? process.env.RABBITMQ_INTERNAL_URL
      : process.env.RABBITMQ_EXTERNAL_URL;
  };

  /**
   * Connect to the turso database.
   *
   * @returns {Client} A client to the turso database.
   */
  public static toTursoDatabase = (): Client => {
    if (!process.env.TURSO_DATABASE_URL) {
      logger.error([LogDomain.DATABASE], 'No turso database URL provided');
    }

    const turso = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    logger.info([LogDomain.DATABASE], 'Connected to Turso database successfully');

    return turso;
  };
}

export { Connect };

