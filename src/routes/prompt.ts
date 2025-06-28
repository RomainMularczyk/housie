import { Hono } from 'hono';
import { PromptRepository } from '@/repositories/PromptRepository.js';
import { CreatePromptSchema, UpdatePromptSchema } from '@/types/validators/Prompt.js';
import { success } from '@/views/json/success.js';
import { failure } from '@/views/json/failure.js';

const prompt = new Hono();

prompt.get('/', async (_c) => {
  try {
    const result = await PromptRepository.read();
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

prompt.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await PromptRepository.read(id);
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

prompt.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const prompt = CreatePromptSchema.parse(body);
    const result = await PromptRepository.create(prompt);
    return success(201, result);
  } catch (err) {
    return failure(err);
  }
});


prompt.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const changes = UpdatePromptSchema.parse(body);
    const result = await PromptRepository.update(id, changes);
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

prompt.get('/active', async (_c) => {
  try {
    const result = await PromptRepository.readActive();
    return success(200, result);
  } catch (err) {
    return failure(err);
  }
});

export default prompt;
