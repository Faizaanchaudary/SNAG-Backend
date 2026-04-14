import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateBody = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction): void => {
  console.log('🔵 [VALIDATION] Validating body:', req.body);
  try {
    req.body = schema.parse(req.body);
    console.log('✅ [VALIDATION] Body validated successfully');
    next();
  } catch (error) {
    console.log('❌ [VALIDATION] Validation failed:', error);
    throw error;
  }
};

export const validateQuery = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction): void => {
  Object.assign(req.query, schema.parse(req.query));
  next();
};
