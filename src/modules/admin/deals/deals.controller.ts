import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as dealsService from './deals.service.js';
import { validateBody } from '@middleware/validation.js';
import { updateDealSchema, createDealSchema } from './deals.validation.js';

/**
 * List all deals with filtering and search
 * GET /admin/deals?q=search&status=live&category=Fashion&maxRadius=1000&page=1&limit=10
 */
export const listDeals = async (req: Request, res: Response): Promise<void> => {
  const {
    q = '',
    status,
    category,
    maxRadius,
    page = 1,
    limit = 20,
  } = req.query;

  const result = await dealsService.listDeals({
    q: q as string,
    status: status as string,
    category: category as string,
    maxRadius: maxRadius ? Number(maxRadius) : undefined,
    page: Number(page),
    limit: Number(limit),
  });

  sendSuccess(res, result, 'Deals retrieved successfully');
};

/**
 * Get deal by ID
 * GET /admin/deals/:id
 */
export const getDealById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const deal = await dealsService.getDealById(id as string);
  sendSuccess(res, deal, 'Deal retrieved successfully');
};

/**
 * Create new deal
 * POST /admin/deals
 */
export const createDeal = [
  validateBody(createDealSchema),
  async (req: Request, res: Response): Promise<void> => {
    const deal = await dealsService.createDeal(req.body);
    sendSuccess(res, deal, 'Deal created successfully', 201);
  },
];

/**
 * Update deal status and details
 * PUT /admin/deals/:id
 */
export const updateDeal = [
  validateBody(updateDealSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const deal = await dealsService.updateDeal(id as string, req.body);
    sendSuccess(res, deal, 'Deal updated successfully');
  },
];

/**
 * Approve deal
 * PATCH /admin/deals/:id/approve
 */
export const approveDeal = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const deal = await dealsService.approveDeal(id as string);
  sendSuccess(res, deal, 'Deal approved successfully');
};

/**
 * Reject deal
 * PATCH /admin/deals/:id/reject
 */
export const rejectDeal = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body;
  const deal = await dealsService.rejectDeal(id as string, reason);
  sendSuccess(res, deal, 'Deal rejected successfully');
};

/**
 * Flag deal for review
 * PATCH /admin/deals/:id/flag
 */
export const flagDeal = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reason } = req.body;
  const deal = await dealsService.flagDeal(id as string, reason);
  sendSuccess(res, deal, 'Deal flagged successfully');
};

/**
 * Archive deal
 * PATCH /admin/deals/:id/archive
 */
export const archiveDeal = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const deal = await dealsService.archiveDeal(id as string);
  sendSuccess(res, deal, 'Deal archived successfully');
};

/**
 * Delete deal (soft delete)
 * DELETE /admin/deals/:id
 */
export const deleteDeal = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await dealsService.deleteDeal(id as string);
  sendSuccess(res, { ok: true }, 'Deal deleted successfully');
};