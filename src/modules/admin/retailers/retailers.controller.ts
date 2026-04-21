import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as retailersService from './retailers.service.js';
import { validateBody } from '@middleware/validation.js';
import { updateRetailerSchema, createRetailerSchema } from './retailers.validation.js';

/**
 * List all retailers with pagination and search
 * GET /admin/retailers?q=search&page=1&limit=10
 */
export const listRetailers = async (req: Request, res: Response): Promise<void> => {
  const { q = '', page = 1, limit = 10 } = req.query;
  const result = await retailersService.listRetailers({
    q: q as string,
    page: Number(page),
    limit: Number(limit),
  });
  sendSuccess(res, result, 'Retailers retrieved successfully');
};

/**
 * Get retailer by ID
 * GET /admin/retailers/:id
 */
export const getRetailerById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const retailer = await retailersService.getRetailerById(id as string);
  sendSuccess(res, retailer, 'Retailer retrieved successfully');
};

/**
 * Create new retailer
 * POST /admin/retailers
 */
export const createRetailer = [
  validateBody(createRetailerSchema),
  async (req: Request, res: Response): Promise<void> => {
    const retailer = await retailersService.createRetailer(req.body);
    sendSuccess(res, retailer, 'Retailer created successfully', 201);
  },
];

/**
 * Update retailer
 * PUT /admin/retailers/:id
 */
export const updateRetailer = [
  validateBody(updateRetailerSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const retailer = await retailersService.updateRetailer(id as string, req.body);
    sendSuccess(res, retailer, 'Retailer updated successfully');
  },
];

/**
 * Delete retailer (soft delete)
 * DELETE /admin/retailers/:id
 */
export const deleteRetailer = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await retailersService.deleteRetailer(id as string);
  sendSuccess(res, { ok: true }, 'Retailer deleted successfully');
};

/**
 * Approve retailer
 * PATCH /admin/retailers/:id/approve
 */
export const approveRetailer = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const retailer = await retailersService.approveRetailer(id as string);
  sendSuccess(res, retailer, 'Retailer approved successfully');
};

/**
 * Reject retailer
 * PATCH /admin/retailers/:id/reject
 */
export const rejectRetailer = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const retailer = await retailersService.rejectRetailer(id as string);
  sendSuccess(res, retailer, 'Retailer rejected successfully');
};