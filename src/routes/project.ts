import { requireAuthenticationMiddleware } from '@/middlewares/authentication.js';
import { ProjectRepository } from '@/repositories/ProjectRepositories.js';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
} from '@/types/validators/Project.js';
import { LogDomain, logger } from '@/utils/logger.js';
import { failure } from '@/views/json/failure.js';
import { success } from '@/views/json/success.js';
import { Hono } from 'hono';

const project = new Hono();

project.use(requireAuthenticationMiddleware);

project.get('/', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Reading all projects');
    const user = c.get('user');
    const result = await ProjectRepository.readAll({ userId: user.id });
    return success(200, result);
  } catch (err) {
    logger.error([LogDomain.ROUTE], 'Error when reading projects', { error: err });
    return failure(err);
  }
});

project.get('/:id', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Reading project', {
      projectId: c.req.param('id'),
    });
    const id = c.req.param('id');
    const user = c.get('user');
    const result = await ProjectRepository.readOne({
      projectId: id,
      userId: user.id,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

project.post('/', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Creating project');
    const user = c.get('user');
    const body = await c.req.json();
    const project = CreateProjectSchema.parse({ ...body, userId: user.id });
    const result = ProjectRepository.create(project);
    return success(201, result);
  } catch (err) {
    return failure(err);
  }
});

project.put('/:id', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Updating project', {
      projectId: c.req.param('id'),
    });
    const id = c.req.param('id');
    const user = c.get('user');
    const body = await c.req.json();
    const changes = UpdateProjectSchema.parse(body);
    const result = ProjectRepository.update({
      projectId: id,
      userId: user.id,
      changes: changes,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

project.delete('/:id', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Deleting project', {
      projectId: c.req.param('id'),
    });
    const id = c.req.param('id');
    const user = c.get('user');
    const result = await ProjectRepository.delete({ projectId: id, userId: user.id });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

export default project;
