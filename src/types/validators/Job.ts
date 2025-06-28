import { z } from 'zod';

const CreateScrapingJobSchema = z.object({
  jobId: z.string(),
  url: z.string(),
  promptId: z.string(),
  userId: z.string(),
  retryCount: z.number(),
  maxRetries: z.number(),
  createdAt: z.date(),
});

export { CreateScrapingJobSchema };