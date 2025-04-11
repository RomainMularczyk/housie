import { Hono } from 'hono';
import HouseRepository from '../repositories/HouseRepository';
import { CreateHouseSchema } from '../validators/House';
import { success } from '../views/json/success';

const house = new Hono();

house.get('/', async (c) => {
  try {
    const result = await HouseRepository.read();
    return success(200, result);
  } catch (err) {
    console.error('NO IMPLEMENTED FOR NOW', err);
  }
});

house.get('/:id', async (c) => {

});

house.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const house = CreateHouseSchema.parse(body);
    const result = HouseRepository.create(house);
    return success(201, result);
  } catch (err) {
    console.error('NOT IMPLEMENTED FOR NOW', err);
  }
});

export default house;
