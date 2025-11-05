// import { waitUntil } from "cloudflare:workers";

import { Fetcher } from "@cloudflare/workers-types/experimental";
import { Env } from "../index";

export interface LogData {
  body: Record<string, any>,
  source_ip: string;
  category: string;
  trace_id: string;
  span_id: string;
  parent_span_id?:string;
  template: { name: string; params: { method: string, path: string, statusCode: number } };
  tags: { service: string, region: string, env: string, [key: string]: string };
}

/**
 * LogHog Client for Paper Dash API
 * Integrates with LogHog Worker for structured logging
 * 
 * References: https://github.com/Muna-Lombe/loghog_public_content
 */
export class LogHogClient {
  private logHogService: Fetcher; // Cloudflare service binding to LogHog Worker
  private token: string;
  private waitUntil: (promise: Promise<any>) => void;
  private service: string = 'paper-dash-api';
  private region: string = 'cloudflare';

  /**
   * Initialize LogHog Client with service binding and credentials
   * 
   * @param logHogService - Cloudflare service binding to LogHog Worker
   * @param token - App token from LogHog dashboard
   * @param waitUntil - Cloudflare's waitUntil function for background tasks
   * 
   * @example
   * const loghog = new LogHogClient(
   *   env.LOG_API, 
   *   env.LOGHOG_APP_TOKEN || '', 
   *   ctx.waitUntil
   * );
   */
  constructor(
    logHogService: Fetcher,
    token: string,
    waitUntil: (promise: Promise<any>) => void
  ) {
    if (!logHogService) {
      throw new Error('LogHogClient requires a LogHog service binding.');
    }
    this.logHogService = logHogService;
    this.token = token;
    this.waitUntil = waitUntil;
  }

  /**
   * Send structured log to LogHog
   * Non-blocking: uses waitUntil for background submission
   */
  private log(level: string, message: string, data: LogData) {
    if (!level || !message || !data) {
      console.error('[LogHog] Log level, message, and data are required.');
      return;
    }

    const payload = {
      timestamp: new Date().toISOString(),
      level,
      message,
      body: data.body,
      category: data.category,
      trace_id: data.trace_id,
      span_id: data.span_id,
      parent_span_id: data.parent_span_id,
      template: data.template,
      tags: {
        ...data.tags,
        service: this.service,
        region: this.region,
      },
    };

    try {
      const logRequest = new Request('https://log-api/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(payload),
      });

      // Non-blocking: pass promise to waitUntil for background execution
      // This ensures logs don't delay response time
      this.waitUntil(this.logHogService.fetch(logRequest as any));

    } catch (error) {
      console.error('[LogHog] Error creating log request:', error);
      // Don't throw - logging failures shouldn't crash the app
    }
  }

  /**
   * Log info level message
   */
  info(message: string, data: LogData) {
    return this.log('info', message, data);
  }

  /**
   * Log warning level message
   */
  warn(message: string, data: LogData) {
    return this.log('warn', message, data);
  }

  /**
   * Log error level message
   */
  error(message: string, data: LogData) {
    return this.log('error', message, data);
  }

  /**
   * Log debug level message
   */
  debug(message: string, data: LogData) {
    return this.log('debug', message, data);
  }

  /**
   * Log fatal level message
   */
  fatal(message: string, data: LogData) {
    return this.log('fatal', message, data);
  }

  /**
   * Log HTTP request with method, path, and status code
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string,
    traceId?: string,
    spanId?: string,
    sourceIp: string = '0.0.0.0'
  ) {
    this.info(`${method} ${path} - ${statusCode}`, {
      category: 'http_request',
      body: {
        method,
        path,
        statusCode,
        duration: `${duration}ms`,
        userId: userId || 'anonymous',
      },
      source_ip: sourceIp,
      trace_id: traceId || '',
      span_id: spanId || '',
      tags: {
        service: this.service,
        region: this.region,
        env: 'production',
        ...(userId && { userId }),
      },
      template: {
        name: 'HTTP_REQUEST',
        params: { method, path, statusCode },
      },
    });
  }

  /**
   * Log HTTP error with detailed error information
   */
  logHttpError(
    method: string,
    path: string,
    statusCode: number,
    error: string,
    userId?: string,
    traceId?: string,
    spanId?: string,
    stack?: string,
    sourceIp: string = '0.0.0.0'
  ) {
    this.error(`${method} ${path} - ${statusCode}`, {
      category: 'http_error',
      body: {
        method,
        path,
        statusCode,
        error,
        userId: userId || 'anonymous',
        ...(stack && { stack }),
      },
      source_ip: sourceIp,
      trace_id: traceId || '',
      span_id: spanId || '',
      tags: {
        service: this.service,
        region: this.region,
        env: 'production',
        ...(userId && { userId }),
      },
      template: {
        name: 'HTTP_ERROR',
        params: { method, path, statusCode },
      },
    });
  }

  /**
   * Log database operation
   */
  logDatabaseOperation(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    error?: string,
    traceId?: string,
    sourceIp: string = '0.0.0.0'
  ) {
    const level = success ? 'info' : 'error';
    const message = `Database ${operation} on ${table}`;

    this.log(level, message, {
      category: 'database',
      body: {
        operation,
        table,
        duration: `${duration}ms`,
        success,
        ...(error && { error }),
      },
      source_ip: sourceIp,
      trace_id: traceId || '',
      span_id: '',
      tags: {
        service: this.service,
        region: this.region,
        env: 'production',
        operation,
        table,
      },
      template: {
        name: 'DB_OPERATION',
        params: { method: operation, path: table, statusCode: success ? 200 : 500 },
      },
    });
  }

  /**
   * Log authentication event
   */
  logAuthEvent(
    event: 'login' | 'logout' | 'register' | 'failed_login' | 'failed_verify',
    userId?: string,
    email?: string,
    details?: Record<string, any>,
    traceId?: string,
    sourceIp: string = '0.0.0.0'
  ) {
    const level = event.startsWith('failed') ? 'warn' : 'info';

    this.log(level, `Authentication ${event}`, {
      category: 'authentication',
      body: {
        event,
        userId: userId || 'anonymous',
        email,
        ...details,
      },
      source_ip: sourceIp,
      trace_id: traceId || '',
      span_id: '',
      tags: {
        service: this.service,
        region: this.region,
        env: 'production',
        event,
        ...(userId && { userId }),
      },
      template: {
        name: `AUTH_${event.toUpperCase()}`,
        params: { method: event, path: 'authentication', statusCode: level === 'warn' ? 401 : 200 },
      },
    });
  }

  /**
   * Create request logger middleware for Hono
   * Generates unique trace IDs and logs all requests
   */
  createRequestLogger() {
    return async (c: any, next: any) => {
      const startTime = Date.now();
      const traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const spanId = `span-${Math.random().toString(36).substr(2, 9)}`;

      // Store IDs in context for later use in error handlers
      (c as any).traceId = traceId;
      (c as any).spanId = spanId;

      try {
        await next();
      } finally {
        const duration = Date.now() - startTime;
        const userId = (c as any).get?.('user')?.id;

        // Log the request
        this.logRequest(
          c.req.method,
          c.req.url,
          c.res?.status || 200,
          duration,
          userId,
          traceId,
          spanId
        );
      }
    };
  }
}

export default LogHogClient;
