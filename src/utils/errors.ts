/**
 * Custom error classes for structured error handling
 */

export interface ApiErrorResponse {
  msg: string;
  code?: string;
  details?: any;
  statusCode: number;
}

/**
 * Base API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  toJSON(): ApiErrorResponse {
    return {
      msg: this.message,
      code: this.code,
      details: this.details,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Validation Error - 400
 */
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error - 401
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error - 403
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access Denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error - 404
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error - 409
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error - 429
 */
export class RateLimitError extends ApiError {
  retryAfter: number;

  constructor(message: string = 'Too many requests', retryAfter: number = 60) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
    this.name = 'RateLimitError';
  }

  toJSON(): ApiErrorResponse & { retryAfter: number } {
    return {
      ...super.toJSON(),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Internal Server Error - 500
 */
export class InternalError extends ApiError {
  constructor(message: string = 'Internal Server Error', details?: any) {
    super(message, 500, 'INTERNAL_ERROR', details);
    this.name = 'InternalError';
  }
}

/**
 * Service Unavailable Error - 503
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service Unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Get appropriate error status code and message
 */
export const getErrorResponse = (error: any): ApiErrorResponse => {
  if (error instanceof ApiError) {
    return error.toJSON();
  }

  // Handle known error types
  if (error instanceof SyntaxError) {
    return {
      msg: 'Invalid request format',
      code: 'INVALID_REQUEST',
      statusCode: 400,
    };
  }

  if (error instanceof TypeError) {
    return {
      msg: 'Invalid request',
      code: 'TYPE_ERROR',
      statusCode: 400,
    };
  }

  // Default error
  return {
    msg: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
};
