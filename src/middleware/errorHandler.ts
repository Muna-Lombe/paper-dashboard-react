import { Context, Next } from 'hono';
import { Env } from '../index';
import { getErrorResponse, ApiError } from '../utils/errors';
import LogHogClient from '../services/loggerService';

/**
 * Global error handler middleware
 * Catches errors and returns structured error responses
 */
export const errorHandler = async (c: Context<{ Bindings: Env }>, next: Next) => {
  try {
    await next();
  } catch (error: any) {
    // Get structured error response
    const errorResponse = getErrorResponse(error);
    const env = c.env as Env;
    const userId = (c as any).get?.('user')?.id;
    const traceId = (c as any).traceId;
    const spanId = (c as any).spanId;

    // Initialize LogHog if service binding exists
    if (env.LOG_API && env.LOGHOG_APP_TOKEN) {
      const loghog = new LogHogClient(
        env.LOG_API,
        env.LOGHOG_APP_TOKEN,
        (promise) => (c as any).ctx?.waitUntil?.(promise) // Use Cloudflare's waitUntil if available
      );

      // Log error to LogHog with structured data
      loghog.logHttpError(
        c.req.method,
        c.req.url,
        errorResponse.statusCode,
        error.message,
        userId,
        traceId,
        spanId,
        env.NODE_ENV !== 'production' ? error.stack : undefined
      );
    }

    // Also log to console in development
    if (env.NODE_ENV !== 'production') {
      console.error(`[${errorResponse.code}] ${errorResponse.msg}`, {
        statusCode: errorResponse.statusCode,
        error: error.message,
        stack: error.stack,
      });
    }

    // Return error response
    return c.json(
      {
        msg: errorResponse.msg,
        code: errorResponse.code,
        ...(errorResponse.details && { details: errorResponse.details }),
      },
      errorResponse.statusCode as any
    );
  }
};

/**
 * Error boundary wrapper for async route handlers
 * Usage: asyncHandler(async (c) => { ... })
 */
export const asyncHandler = (fn: Function) => {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    try {
      return await fn(c, next);
    } catch (error: any) {
      const errorResponse = getErrorResponse(error);
      
      console.error(`[${errorResponse.code}] ${errorResponse.msg}`, {
        statusCode: errorResponse.statusCode,
        error: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
      });

      return c.json(
        {
          msg: errorResponse.msg,
          code: errorResponse.code,
          ...(errorResponse.details && { details: errorResponse.details }),
        },
        errorResponse.statusCode as any
      );
    }
  };
};
