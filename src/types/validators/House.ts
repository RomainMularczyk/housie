import { z } from 'zod';

const CreateHouseSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  size: z.number(),
  city: z.string(),
  postCode: z.string(),
  rooms: z.number(),
  dpe: z.string().max(1).nullable()
    .transform((data) => data && data.length > 1 ? null : data),
  url: z.string(),
  isFavorite: z.boolean().default(false)
    .transform((data) => data === true ? 1 : 0),
  isArchived: z.boolean().default(false)
    .transform((data) => data === true ? 1 : 0),
  isHousiaPicked: z.boolean().default(false)
    .transform((data) => data === true ? 1 : 0),
  isUserPicked: z.boolean().default(true)
    .transform((data) => data === true ? 1 : 0),
});

const SelectHouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  size: z.number(),
  city: z.string(),
  postCode: z.string(),
  rooms: z.number(),
  dpe: z.string().max(1).nullable(),
  url: z.string(),
  isFavorite: z.number()
    .transform((data) => data === 0 ? false : true),
  isArchived: z.number()
    .transform((data) => data === 0 ? false : true),
  isHousiaPicked: z.number()
    .transform((data) => data === 0 ? false : true),
  isUserPicked: z.number()
    .transform((data) => data === 0 ? false : true),
});

const UpdateHouseSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  size: z.number(),
  city: z.string(),
  postCode: z.string(),
  rooms: z.number(),
  dpe: z.string().max(1).min(1),
  url: z.string(),
  isFavorite: z.boolean()
    .transform((data) => data === true ? 1 : 0),
  isArchived: z.boolean()
    .transform((data) => data === true ? 1 : 0),
  isHousiaPicked: z.boolean()
    .transform((data) => data === true ? 1 : 0),
  isUserPicked: z.boolean()
    .transform((data) => data === true ? 1 : 0),
}).partial();

const ParserHouseSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  size: z.number(),
  city: z.string(),
  postCode: z.string(),
  rooms: z.number(),
  dpe: z.string().nullable(),
});

export { CreateHouseSchema, SelectHouseSchema, UpdateHouseSchema, ParserHouseSchema };
