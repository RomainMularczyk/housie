import { Hono } from 'hono';
import { PromptRepository } from '@/repositories/PromptRepository.js';
import { CreatePromptSchema, UpdatePromptSchema } from '@/types/validators/Prompt.js';
import { success } from '@/views/json/success.js';
import { failure } from '@/views/json/failure.js';
import { LogDomain, logger } from '@/utils/logger.js';
import { requireAuthenticationMiddleware } from '@/middlewares/authentication.js';

const prompt = new Hono();

prompt.use(requireAuthenticationMiddleware);

// ------------------------------------
// -------------- CUSTOM --------------
// ------------------------------------

prompt.get('/projects/:projectId/prompts/active', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Reading active prompt');
    const projectId = c.req.param('projectId');
    const user = c.get('user');
    const result = await PromptRepository.readActive({
      projectId: projectId,
      userId: user.id,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

// ------------------------------------------
// -------------- GENERIC CRUD --------------
// ------------------------------------------

prompt.get('/projects/:projectId/prompts', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Reading all prompts');
    const projectId = c.req.param('projectId');
    const user = c.get('user');
    const result = await PromptRepository.readAll({
      userId: user.id,
      projectId: projectId,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

prompt.get('/projects/:projectId/prompts/:id', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Reading prompt');
    const id = c.req.param('id');
    const projectId = c.req.param('projectId');
    const user = c.get('user');
    const result = await PromptRepository.readOne({
      projectId: projectId,
      userId: user.id,
      promptId: id,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

prompt.post('/projects/:projectId/prompts', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Creating prompt');
    const body = await c.req.json();
    const user = c.get('user');
    const projectId = c.req.param('projectId');
    const prompt = CreatePromptSchema.parse({
      projectId: projectId,
      userId: user.id,
      ...body,
    });
    const result = await PromptRepository.create(prompt, { userId: user.id });
    return success(201, result);
  } catch (err) {
    return failure(err);
  }
});

prompt.put('/projects/:projectId/prompts/:id', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Updating prompt');
    const id = c.req.param('id');
    const user = c.get('user');
    const projectId = c.req.param('projectId');
    const body = await c.req.json();
    const changes = UpdatePromptSchema.parse(body);
    const result = await PromptRepository.update({
      projectId: projectId,
      userId: user.id,
      promptId: id,
      changes: changes,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

prompt.delete('/projects/:projectId/prompts/:id', async (c) => {
  try {
    logger.info([LogDomain.ROUTE], 'Deleting prompt');
    const id = c.req.param('id');
    const projectId = c.req.param('projectId');
    const user = c.get('user');
    const result = await PromptRepository.delete({
      projectId: projectId,
      userId: user.id,
      promptId: id,
    });
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

export default prompt;
