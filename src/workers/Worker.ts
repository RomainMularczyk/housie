import { LogDomain, logger } from '../utils/logger.js';
import { RabbitMQ } from '../database/queue/RabbitMQConnection.js';
import { QueueType } from '../types/Queue.d.js';
import { JobStatusType, type ScrapingJob } from '../types/Job.d.js';
import { ScrapingService } from '../services/ScrapingService.js';
import { RedisService } from '@/services/RedisService.js';

const RABBITMQ_CONNECTION_STRING = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

class Worker {
  public queue: RabbitMQ | null = null;
  public isRunning: boolean = false;

  /**
   * Start the worker.
   *
   * @returns {Promise<void>} A promise that resolves when the worker is started.
   */
  async start(): Promise<void> {
    this.isRunning = true;
    logger.info(
      [LogDomain.WORKER],
      `Attempting to start in environment ${process.env.NODE_ENV}`
    );
    await this.run();
  }

  /**
   * Run the worker.
   *
   * @returns {Promise<void>} A promise that resolves when the worker is running.
   */
  async run(): Promise<void> {
    this.queue = new RabbitMQ();
    // Create a channel for the worker (set isWorker to true)
    await this.queue.createChannel(RABBITMQ_CONNECTION_STRING);
    logger.info([LogDomain.WORKER], 'Worker started successfully');
    await this.queue.consume(
      QueueType.HOUSE_SCRAPING,
      async (msg) => {
        if (msg) {
          try {
            const job = JSON.parse(msg.content.toString());
            await this.processJob(job);
            this.queue?.ack(msg);
          } catch (error) {
            logger.error([LogDomain.WORKER], 'Error processing message', { error });
            this.queue?.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );
  }

  /**
   * Shutdown the worker.
   *
   * @returns {void} A promise that resolves when the worker is stopped.
   */
  shutdown(): void {
    const exit = async (signal: string) => {
      logger.info([LogDomain.WORKER], `Received ${signal}, shutting down...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', () => exit('SIGINT'));
    process.on('SIGTERM', () => exit('SIGTERM'));
  }

  /**
   * Process a scraping job.
   *
   * @param {ScrapingJob} job - The scraping job to process.
   * @returns {Promise<void>} A promise that resolves when the job is processed.
   */
  async processJob(job: ScrapingJob): Promise<void> {
    logger.info([LogDomain.WORKER], 'Processing job...', { job });
    let house;
    try {
      house = await ScrapingService.scrapeHouse(job);
    } catch (err) {
      logger.error([LogDomain.WORKER], 'Error when scraping house', { error: err });
      const jobStatus = {
        id: job.id,
        status: JobStatusType.ERROR,
        updatedAt: new Date(),
      };
      await RedisService.set(job.id, JSON.stringify(jobStatus));
      return;
    }
    try {
      const storedHouse = await ScrapingService.storeHouse(house);
      logger.info([LogDomain.WORKER], 'House storred successfully', {
        details: storedHouse,
      });
    } catch (err) {
      logger.error([LogDomain.WORKER], 'Error when storing house', { error: err });
      const jobStatus = {
        id: job.id,
        status: JobStatusType.ERROR,
        updatedAt: new Date(),
      };
      await RedisService.set(job.id, JSON.stringify(jobStatus));
      return;
    }
    const jobStatus = {
      id: job.id,
      status: JobStatusType.SUCCESS,
      updatedAt: new Date(),
    };
    await RedisService.set(job.id, JSON.stringify(jobStatus));
    logger.info([LogDomain.WORKER], 'Job processed successfully', { jobStatus });
  }

  /**
   * Stop the worker.
   *
   * @returns {Promise<void>} A promise that resolves when the worker is stopped.
   */
  private async stop(): Promise<void> {
    this.isRunning = false;
    await this.queue?.closeChannel();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new Worker();
  try {
    await worker.start();
  } catch (err) {
    logger.error([LogDomain.WORKER], 'Error when starting the worker.', { error: err });
    process.exit(1);
  }

  process.on('SIGINT', () => {
    logger.info([LogDomain.WORKER], 'SIGINT received, shutting down...');
    worker.shutdown();
    process.exit(0);
  });
}

export { Worker };
