import { auth } from '@/utils/auth/auth.js';
import { failure } from '@/views/json/failure.js';
import { AuthenticationError } from '@/errors/AuthenticationError.js';
import { Context, Next } from 'hono';

/**
 * Provides the current user and session to the context.
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

/**
 * Verifies that the user is authenticated before allowing access to the route.
 *
 * @param {Context} c - The context of the request.
 * @param {Next} next - The next middleware function.
 * @returns {Promise<void | Response>} A promise that resolves when the
 * middleware is complete.
 */
const requireAuthenticationMiddleware = async (
  c: Context,
  next: Next
): Promise<void | Response> => {
  const user = c.get('user');

  if (!user) {
    return failure(
      new AuthenticationError(
        'User Not Authenticated Error',
        'The user is not authenticated.'
      )
    );
  }

  return next();
};

export { authenticationMiddleware, requireAuthenticationMiddleware };
