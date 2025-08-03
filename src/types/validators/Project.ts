import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z
    .string({ message: 'Project\'s name must be a string.' })
    .min(1, { message: 'Project\'s must at least contain one character.' }),
  userId: z.string({ message: 'Project\'s user ID must be a string.' }),
  createdAt: z
    .date({ message: 'Project\'s creation date must be a valid date.' })
    .default(new Date()),
  updatedAt: z
    .date({ message: 'Project\'s updated date must be a valid date.' })
    .default(new Date()),
});

const SelectProjectSchema = z.object({
  id: z
    .string({ message: 'Project\'s ID must be a string.' })
    .uuid({ message: 'Project\'s ID must be a valid UUID.' }),
  name: z
    .string({ message: 'Project\'s name must be a string.' })
    .min(1, { message: 'Project\'s must at least contain one character.' }),
  userId: z.string({ message: 'Project\'s user ID must be a string.' }),
  createdAt: z
    .number({ message: 'Project\'s created at must be a valid date.' })
    .transform((date) => new Date(date)),
  updatedAt: z
    .number({ message: 'Project\'s updated at must be a valid date.' })
    .transform((data) => new Date(data)),
});

const SearchProjectSchema = z.object({
  id: z
    .string({ message: 'Project\'s ID must be a string.' })
    .uuid({ message: 'Project\'s ID must be a valid UUID.' }),
  name: z
    .string({ message: 'Project\'s name must be a string.' })
    .min(1, { message: 'Project\'s must at least contain one character.' }),
  userId: z.string({ message: 'Project\'s user ID must be a string.' }),
  createdAt: z
    .date({ message: 'Project\'s created at must be a valid date.' })
    .transform((date) => new Date(date).getTime()),
  updatedAt: z
    .date({ message: 'Project\'s updated at must be a valid date.' })
    .transform((date) => new Date(date).getTime()),
});

const UpdateProjectSchema = z
  .object({
    name: z
      .string({ message: 'Project\'s name must be a string.' })
      .min(1, { message: 'Project\'s must at least contain one character.' }),
    userId: z.string({ message: 'Project\'s user ID must be a string.' }),
    createdAt: z.date({ message: 'Project\'s creation date must be a valid date.' }),
    updatedAt: z
      .date({ message: 'Project\'s updated date must be a valid date.' })
      .transform((date) => new Date(date)),
  })
  .partial();

export {
  CreateProjectSchema,
  SelectProjectSchema,
  SearchProjectSchema,
  UpdateProjectSchema,
};
