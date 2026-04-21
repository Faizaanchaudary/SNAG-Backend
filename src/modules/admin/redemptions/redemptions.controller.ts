import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as redemptionsService from './redemptions.service.js';
import { validateQuery } from '@middleware/validation.js';
import { redemptionsFilterSchema } from './redemptions.validation.js';

/**
 * List redemptions with pagination and filters
 * GET /admin/redemptions?q=search&offerId=123&merchantId=456&clientId=789&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
 */
export const listRedemptions = [
  validateQuery(redemptionsFilterSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await redemptionsService.listRedemptions(req.query as any);
    sendSuccess(res, result, 'Redemptions retrieved successfully');
  },
];

/**
 * Get redemption by ID
 * GET /admin/redemptions/:id
 */
export const getRedemptionById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const redemption = await redemptionsService.getRedemptionById(id as string);
  sendSuccess(res, redemption, 'Redemption retrieved successfully');
};

/**
 * Get redemption statistics
 * GET /admin/redemptions/stats
 */
export const getRedemptionStats = async (req: Request, res: Response): Promise<void> => {
  const stats = await redemptionsService.getRedemptionStats();
  sendSuccess(res, stats, 'Redemption statistics retrieved successfully');
};