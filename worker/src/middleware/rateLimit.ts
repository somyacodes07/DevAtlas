import { MiddlewareHandler } from 'hono';
import { Env, Variables } from '../types';

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimitMiddleware = (
  config: RateLimitConfig = { maxRequests: 60, windowSeconds: 60 }
): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> => {
  return async (c, next) => {
    const clientIp =
      c.req.header('cf-connecting-ip') ||
      c.req.header('x-forwarded-for') ||
      '127.0.0.1';

    const path = c.req.path;
    const key = `rl:${clientIp}:${path}`;
    const now = Date.now();

    const record = inMemoryStore.get(key);

    if (!record || now > record.resetTime) {
      inMemoryStore.set(key, {
        count: 1,
        resetTime: now + config.windowSeconds * 1000,
      });
    } else {
      record.count++;
      if (record.count > config.maxRequests) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        const requestId = c.get('requestId');
        c.header('Retry-After', String(retryAfter));
        return c.json(
          {
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: `Too many requests. Please try again in ${retryAfter} seconds.`,
              requestId,
            },
          },
          429
        );
      }
    }

    await next();
  };
};
