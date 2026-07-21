import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

const SENSITIVE_FIELDS = ['password', 'newPassword', 'oldPassword', 'confirmPassword', 'token', 'refreshToken', 'accessToken'];

const redact = (body: unknown): unknown => {
  if (typeof body !== 'object' || body === null) return body;
  const clone: Record<string, unknown> = { ...(body as Record<string, unknown>) };
  for (const field of SENSITIVE_FIELDS) {
    if (field in clone) clone[field] = '[REDACTED]';
  }
  return clone;
};

export const validateBody = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction): void => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    console.log('❌ [VALIDATION] Validation failed for body:', redact(req.body));
    throw error;
  }
};

export const validateQuery = (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction): void => {
  Object.assign(req.query, schema.parse(req.query));
  next();
};
