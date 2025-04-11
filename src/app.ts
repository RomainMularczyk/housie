import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import routes from './routes';
import { bot } from './clients/Telegram';

const app = new Hono();

routes(app);

const PORT = parseInt(process.env.PORT || "8787");

bot.start();

serve({
  fetch: app.fetch,
  port: PORT,
});
