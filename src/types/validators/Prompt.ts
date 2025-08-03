import { z } from 'zod';

const CreatePromptSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  prompt: z.string().min(10),
  active: z
    .boolean()
    .default(true)
    .transform((data) => (data === true ? 1 : 0)),
  createdAt: z
    .date({ message: 'Prompt\'s creation date must be a valid date.' })
    .default(new Date()),
  updatedAt: z
    .date({ message: 'Prompt\'s updated date must be a valid date.' })
    .default(new Date()),
  projectId: z.string(),
});

const SelectPromptSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().min(1).nullable(),
  prompt: z.string().min(10),
  active: z
    .union([z.string(), z.number()])
    .transform((data) => (data === 0 ? false : true)),
  createdAt: z
    .number({ message: 'Prompt\'s creation date must be a valid date.' })
    .transform((date) => new Date(date)),
  updatedAt: z
    .number({ message: 'Prompt\'s updated date must be a valid date.' })
    .transform((date) => new Date(date)),
  projectId: z.string(),
});

const UpdatePromptSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1).nullable(),
    prompt: z.string().min(10),
    active: z.boolean().transform((data) => (data === true ? 1 : 0)),
    createdAt: z.date(),
    updatedAt: z.date().transform((date) => new Date(date)),
    projectId: z.string(),
  })
  .partial();

export { CreatePromptSchema, SelectPromptSchema, UpdatePromptSchema };
