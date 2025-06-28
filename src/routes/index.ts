import { Hono } from 'hono';
import { logger } from 'hono/logger';
import house from './house.js';
import prompt from './prompt.js';
import scrape from './scrape.js';

const routes = (app: Hono) => {
  app.use('*', logger());

  app.get('/health', async (c) => {
    return c.json({
      uptime: process.uptime(),
      message: 'Ok',
      date: new Date(),
    });
  });

  app.route('/houses', house);
  app.route('/prompts', prompt);
  app.route('/scrape', scrape);
};

export default routes;
