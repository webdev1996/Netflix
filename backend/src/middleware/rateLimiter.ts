import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max number of requests per window
}

const rateLimits = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (config: RateLimitConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip;
    const now = Date.now();

    // Get or create rate limit entry
    let limit = rateLimits.get(key);
    if (!limit) {
      limit = { count: 0, resetTime: now + config.windowMs };
      rateLimits.set(key, limit);
    }

    // Reset if window has passed
    if (now > limit.resetTime) {
      limit.count = 0;
      limit.resetTime = now + config.windowMs;
    }

    // Check if limit exceeded
    if (limit.count >= config.max) {
      logger.warn(`Rate limit exceeded for IP: ${key}`);
      next(new AppError('Too many requests', 429));
      return;
    }

    // Increment counter
    limit.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', config.max);
    res.setHeader('X-RateLimit-Remaining', config.max - limit.count);
    res.setHeader('X-RateLimit-Reset', limit.resetTime);

    next();
  };
}; 