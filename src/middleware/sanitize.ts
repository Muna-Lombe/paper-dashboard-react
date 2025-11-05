import { Context, Next } from 'hono';
import { Env } from '../index';

/**
 * Sanitization utilities to prevent XSS, SQL injection, and other attacks
 */

// Remove potentially dangerous HTML/script tags
export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Sanitize email addresses
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  
  const sanitized = email.toLowerCase().trim();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

// Sanitize URLs
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return urlObj.toString();
  } catch (e) {
    throw new Error('Invalid URL format');
  }
};

// Sanitize text input (numbers, letters, spaces, common punctuation)
export const sanitizeText = (input: string, allowSpecialChars = false): string => {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  // Remove potentially dangerous characters
  if (!allowSpecialChars) {
    sanitized = sanitized.replace(/[^\w\s-]/g, '');
  } else {
    // Allow common punctuation but remove script/sql keywords
    sanitized = sanitized.replace(/<|>|javascript:|script|select|insert|update|delete|drop|union|exec|execute/gi, '');
  }
  
  return sanitized;
};

// Validate integer inputs
export const sanitizeInteger = (value: any, min?: number, max?: number): number => {
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    throw new Error('Invalid integer value');
  }
  
  if (min !== undefined && num < min) {
    throw new Error(`Value must be at least ${min}`);
  }
  
  if (max !== undefined && num > max) {
    throw new Error(`Value must be at most ${max}`);
  }
  
  return num;
};

// Validate and sanitize object keys (prevent prototype pollution)
export const sanitizeObject = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const dangerous = ['__proto__', 'constructor', 'prototype'];
  const sanitized: any = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !dangerous.includes(key)) {
      const value = obj[key];
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else if (typeof value === 'string') {
        sanitized[key] = sanitizeHtml(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Input validation middleware
 * Sanitizes all JSON request bodies
 */
export const validateInput = async (c: Context<{ Bindings: Env }>, next: Next) => {
  // Store original methods
  const originalJson = c.req.json.bind(c.req);
  
  // Override json method to sanitize on parse
  (c.req as any).json = async function() {
    try {
      const data = await originalJson();
      return sanitizeObject(data);
    } catch (e: any) {
      throw new Error(`Invalid JSON: ${e.message}`);
    }
  };
  
  await next();
};
