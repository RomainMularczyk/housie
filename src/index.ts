import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import routes from '@/routes/index.js';
import { TelegramClient } from '@/clients/telegram/Telegram.js';
import { LogDomain, logger } from '@/utils/logger.js';

const app = new Hono();

logger.info([LogDomain.SYSTEM], 'Starting Housie application...');

app.use('/*', cors({
  'origin': process.env.WEB_APP_URL || 'http://localhost:5173',
  allowHeaders: ['Accept', 'Content-Type', 'Referer', 'User-Agent'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(honoLogger());

logger.info([LogDomain.SYSTEM], 'CORS middleware configured', {
  origin: process.env.WEB_APP_URL || 'http://localhost:5173',
  methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS']
});

routes(app);
logger.info([LogDomain.SYSTEM], 'Routes registered');

const PORT = parseInt(process.env.PORT || '3000');

// Initialize chat client
logger.info([LogDomain.CLIENT], 'Initializing Telegram client...');
const client = TelegramClient.init();
client.bot.start();
logger.info([LogDomain.CLIENT], 'Telegram bot started successfully');

logger.info([LogDomain.SYSTEM], `API server starting on port ${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
});

logger.info([LogDomain.SYSTEM], `API is now listening on port ${PORT}`);
