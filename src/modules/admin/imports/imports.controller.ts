import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as importsService from './imports.service.js';
import { validateBody, validateQuery } from '@middleware/validation.js';
import { importOffersSchema } from './imports.validation.js';
import { z } from 'zod';

const listImportsSchema = z.object({
  type: z.enum(['offers', 'users', 'retailers']).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

/**
 * Import offers in bulk
 * POST /admin/imports/offers
 */
export const importOffers = [
  validateBody(importOffersSchema),
  async (req: Request, res: Response): Promise<void> => {
    const createdById = (req as any).user.id; // From auth middleware
    const result = await importsService.importOffers(req.body, createdById);
    sendSuccess(res, result, 'Import job started successfully', 202);
  },
];

/**
 * Get import job status
 * GET /admin/imports/:importId
 */
export const getImportStatus = async (req: Request, res: Response): Promise<void> => {
  const { importId } = req.params;
  const status = await importsService.getImportStatus(importId as string);
  sendSuccess(res, status, 'Import status retrieved successfully');
};

/**
 * List import jobs
 * GET /admin/imports?type=offers&status=completed&page=1&limit=20
 */
export const listImportJobs = [
  validateQuery(listImportsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await importsService.listImportJobs(req.query as any);
    sendSuccess(res, result, 'Import jobs retrieved successfully');
  },
];