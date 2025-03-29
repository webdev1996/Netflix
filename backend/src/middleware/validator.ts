import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  validate?: (value: any) => boolean;
  message?: string;
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const rule of rules) {
        const value = req.body[rule.field];
        const fieldName = rule.field;

        // Check if required
        if (rule.required && (value === undefined || value === null)) {
          throw new AppError(`${fieldName} is required`, 400);
        }

        // Skip validation if not required and value is not provided
        if (!rule.required && (value === undefined || value === null)) {
          continue;
        }

        // Type validation
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              throw new AppError(`${fieldName} must be a string`, 400);
            }
            if (rule.min && value.length < rule.min) {
              throw new AppError(`${fieldName} must be at least ${rule.min} characters`, 400);
            }
            if (rule.max && value.length > rule.max) {
              throw new AppError(`${fieldName} must be at most ${rule.max} characters`, 400);
            }
            if (rule.pattern && !rule.pattern.test(value)) {
              throw new AppError(rule.message || `${fieldName} has invalid format`, 400);
            }
            break;

          case 'number':
            if (typeof value !== 'number') {
              throw new AppError(`${fieldName} must be a number`, 400);
            }
            if (rule.min !== undefined && value < rule.min) {
              throw new AppError(`${fieldName} must be at least ${rule.min}`, 400);
            }
            if (rule.max !== undefined && value > rule.max) {
              throw new AppError(`${fieldName} must be at most ${rule.max}`, 400);
            }
            break;

          case 'boolean':
            if (typeof value !== 'boolean') {
              throw new AppError(`${fieldName} must be a boolean`, 400);
            }
            break;

          case 'array':
            if (!Array.isArray(value)) {
              throw new AppError(`${fieldName} must be an array`, 400);
            }
            if (rule.min !== undefined && value.length < rule.min) {
              throw new AppError(`${fieldName} must have at least ${rule.min} items`, 400);
            }
            if (rule.max !== undefined && value.length > rule.max) {
              throw new AppError(`${fieldName} must have at most ${rule.max} items`, 400);
            }
            break;

          case 'object':
            if (typeof value !== 'object' || value === null) {
              throw new AppError(`${fieldName} must be an object`, 400);
            }
            break;
        }

        // Enum validation
        if (rule.enum && !rule.enum.includes(value)) {
          throw new AppError(`${fieldName} must be one of: ${rule.enum.join(', ')}`, 400);
        }

        // Custom validation
        if (rule.validate && !rule.validate(value)) {
          throw new AppError(rule.message || `${fieldName} is invalid`, 400);
        }
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        logger.error('Validation error:', error);
        next(new AppError('Invalid request data', 400));
      }
    }
  };
}; 