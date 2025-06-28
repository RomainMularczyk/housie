import amqp, { Channel, ChannelModel, Options, Replies } from 'amqplib';
import { LogDomain, logger } from '@/utils/logger.js';
import { QueueType } from '@/types/Queue.js';

const getRabbitMQUrl = (): string => {
  const isProd = process.env.NODE_ENV === 'production';
  return isProd ? process.env.RABBITMQ_INTERNAL_URL : process.env.RABBITMQ_EXTERNAL_URL;
};

class RabbitMQ {
  private channel: Channel | null = null;
  private connection: ChannelModel | null = null;

  /**
   * Create a new RabbitMQ connection.
   *
   * @param {string | undefined} host - The connection string to RabbitMQ.
   * @returns {Promise<void>} A promise that resolves when the connection with
   * RabbitMQ is established.
   */
  public async createChannel(host?: string): Promise<void> {
    this.connection = await amqp.connect(host || getRabbitMQUrl());
    logger.info([LogDomain.QUEUE], 'Connected successfully to RabbitMQ.');
    this.channel = await this.connection.createChannel();
  }

  /**
   * Close an existing RabbitMQ channel.
   *
   * @returns {Promise<void>} A promise that resolves when the channel
   * was closed properly.
   */
  public async closeChannel(): Promise<void> {
    this.channel?.close();
    logger.info([LogDomain.QUEUE], 'Closed channel properly.');
    this.connection = null;
  }

  /**
   * Send a message to a queue.
   *
   * @template T - The type of the message to send.
   * @param {QueueType} queue - The name of the queue to send the message to.
   * @param {T} message - The message to send.
   * @param {Options.Publish} [options] - Options for publishing the message.
   * @returns {Promise<void>} A promise that resolves when the message is sent.
   */
  public async sendToQueue<T>(
    queue: QueueType,
    message: T,
    options?: Options.Publish
  ): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');
    const msg = JSON.stringify(message);
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(msg), {
      persistent: true,
      ...options,
    });
  }

  /**
   * Consume messages from a queue.
   *
   * @template T - The type of the message to consume.
   * @param {QueueType} queue - The name of the queue to consume messages from.
   * @param {(msg: amqp.ConsumeMessage | null) => void} onMessage - The function to
   * call for each message.
   * @param {Options.Consume} [options] - Options for consuming messages.
   * @returns {Promise<Replies.Consume>} A promise that resolves when the
   * consumption is started.
   */
  public async consume(
    queue: QueueType,
    onMessage: (msg: amqp.ConsumeMessage | null) => void,
    options?: Options.Consume
  ): Promise<Replies.Consume> {
    if (!this.channel) throw new Error('Channel not initialized');
    this.channel.assertQueue(queue);
    return await this.channel.consume(queue, onMessage, options);
  }

  public async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}

export { RabbitMQ };
