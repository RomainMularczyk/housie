import { auth } from '@/utils/auth/auth.js';
import { Context, Next } from 'hono';

/**
 * Authentication middleware
 *
 * @param {Context} c - The context of the request.
 * @param {Next} next - The next middleware function.
 * @returns {Promise<void>} A promise that resolves when the
 * middleware is complete.
 */
const authenticationMiddleware = async (c: Context, next: Next): Promise<void> => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set('user', null);
    c.set('session', null);
    return next();
  }

  c.set('user', session.user);
  c.set('session', session.session);

  return next();
};

export default authenticationMiddleware;
