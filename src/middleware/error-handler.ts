import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@core/errors/app-error.js';
import { sendError } from '@core/http/response.js';
import { logger } from '@config/logger.js';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    sendError(res, 'VALIDATION_ERROR', message, 400);
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) logger.error({ err }, 'Non-operational error');
    sendError(res, err.code, err.message, err.statusCode);
    return;
  }

  logger.error({ err }, 'Unhandled error');
  sendError(res, 'INTERNAL_ERROR', 'Something went wrong', 500);
};
