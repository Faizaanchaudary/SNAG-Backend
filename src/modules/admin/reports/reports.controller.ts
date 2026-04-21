import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as reportsService from './reports.service.js';

/**
 * Get user reports
 * GET /admin/reports/users?period=month&startDate=2024-01-01&endDate=2024-01-31
 */
export const getUserReports = async (req: Request, res: Response): Promise<void> => {
  const { period = 'month', startDate, endDate } = req.query;
  const report = await reportsService.getUserReports({
    period: period as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  sendSuccess(res, report, 'User reports retrieved successfully');
};

/**
 * Get merchant reports
 * GET /admin/reports/merchants?period=month&startDate=2024-01-01&endDate=2024-01-31
 */
export const getMerchantReports = async (req: Request, res: Response): Promise<void> => {
  const { period = 'month', startDate, endDate } = req.query;
  const report = await reportsService.getMerchantReports({
    period: period as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  sendSuccess(res, report, 'Merchant reports retrieved successfully');
};

/**
 * Get financial reports
 * GET /admin/reports/financials?period=month&startDate=2024-01-01&endDate=2024-01-31
 */
export const getFinancialReports = async (req: Request, res: Response): Promise<void> => {
  const { period = 'month', startDate, endDate } = req.query;
  const report = await reportsService.getFinancialReports({
    period: period as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  sendSuccess(res, report, 'Financial reports retrieved successfully');
};

/**
 * Get fraud reports
 * GET /admin/reports/fraud?period=month&startDate=2024-01-01&endDate=2024-01-31
 */
export const getFraudReports = async (req: Request, res: Response): Promise<void> => {
  const { period = 'month', startDate, endDate } = req.query;
  const report = await reportsService.getFraudReports({
    period: period as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  sendSuccess(res, report, 'Fraud reports retrieved successfully');
};

/**
 * Get offer reports
 * GET /admin/reports/offers?period=month&startDate=2024-01-01&endDate=2024-01-31
 */
export const getOfferReports = async (req: Request, res: Response): Promise<void> => {
  const { period = 'month', startDate, endDate } = req.query;
  const report = await reportsService.getOfferReports({
    period: period as string,
    startDate: startDate as string,
    endDate: endDate as string,
  });
  sendSuccess(res, report, 'Offer reports retrieved successfully');
};