import dotenv from 'dotenv';
import { betterAuth } from 'better-auth';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import { Email } from '../email/Email.js';
dotenv.config();

const dialect = new LibsqlDialect({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const auth = betterAuth({
  basePath: `${process.env.HOUSIE_API_VERSION}/auth`,
  database: {
    dialect: dialect,
    type: 'sqlite',
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  redirectTo: process.env.HOUSIE_WEB_APP_URL,
  trustedOrigins: [process.env.HOUSIE_WEB_APP_URL],
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await Email.send({
        to: user.email,
        subject: 'Verify your email address',
        text: 'Click the link to verify your email: ' + `${url}`,
      });
    },
    sendOnSignUp: true,
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackUrl:
        `${process.env.HOUSIE_API_URL}:${process.env.HOUSIE_API_PORT}` +
        `/${process.env.HOUSIE_API_VERSION}/auth/callback/discord`,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl:
        `${process.env.HOUSIE_API_URL}:${process.env.HOUSIE_API_PORT}` +
        `/${process.env.HOUSIE_API_VERSION}/auth/callback/google`,
    },
  },
});

export { auth };
