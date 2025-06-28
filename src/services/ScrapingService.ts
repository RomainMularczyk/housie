import { RabbitMQ } from '@/database/queue/RabbitMQConnection.js';
import HouseRepository from '@/repositories/HouseRepository.js';
import {
  type JobStatus,
  type ScrapingJob,
  JobStatusType,
  ScrapingJobType,
} from '@/types/Job.d.js';
import { QueueType } from '@/types/Queue.d.js';
import { LogDomain, logger } from '@/utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from './RedisService.js';
import { House, ScrapedHouse } from '@/types/House.js';
import { PromptRepository } from '@/repositories/PromptRepository.js';
import { LlmScrape } from '@/scrapers/llm/index.js';
import { HousePostScraper } from '@/scrapers/llm/HousePostScraper.js';
import { ScrapingError } from '@/errors/ScrapingError.js';
import { CreateHouseSchema } from '@/types/validators/House.js';

class ScrapingService {
  /**
   * Create a scraping house job.
   *
   * @param {string} url The url of the house to scrape.
   * @returns {Promise<ScrapingJob | undefined>} The scraping job.
   */
  public static async createHouseScrapingJob(
    url: string
  ): Promise<ScrapingJob | undefined> {
    try {
      await HouseRepository.findOneBy({
        key: 'url',
        searchQuery: url,
      });
      logger.warn([LogDomain.SERVICE], 'House already exists');
      return;
      // If we can't find a house, we need to scrape it
    } catch (_) {
      const scrapingJob = {
        id: `scrape-${uuidv4()}`,
        type: ScrapingJobType.HOUSE_SCRAPING,
        url: url,
        createdAt: new Date(),
      };

      const queue = new RabbitMQ();
      await queue.createChannel();
      queue.sendToQueue(QueueType.HOUSE_SCRAPING, scrapingJob);

      const jobStatus: JobStatus = {
        id: scrapingJob.id,
        status: JobStatusType.QUEUED,
        updatedAt: new Date(),
      };
      await RedisService.set(scrapingJob.id, JSON.stringify(jobStatus));

      logger.info([LogDomain.SERVICE], 'Job sent to queue', { jobId: scrapingJob.id });

      return scrapingJob;
    }
  }

  /**
   * Scrape a house.
   *
   * @param {ScrapingJob} job The scraping job.
   * @returns {Promise<House>} The scraped house.
   * @throws {ScrapingError} If an error occurs during the scraping process.
   */
  public static async scrapeHouse(
    job: ScrapingJob
  ): Promise<ScrapedHouse & { url: string }> {
    let activePrompt;
    try {
      activePrompt = await PromptRepository.readActive();
    } catch (err) {
      logger.error([LogDomain.SERVICE], 'Error when reading the active prompt', {
        error: err,
      });
      throw new ScrapingError(
        'Active Prompt Error',
        'Could not read the active prompt',
        err
      );
    }

    const jobStatus = {
      id: job.id,
      status: JobStatusType.PROCESSING,
      updatedAt: new Date(),
    };
    await RedisService.set(job.id, JSON.stringify(jobStatus));
    logger.info([LogDomain.SERVICE], 'Processing scraping job', { jobStatus });

    let result;
    try {
      result = await LlmScrape(HousePostScraper, job.url, activePrompt.prompt);
    } catch (err) {
      logger.error([LogDomain.SERVICE], 'Error when scraping house', {
        error: err,
      });
      throw new ScrapingError('Unknown Error', 'Scraping timed out', err);
    }
    return result;
  }

  /**
   * Store a scraped house in the database.
   *
   * @param {ScrapedHouse} scrapedHouse - The scraped house.
   * @returns {Promise<House>} The stored house.
   * @throws {DatabaseError} If an error occurs during the database operation.
   */
  public static async storeHouse(scrapedHouse: ScrapedHouse): Promise<House> {
    const house = CreateHouseSchema.parse(scrapedHouse);
    const result = await HouseRepository.create(house);
    return result;
  }
}

export { ScrapingService };
