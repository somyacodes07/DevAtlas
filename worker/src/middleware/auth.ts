import { MiddlewareHandler } from 'hono';
import { Env, Variables } from '../types';

export const adminAuthMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const expectedKey = c.env?.ADMIN_API_KEY || 'devatlas-local-admin-key-change-in-production';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const requestId = c.get('requestId');
    return c.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or malformed Authorization header. Expected Bearer <token>.',
          requestId,
        },
      },
      401
    );
  }

  const token = authHeader.substring(7).trim();
  if (token !== expectedKey) {
    const requestId = c.get('requestId');
    return c.json(
      {
        error: {
          code: 'FORBIDDEN',
          message: 'Invalid administrative API credentials.',
          requestId,
        },
      },
      403
    );
  }

  await next();
};
