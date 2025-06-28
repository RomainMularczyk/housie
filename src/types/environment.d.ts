declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      // Housie
      HOUSIE_API_URL: string;
      HOUSIE_API_PORT: string;
      HOUSIE_WEB_APP_URL: string;
      // RabbitMQ
      RABBITMQ_VERSION: string;
      RABBITMQ_PORT: number;
      RABBITMQ_UI_PORT: number;
      RABBITMQ_USER: string;
      RABBITMQ_PASSWORD: string;
      RABBITMQ_URL: string;
      RABBITMQ_EXTERNAL_URL: string;
      RABBITMQ_INTERNAL_URL: string;
      // Redis
      REDIS_VERSION: string;
      REDIS_PORT: number;
      REDIS_URL: string;
      // Message clients
      TELEGRAM_BOT_TOKEN: string;
      // Database
      TURSO_DATABASE_URL: string;
      TURSO_AUTH_TOKEN: string;
      // LLMs
      OPENAI_API_KEY: string;
    }
  }
}

export {};

