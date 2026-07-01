import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware.js';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array';
  options?: any[];
  regex?: RegExp;
  custom?: (value: any, req: Request) => boolean | Promise<boolean>;
  message?: string;
}

export const validate = (rules: ValidationRule[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string }[] = [];

    for (const rule of rules) {
      let val = req.body[rule.field];

      // Trim strings for input sanitization
      if (typeof val === 'string') {
        val = val.trim();
        req.body[rule.field] = val; // sanitize in request body
      }

      // Check required
      if (rule.required && (val === undefined || val === null || val === '')) {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} is required.`,
        });
        continue;
      }

      // If not required and not provided, skip rest of the rules for this field
      if (!rule.required && (val === undefined || val === null || val === '')) {
        continue;
      }

      // Check type
      if (rule.type) {
        if (rule.type === 'array' && !Array.isArray(val)) {
          errors.push({
            field: rule.field,
            message: rule.message || `${rule.field} must be an array.`,
          });
          continue;
        } else if (rule.type !== 'array' && typeof val !== rule.type) {
          errors.push({
            field: rule.field,
            message: rule.message || `${rule.field} must be a ${rule.type}.`,
          });
          continue;
        }
      }

      // Check options enum
      if (rule.options && !rule.options.includes(val)) {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} must be one of: ${rule.options.join(', ')}.`,
        });
        continue;
      }

      // Check regex
      if (rule.regex && typeof val === 'string' && !rule.regex.test(val)) {
        errors.push({
          field: rule.field,
          message: rule.message || `${rule.field} is invalid in format.`,
        });
        continue;
      }

      // Check custom validation function (supporting async logic)
      if (rule.custom) {
        try {
          const isValid = await rule.custom(val, req);
          if (!isValid) {
            errors.push({
              field: rule.field,
              message: rule.message || `${rule.field} validation failed.`,
            });
          }
        } catch (err: any) {
          errors.push({
            field: rule.field,
            message: err.message || `${rule.field} validation error.`,
          });
        }
      }
    }

    if (errors.length > 0) {
      return next(new AppError('Validation Error', 400, errors));
    }

    next();
  };
};
