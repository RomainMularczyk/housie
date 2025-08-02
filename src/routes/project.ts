import { ProjectRepository } from '@/repositories/ProjectRepositories.js';
import { UpdateProjectSchema } from '@/types/validators/Project.js';
import { LogDomain, logger } from '@/utils/logger.js';
import { failure } from '@/views/json/failure.js';
import { success } from '@/views/json/success.js';
import { Hono } from 'hono';

const project = new Hono();

project.get('/', async (_c) => {
  try {
    const result = await ProjectRepository.readAll();
    return success(200, result);
  } catch (err) {
    logger.error([LogDomain.ROUTE], 'Error when reading projects', { error: err });
    return failure(err);
  }
});

project.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await ProjectRepository.readOne(id);
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

project.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const project = ProjectRepository.create(body);
    return success(201, project);
  } catch (err) {
    return failure(err);
  }
});

project.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const changes = UpdateProjectSchema.parse(body);
    const result = ProjectRepository.update(id, changes);
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

project.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await ProjectRepository.delete(id);
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

export default project;
