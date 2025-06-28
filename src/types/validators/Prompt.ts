import { z } from 'zod';

const CreatePromptSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  prompt: z.string().min(10),
});

const SelectPromptSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  prompt: z.string().min(10),
  active: z.union([z.string(), z.number()])
    .transform((data) => data === 0 ? false : true),
});

const UpdatePromptSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  prompt: z.string().min(10),
  active: z.boolean()
    .transform((data) => data === true ? 1 : 0),
}).partial();

export { CreatePromptSchema, SelectPromptSchema, UpdatePromptSchema };
