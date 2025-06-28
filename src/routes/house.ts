import { Hono } from 'hono';
import { CreateHouseSchema, UpdateHouseSchema } from '@/types/validators/House.js';
import { success } from '@/views/json/success.js';
import { failure } from '@/views/json/failure.js';
import HouseRepository from '@/repositories/HouseRepository.js';

const house = new Hono();

house.get('/', async (_c) => {
  try {
    const result = await HouseRepository.read();
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

house.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await HouseRepository.read(id);
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

house.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const house = CreateHouseSchema.parse(body);
    const result = await HouseRepository.create(house);
    return success(201, result);
  } catch (err) {
    return failure(err);
  }
});

house.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const changes = UpdateHouseSchema.parse(body);
    const result = await HouseRepository.update(id, changes);
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

house.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await HouseRepository.delete(id);
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

house.post('/find', async (c) => {
  try {
    const key = c.req.query('key')!;
    const searchQuery = c.req.query('query')!;
    const result = await HouseRepository.findOneBy({ key, searchQuery });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

export default house;
