import { Context, Next } from 'hono';
import { Env } from '../index';

export interface RateLimitOptions {
  requestsPerMinute?: number;
  requestsPerHour?: number;
  keyGenerator?: (c: Context) => string; // Custom key function (default: IP address)
}

const DEFAULT_REQUESTS_PER_MINUTE = 30;
const DEFAULT_REQUESTS_PER_HOUR = 300;

/**
 * Rate limiting middleware using Durable Objects
 * Tracks request counts per IP/user and enforces rate limits
 */
export const rateLimit = (options: RateLimitOptions = {}) => {
  const {
    requestsPerMinute = DEFAULT_REQUESTS_PER_MINUTE,
    requestsPerHour = DEFAULT_REQUESTS_PER_HOUR,
    keyGenerator = (c: Context) => {
      // Extract client IP from headers (works with Cloudflare)
      return c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    },
  } = options;

  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const key = keyGenerator(c);
    const now = Date.now();

    try {
      // For now, we'll implement a simple in-memory rate limiting
      // In production, you'd want to use Durable Objects for distributed rate limiting
      // This is a temporary solution that works per-worker instance
      
      const rateLimitStore = globalThis as any;
      if (!rateLimitStore._rateLimitStore) {
        rateLimitStore._rateLimitStore = new Map();
      }

      const store = rateLimitStore._rateLimitStore;
      const keyData = store.get(key) || { 
        requests: [], 
        lastReset: now 
      };

      // Clean up old requests (older than 1 hour)
      const oneHourAgo = now - 60 * 60 * 1000;
      keyData.requests = keyData.requests.filter((timestamp: number) => timestamp > oneHourAgo);

      // Check hourly limit
      if (keyData.requests.length >= requestsPerHour) {
        return c.json(
          { 
            msg: 'Too many requests. Please try again later.',
            retryAfter: 3600 
          },
          429
        );
      }

      // Check minute limit
      const lastMinute = now - 60 * 1000;
      const requestsInLastMinute = keyData.requests.filter(
        (timestamp: number) => timestamp > lastMinute
      ).length;

      if (requestsInLastMinute >= requestsPerMinute) {
        return c.json(
          { 
            msg: 'Too many requests in the last minute. Please slow down.',
            retryAfter: 60 
          },
          429
        );
      }

      // Record this request
      keyData.requests.push(now);
      store.set(key, keyData);

      // Set rate limit headers
      c.header('X-RateLimit-Limit', requestsPerMinute.toString());
      c.header('X-RateLimit-Remaining', Math.max(0, requestsPerMinute - requestsInLastMinute - 1).toString());
      c.header('X-RateLimit-Reset', Math.floor(lastMinute + 60 * 1000 / 1000).toString());

      await next();
    } catch (error: any) {
      console.error('Rate limit middleware error:', error.message);
      // Don't block requests if rate limiter fails
      await next();
    }
  };
};
