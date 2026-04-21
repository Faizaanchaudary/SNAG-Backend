import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as dashboardService from './dashboard.service.js';

/**
 * Get admin dashboard KPIs
 * GET /admin/dashboard/kpis
 */
export const getKpis = async (req: Request, res: Response): Promise<void> => {
  const kpis = await dashboardService.getKpis();
  sendSuccess(res, kpis, 'KPIs retrieved successfully');
};

/**
 * Get platform sentiment distribution (user platform breakdown)
 * GET /admin/dashboard/sentiment
 */
export const getSentimentDistribution = async (req: Request, res: Response): Promise<void> => {
  const sentiment = await dashboardService.getSentimentDistribution();
  sendSuccess(res, sentiment, 'Sentiment distribution retrieved successfully');
};

/**
 * Get offers redeemed analytics with time filtering
 * GET /admin/dashboard/offers-redeemed?period=month&opt=Monday
 */
export const getOffersRedeemed = async (req: Request, res: Response): Promise<void> => {
  const { period = 'month', opt } = req.query;
  const data = await dashboardService.getOffersRedeemed(period as string, opt as string);
  sendSuccess(res, data, 'Offers redeemed data retrieved successfully');
};

/**
 * Get monthly revenue analytics with time filtering
 * GET /admin/dashboard/monthly-revenue?period=month&opt=Monday
 */
export const getMonthlyRevenue = async (req: Request, res: Response): Promise<void> => {
  const { period = 'month', opt } = req.query;
  const data = await dashboardService.getMonthlyRevenue(period as string, opt as string);
  sendSuccess(res, data, 'Monthly revenue data retrieved successfully');
};

/**
 * Get revenue split by offer category
 * GET /admin/dashboard/revenue-split?period=month&opt=Monday
 */
export const getRevenueSplit = async (req: Request, res: Response): Promise<void> => {
  const { period = 'month', opt } = req.query;
  const data = await dashboardService.getRevenueSplit(period as string, opt as string);
  sendSuccess(res, data, 'Revenue split data retrieved successfully');
};