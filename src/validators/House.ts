import { z } from 'zod';

const CreateHouseSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  size: z.number(),
  rooms: z.number(),
  dpe: z.string().max(1),
  address: z.string(),
  url: z.string(),
});

const SelectHouseSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  size: z.number(),
  rooms: z.number(),
  dpe: z.string().max(1),
  address: z.string(),
  url: z.string(),
});

const ParserHouseSchema = z.object({
  price: z.number(),
  size: z.number(),
  rooms: z.number(),
  dpe: z.string(),
});

export { CreateHouseSchema, SelectHouseSchema, ParserHouseSchema };
