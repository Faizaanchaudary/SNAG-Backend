import { Request, Response } from 'express';
import * as analyticsService from './analytics.service.js';
import { sendSuccess } from '@core/http/response.js';

export const getHomeStats = async (req: Request, res: Response): Promise<void> => {
  const result = await analyticsService.getHomeStats(req.user!.id, req.query as any);
  sendSuccess(res, result);
};

export const getSummaryStats = async (req: Request, res: Response): Promise<void> => {
  const result = await analyticsService.getSummaryStats(req.user!.id, req.query as any);
  sendSuccess(res, result);
};

export const getOffersAnalytics = async (req: Request, res: Response): Promise<void> => {
  const result = await analyticsService.getOffersAnalytics(req.user!.id, req.query as any);
  sendSuccess(res, result);
};

export const getUsersAnalytics = async (req: Request, res: Response): Promise<void> => {
  const result = await analyticsService.getUsersAnalytics(req.user!.id, req.query as any);
  sendSuccess(res, result);
};
