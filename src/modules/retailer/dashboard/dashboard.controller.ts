import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as dashboardService from './dashboard.service.js';
import { TopOffersQueryDto, ActivityQueryDto } from './dashboard.validation.js';

/** GET /retailer/dashboard/summary */
export const getSummary = async (req: Request, res: Response): Promise<void> => {
  const data = await dashboardService.getSummary(req.user!.id);
  sendSuccess(res, data, 'Dashboard summary retrieved');
};

/** GET /retailer/dashboard/views-impressions */
export const getViewsAndImpressions = async (req: Request, res: Response): Promise<void> => {
  const data = await dashboardService.getViewsAndImpressions(req.user!.id);
  sendSuccess(res, data, 'Views and impressions retrieved');
};

/** GET /retailer/dashboard/redemptions */
export const getRedemptions = async (req: Request, res: Response): Promise<void> => {
  const data = await dashboardService.getRedemptions(req.user!.id);
  sendSuccess(res, data, 'Redemptions retrieved');
};

/** GET /retailer/dashboard/top-offers */
export const getTopOffers = async (req: Request, res: Response): Promise<void> => {
  const { limit } = req.query as unknown as TopOffersQueryDto;
  const data = await dashboardService.getTopOffers(req.user!.id, limit);
  sendSuccess(res, data, 'Top offers retrieved');
};

/** GET /retailer/dashboard/activity */
export const getActivity = async (req: Request, res: Response): Promise<void> => {
  const { limit } = req.query as unknown as ActivityQueryDto;
  const data = await dashboardService.getActivity(req.user!.id, limit);
  sendSuccess(res, data, 'Activity feed retrieved');
};
