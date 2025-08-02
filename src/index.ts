import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import routes from '@/routes/index.js';
import { TelegramClient } from '@/clients/telegram/Telegram.js';
import { LogDomain, logger } from '@/utils/logger.js';
import { auth as authConfig } from './utils/auth/auth.js';
import authenticationMiddleware from './middlewares/authentication.js';

const app = new Hono<{
  Variables: {
    user: typeof authConfig.$Infer.Session.user | null;
    session: typeof authConfig.$Infer.Session.session | null;
  };
}>();

// Configuring middlewares
app.use(
  '/*',
  cors({
    origin: process.env.WEB_APP_URL || 'http://localhost:5173',
    allowHeaders: ['Accept', 'Authorization', 'Content-Type', 'Referer', 'User-Agent'],
    allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);
app.use('/*', authenticationMiddleware);
app.use(honoLogger());
logger.info([LogDomain.SYSTEM], 'CORS middleware configured', {
  origin: process.env.WEB_APP_URL || 'http://localhost:5173',
  methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
});

// Registering API routes
routes(app);
logger.info([LogDomain.SYSTEM], 'Routes registered');

// Initialize chat client
logger.info([LogDomain.CLIENT], 'Initializing Telegram client...');
const client = TelegramClient.init();
client.bot.start();
logger.info([LogDomain.CLIENT], 'Telegram bot started successfully');

// Starting API
serve({
  fetch: app.fetch,
  port: process.env.HOUSIE_API_PORT || 3000,
});
logger.info(
  [LogDomain.SYSTEM],
  `API is now listening on port ${process.env.HOUSIE_API_PORT}`
);
