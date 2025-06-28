import { z } from 'zod';

const CreateUrlSchema = z.object({
  url: z.string().min(10),
});

export { CreateUrlSchema };
