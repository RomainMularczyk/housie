import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { auth } from '@/utils/auth/auth.js';
import house from './house.js';
import prompt from './prompt.js';
import project from './project.js';
import scrape from './scrape.js';

const routes = (
  app: Hono<{
    Variables: {
      user: typeof auth.$Infer.Session.user | null;
      session: typeof auth.$Infer.Session.session | null;
    };
  }>
) => {
  app.use('*', logger());

  app.get('api/v1/health', async (c) => {
    return c.json({
      uptime: process.uptime(),
      message: 'Ok',
      date: new Date(),
    });
  });

  app.route('api/v1/', house);
  app.route('api/v1/', prompt);
  app.route('api/v1/projects', project);
  app.route('api/v1/scrape', scrape);

  app.on(['POST', 'GET'], '/api/v1/auth/*', (c) => auth.handler(c.req.raw));
};

export default routes;
