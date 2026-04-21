import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as auditService from './audit.service.js';
import { validateQuery } from '@middleware/validation.js';
import { auditLogFilterSchema } from './audit.validation.js';

/**
 * List audit logs with pagination and filters
 * GET /admin/audit?userId=123&action=CREATE&resource=user&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=20
 */
export const listAuditLogs = [
  validateQuery(auditLogFilterSchema),
  async (req: Request, res: Response): Promise<void> => {
    const result = await auditService.listAuditLogs(req.query as any);
    sendSuccess(res, result, 'Audit logs retrieved successfully');
  },
];

/**
 * Get audit statistics
 * GET /admin/audit/stats
 */
export const getAuditStats = async (req: Request, res: Response): Promise<void> => {
  const stats = await auditService.getAuditStats();
  sendSuccess(res, stats, 'Audit statistics retrieved successfully');
};