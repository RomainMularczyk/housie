import { Hono } from 'hono';
import { logger } from 'hono/logger';
import house from './house';

const routes = (app: Hono) => {
  app.use('*', logger());

  app.get('/health', async (c) => {
    return c.json({
      uptime: process.uptime(),
      message: 'Ok',
      date: new Date(),
    });
  });

  app.route('/house', house);
};

export default routes;
