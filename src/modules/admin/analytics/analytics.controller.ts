import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as analyticsService from './analytics.service.js';

/**
 * Get analytics KPIs with date range filtering
 * GET /admin/analytics/kpis?startDate=2024-01-01&endDate=2024-01-31
 */
export const getKpis = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  const kpis = await analyticsService.getKpis({
    startDate: startDate as string,
    endDate: endDate as string,
  });
  sendSuccess(res, kpis, 'Analytics KPIs retrieved successfully');
};

/**
 * Get transaction history with filters
 * GET /admin/analytics/transactions?type=payment&status=succeeded&method=card&location=l1&page=1&limit=20
 */
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  const {
    type,
    status,
    method,
    location,
    startDate,
    endDate,
    page = 1,
    limit = 20,
  } = req.query;

  const result = await analyticsService.getTransactions({
    type: type as string,
    status: status as string,
    method: method as string,
    location: location as string,
    startDate: startDate as string,
    endDate: endDate as string,
    page: Number(page),
    limit: Number(limit),
  });

  sendSuccess(res, result, 'Transactions retrieved successfully');
};

/**
 * Export transactions as CSV
 * GET /admin/analytics/transactions.csv?startDate=2024-01-01&endDate=2024-01-31
 */
export const exportTransactionsCsv = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate, type, status, method, location } = req.query;
  
  const csvData = await analyticsService.exportTransactionsCsv({
    startDate: startDate as string,
    endDate: endDate as string,
    type: type as string,
    status: status as string,
    method: method as string,
    location: location as string,
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
  res.send(csvData);
};