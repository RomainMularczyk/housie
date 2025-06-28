import amqp, { Channel, ChannelModel } from 'amqplib';
import { logger, LogDomain } from '@/utils/logger.js';
import { ScrapingJob } from '@/types/Job.js';
import { LlmScrape } from '@/scrapers/llm/index.js';
import { HousePostScraper } from '@/scrapers/llm/HousePostScraper.js';
import { PromptRepository } from '@/repositories/PromptRepository.js';
import HouseRepository from '@/repositories/HouseRepository.js';
import { CreateHouseSchema } from '@/types/validators/House.js';
import { House } from '@/types/House.js';
import { Connect } from '@/utils/connection/Connect.js';
import { RedisService } from '@/services/RedisService.js';
import { JobStatus } from '@/types/Job.js';

export class ScrapingWorker {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private queueName = 'scraping_queue';
  private isRunning = false;
  private concurrency = 3;

  constructor() {
    this.rabbitmqUrl = Connect.getRabbitMQUrl();
  }

  private rabbitmqUrl: string;

  async start(): Promise<void> {
    try {
      logger.info([LogDomain.WORKER], 'Starting scraping worker');

      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.prefetch(this.concurrency);

      this.setupGracefulShutdown();
      await this.consume();

      this.isRunning = true;
      logger.info([LogDomain.WORKER], 'Scraping worker started successfully', {
        queueName: this.queueName,
        concurrency: this.concurrency
      });

    } catch (error) {
      logger.error(
        [LogDomain.WORKER, LogDomain.ERROR],
        'Failed to start worker',
        { error },
      );
      throw error;
    }
  }

  private async consume(): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    await this.channel.consume(this.queueName, async (msg) => {
      if (!msg) return;

      const startTime = Date.now();
      let job: ScrapingJob | null = null;

      try {
        job = JSON.parse(msg.content.toString()) as ScrapingJob;

        logger.info([LogDomain.WORKER], 'Processing scraping job', {
          jobId: job.jobId,
          type: job.type,
          url: job.url
        });

        const result = await this.processJob(job);

        // Send result back if replyTo queue is specified
        if (msg.properties.replyTo) {
          const response = {
            status: 'success',
            jobId: job.jobId,
            result,
            processingTime: Date.now() - startTime
          };

          this.channel!.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            {
              correlationId: msg.properties.correlationId
            }
          );
        }

        this.channel!.ack(msg);

        const processingTime = Date.now() - startTime;
        logger.info([LogDomain.WORKER], 'Job completed successfully', {
          jobId: job.jobId,
          processingTime: `${processingTime}ms`
        });

      } catch (error) {
        logger.error([LogDomain.WORKER, LogDomain.ERROR], 'Job processing failed', {
          jobId: job?.jobId || 'unknown',
          error: error
        });

        // Send error back if replyTo queue is specified
        if (msg.properties.replyTo) {
          const response = {
            status: 'error',
            jobId: job?.jobId,
            error: error instanceof Error ? error.message : String(error)
          };

          this.channel!.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            {
              correlationId: msg.properties.correlationId
            }
          );
        }

        if (job && job.retryCount < job.maxRetries) {
          const retryJob = { ...job, retryCount: job.retryCount + 1 };
          await this.requeueJob(retryJob);
          this.channel!.ack(msg);
        } else {
          logger.error([LogDomain.WORKER], 'Job failed permanently', {
            jobId: job?.jobId,
            maxRetries: job?.maxRetries
          });
          this.channel!.ack(msg);
        }
      }
    });
  }

  private async processJob(job: ScrapingJob): Promise<House> {
    logger.debug(
      [LogDomain.WORKER],
      'Processing job',
      { jobId: job.id, type: job.type },
    );

    const jobStatus: JobStatus = {
      id: job.id,
      status: 'processing',
      startedAt: job.createdAt,
      updatedAt: new Date(),
    }
    RedisService.set(job.id, JSON.stringify(jobStatus));

    try {
      let result;
      switch (job.type) {
        case 'house-scraping':
          result = await this.processHouseScraping(job);
          // Emit success status
          jobEvents.emitJobUpdate({
            jobId: job.id,
            status: 'completed',
            result,
            timestamp: new Date().toISOString()
          });
          return result;
        default:
          throw new Error(`Unknown job type: ${job.type}`);
      }
    } catch (error) {
      // Emit error status
      jobEvents.emit('job-update', {
        jobId: job.jobId,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /*
   * Process a house scraping job
   * @param jScrapingJobob - The scraping job to process
   * @returns {Promise<House>} The stored house data.{} 
   */
  private async processHouseScraping(job: ScrapingJob): Promise<House> {
    try {
      const activePrompt = await PromptRepository.readActive();
      const result = await LlmScrape(HousePostScraper, job.url, activePrompt.prompt);
      const house = CreateHouseSchema.parse(result);
      const stored = await HouseRepository.create(house);

      logger.info([LogDomain.WORKER], 'House data stored successfully', {
        jobId: job.jobId,
        houseId: stored.id
      });

      return stored;
    } catch (error) {
      logger.error([LogDomain.WORKER, LogDomain.ERROR], 'House scraping failed', {
        jobId: job.jobId,
        url: job.url,
        error
      });
      throw error;
    }
  }

  private async requeueJob(job: ScrapingJob): Promise<void> {
    if (!this.channel) return;

    try {
      const message = JSON.stringify(job);
      this.channel.sendToQueue(
        this.queueName,
        Buffer.from(message),
        { persistent: true },
      );

      logger.info([LogDomain.WORKER], 'Job requeued for retry', {
        jobId: job.jobId,
        retryCount: job.retryCount
      });
    } catch (error) {
      logger.error([LogDomain.WORKER, LogDomain.ERROR], 'Failed to requeue job', {
        jobId: job.jobId,
        error
      });
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info([LogDomain.WORKER], `Received ${signal}, shutting down gracefully`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        this.connection = null;
      }

      logger.info([LogDomain.WORKER], 'Worker stopped successfully');
    } catch (error) {
      logger.error(
        [LogDomain.WORKER, LogDomain.ERROR],
        'Error stopping worker',
        { error },
      );
    }
  }

  isWorkerRunning(): boolean {
    return this.isRunning;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const worker = new ScrapingWorker();

  worker.start().catch((error) => {
    logger.error(
      [LogDomain.WORKER, LogDomain.ERROR],
      'Failed to start worker',
      { error },
    );
    process.exit(1);
  });
} 
