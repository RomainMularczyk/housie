import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.TURSO_DATABASE_URL) {
  console.error("An environment variable should be provided containing turso ids.");
}

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default turso;
