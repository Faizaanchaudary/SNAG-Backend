import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as invitesService from './invites.service.js';
import { validateBody } from '@middleware/validation.js';
import { createInviteSchema, updateInviteSchema } from './invites.validation.js';

/**
 * List all invites with pagination and search
 * GET /admin/invites?q=search&status=pending&page=1&limit=10
 */
export const listInvites = async (req: Request, res: Response): Promise<void> => {
  const { q = '', status, page = 1, limit = 10 } = req.query;
  const result = await invitesService.listInvites({
    q: q as string,
    status: status as string,
    page: Number(page),
    limit: Number(limit),
  });
  sendSuccess(res, result, 'Invites retrieved successfully');
};

/**
 * Get invite by ID
 * GET /admin/invites/:id
 */
export const getInviteById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const invite = await invitesService.getInviteById(id as string);
  sendSuccess(res, invite, 'Invite retrieved successfully');
};

/**
 * Create new invite
 * POST /admin/invites
 */
export const createInvite = [
  validateBody(createInviteSchema),
  async (req: Request, res: Response): Promise<void> => {
    const invitedById = (req as any).user.id; // From auth middleware
    const invite = await invitesService.createInvite(req.body, invitedById);
    sendSuccess(res, invite, 'Invite created successfully', 201);
  },
];

/**
 * Update invite
 * PUT /admin/invites/:id
 */
export const updateInvite = [
  validateBody(updateInviteSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const invite = await invitesService.updateInvite(id as string, req.body);
    sendSuccess(res, invite, 'Invite updated successfully');
  },
];

/**
 * Cancel invite
 * PATCH /admin/invites/:id/cancel
 */
export const cancelInvite = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const invite = await invitesService.cancelInvite(id as string);
  sendSuccess(res, invite, 'Invite cancelled successfully');
};

/**
 * Delete invite
 * DELETE /admin/invites/:id
 */
export const deleteInvite = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await invitesService.deleteInvite(id as string);
  sendSuccess(res, { ok: true }, 'Invite deleted successfully');
};