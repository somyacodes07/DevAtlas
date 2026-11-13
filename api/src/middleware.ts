import type { Context, MiddlewareHandler } from 'hono';
import type { ApiError } from './contract';

export interface Env {
  DB: D1Database;
  ADMIN_TOKEN?: string;
  ALLOWED_ORIGINS?: string;
  RATE_LIMIT_PER_MINUTE?: string;
  KEEP_DAYS?: string;
}
export type AppEnv = { Bindings: Env; Variables: { requestId: string } };

type Status = 400 | 401 | 404 | 413 | 429 | 500 | 503;

export function fail(c: Context<AppEnv>, status: Status, code: string, message: string, details?: unknown) {
  const body: ApiError = { error: { code, message, requestId: c.get('requestId'), ...(details ? { details } : {}) } };
  return c.json(body, status);
}

/** Every response carries an id that also appears in the logs, so one request can be traced end to end. */
export const requestId: MiddlewareHandler<AppEnv> = async (c, next) => {
  const incoming = c.req.header('x-request-id');
  const id = incoming && /^[\w-]{8,64}$/.test(incoming) ? incoming : crypto.randomUUID();
  c.set('requestId', id);
  await next();
  c.header('X-Request-Id', id);
};

export const securityHeaders: MiddlewareHandler<AppEnv> = async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
};

export const cors: MiddlewareHandler<AppEnv> = async (c, next) => {
  const allowed = (c.env.ALLOWED_ORIGINS ?? '*').split(',').map((o) => o.trim()).filter(Boolean);
  const origin = c.req.header('origin');
  const allow = allowed.includes('*') ? '*' : origin && allowed.includes(origin) ? origin : null;
  if (c.req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...(allow ? { 'Access-Control-Allow-Origin': allow } : {}),
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      },
    });
  }
  await next();
  if (allow) c.header('Access-Control-Allow-Origin', allow);
  c.header('Access-Control-Expose-Headers', 'X-Request-Id, X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After');
  c.header('Vary', 'Origin');
};

/**
 * Fixed-window limiter, one counter per client address.
 * Counters live in the Worker isolate's memory: free, no extra binding, and
 * enough to stop a runaway script. Cloudflare can run several isolates, so
 * the limit is per isolate, not global; the store is injectable so a
 * Durable Object or KV store can replace it without touching the routes.
 */
export interface RateStore {
  hit(key: string, windowMs: number, now: number): { count: number; resetAt: number };
}

export class MemoryRateStore implements RateStore {
  private windows = new Map<string, { count: number; resetAt: number }>();

  hit(key: string, windowMs: number, now: number) {
    let w = this.windows.get(key);
    if (!w || w.resetAt <= now) {
      if (this.windows.size > 5000) for (const [k, v] of this.windows) if (v.resetAt <= now) this.windows.delete(k);
      w = { count: 0, resetAt: now + windowMs };
      this.windows.set(key, w);
    }
    w.count++;
    return w;
  }
}

export function rateLimit(store: RateStore, now: () => number = Date.now): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const limit = Number(c.env.RATE_LIMIT_PER_MINUTE ?? 120) || 120;
    const client = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for')?.split(',')[0].trim() ?? 'local';
    const w = store.hit(client, 60_000, now());
    const retry = Math.max(1, Math.ceil((w.resetAt - now()) / 1000));
    if (w.count > limit) {
      c.header('Retry-After', String(retry));
      c.header('X-RateLimit-Limit', String(limit));
      c.header('X-RateLimit-Remaining', '0');
      return fail(c, 429, 'RATE_LIMITED', `Too many requests. Try again in ${retry} seconds.`);
    }
    await next();
    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', String(Math.max(0, limit - w.count)));
  };
}

async function sameText(a: string, b: string): Promise<boolean> {
  // Compare digests so the check takes the same time whatever the input.
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([crypto.subtle.digest('SHA-256', enc.encode(a)), crypto.subtle.digest('SHA-256', enc.encode(b))]);
  const u = new Uint8Array(x);
  const v = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}

export const adminOnly: MiddlewareHandler<AppEnv> = async (c, next) => {
  const expected = c.env.ADMIN_TOKEN;
  if (!expected) return fail(c, 503, 'ADMIN_DISABLED', 'ADMIN_TOKEN is not configured on this deployment.');
  const given = c.req.header('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!given || !(await sameText(given, expected))) return fail(c, 401, 'UNAUTHORIZED', 'A valid bearer token is required.');
  await next();
};

/** Public reads are safe to cache at the edge and in the browser for a short while. */
export const cacheFor = (seconds: number): MiddlewareHandler<AppEnv> => async (c, next) => {
  await next();
  if (c.res.status === 200) c.header('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds * 4}`);
};
