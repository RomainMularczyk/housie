import { Hono } from 'hono';
import { CreateHouseSchema, UpdateHouseSchema } from '@/types/validators/House.js';
import { success } from '@/views/json/success.js';
import { failure } from '@/views/json/failure.js';
import HouseRepository from '@/repositories/HouseRepository.js';
import { LogDomain, logger } from '@/utils/logger.js';
import { requireAuthenticationMiddleware } from '@/middlewares/authentication.js';

const house = new Hono();

house.use(requireAuthenticationMiddleware);

// ------------------------------------------
// -------------- GENERIC CRUD --------------
// ------------------------------------------

house.get('/projects/:projectId/houses', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Reading all houses');
    const projectId = c.req.param('projectId');
    const user = c.get('user');
    const result = await HouseRepository.readAll({
      userId: user.id,
      projectId: projectId,
    });
    return success(200, result);
  } catch (err) {
    logger.error([LogDomain.ROUTE], 'Error when reading houses', { error: err });
    return failure(err);
  }
});

house.get('/projects/:projectId/houses/:id', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Reading house');
    const id = c.req.param('id');
    const projectId = c.req.param('projectId');
    const user = c.get('user');
    const result = await HouseRepository.readOne({
      projectId: projectId,
      userId: user.id,
      houseId: id,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

house.post('/projects/:projectId/houses', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Creating house');
    const body = await c.req.json();
    const user = c.get('user');
    const projectId = c.req.param('projectId');
    const house = CreateHouseSchema.parse({ ...body, projectId: projectId });
    const result = await HouseRepository.create(house, { userId: user.id });
    return success(201, result);
  } catch (err) {
    return failure(err);
  }
});

house.put('/projects/:projectId/houses/:id', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Updating house');
    const id = c.req.param('id');
    const user = c.get('user');
    const projectId = c.req.param('projectId');
    const body = await c.req.json();
    const changes = UpdateHouseSchema.parse(body);
    const result = await HouseRepository.update({
      projectId: projectId,
      userId: user.id,
      houseId: id,
      changes: changes,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

house.delete('/projects/:projectId/houses/:id', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Deleting house');
    const id = c.req.param('id');
    const projectId = c.req.param('projectId');
    const user = c.get('user');
    const result = await HouseRepository.delete({
      projectId: projectId,
      userId: user.id,
      houseId: id,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

// ------------------------------------
// -------------- CUSTOM --------------
// ------------------------------------

house.post('projects/:projectId/houses/find', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Finding house');
    const key = c.req.query('key')!;
    const searchQuery = c.req.query('query')!;
    const projectId = c.req.param('projectId');
    const user = c.get('user');
    const result = await HouseRepository.findOneBy({
      key: key,
      searchQuery: searchQuery,
      projectId: projectId,
      userId: user.id,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

export default house;
