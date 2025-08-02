import { CreateUrlSchema } from '@/types/validators/Url.js';
import { failure } from '@/views/json/failure.js';
import { success } from '@/views/json/success.js';
import { Hono } from 'hono';
import { LogDomain, logger } from '@/utils/logger.js';
import { DatabaseError } from '@/errors/DatabaseError.js';
import { ScrapingService } from '@/services/ScrapingService.js';
import { RedisService } from '@/services/RedisService.js';

const scrape = new Hono();

scrape.post('/', async (c) => {
  let url;
  // First, we try to parse the body of the request
  try {
    const body = await c.req.json();
    const parsedBody = CreateUrlSchema.parse(body);
    url = parsedBody.url;
  } catch (err) {
    logger.error([LogDomain.ROUTE], 'Error parsing request body', { error: err });
    return failure(err);
  }
  // Then we try to scrape the house and return the job
  const scrapingJob = await ScrapingService.createHouseScrapingJob(url);
  if (!scrapingJob) {
    return failure(
      new DatabaseError(
        'Unique Constraint Error',
        'A house with this URL already exists'
      )
    );
  }
  return success(202, {
    message: 'Job queued successfully',
    jobId: scrapingJob.id,
    status: 'queued',
  });
});

scrape.get('/jobs/house-scraping/:jobId', async (c) => {
  const jobId = c.req.param('jobId');
  const response = await RedisService.get(jobId);
  if (!response) {
    logger.error([LogDomain.ROUTE], 'No result found for this job ID', { jobId });
    return failure(
      new DatabaseError('No Result Error', `No result found for this job ID: ${jobId}`)
    );
  }
  let result;
  try {
    result = JSON.parse(response);
  } catch (err) {
    return failure(err);
  }
  return success(200, result);
});

export default scrape;
