import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z
    .string({ message: 'Project\'s name must be a string.' })
    .min(1, { message: 'Project\'s must at least contain one character.' }),
  userId: z
    .string({ message: 'Project\'s user ID must be a string.' })
    .uuid({ message: 'Project\'s user ID must be a valid UUID.' }),
});

const SelectProjectSchema = z.object({
  id: z
    .string({ message: 'Project\'s ID must be a string.' })
    .uuid({ message: 'Project\'s ID must be a valid UUID.' }),
  name: z
    .string({ message: 'Project\'s name must be a string.' })
    .min(1, { message: 'Project\'s must at least contain one character.' }),
  userId: z
    .string({ message: 'Project\'s user ID must be a string.' })
    .uuid({ message: 'Project\'s user ID must be a valid UUID.' }),
});

const UpdateProjectSchema = z.object({});

export { CreateProjectSchema, SelectProjectSchema, UpdateProjectSchema };
