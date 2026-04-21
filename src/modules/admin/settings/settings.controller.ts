import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as settingsService from './settings.service.js';
import { validateBody } from '@middleware/validation.js';
import { updateSettingsSchema } from './settings.validation.js';

/**
 * Get all platform settings
 * GET /admin/settings
 */
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  const settings = await settingsService.getSettings();
  sendSuccess(res, settings, 'Settings retrieved successfully');
};

/**
 * Update platform settings
 * PUT /admin/settings
 */
export const updateSettings = [
  validateBody(updateSettingsSchema),
  async (req: Request, res: Response): Promise<void> => {
    const settings = await settingsService.updateSettings(req.body);
    sendSuccess(res, settings, 'Settings updated successfully');
  },
];

/**
 * Get admin controls settings
 * GET /admin/settings/admin-controls
 */
export const getAdminControls = async (req: Request, res: Response): Promise<void> => {
  const controls = await settingsService.getAdminControls();
  sendSuccess(res, controls, 'Admin controls retrieved successfully');
};

/**
 * Update admin controls settings
 * PUT /admin/settings/admin-controls
 */
export const updateAdminControls = async (req: Request, res: Response): Promise<void> => {
  const controls = await settingsService.updateAdminControls(req.body);
  sendSuccess(res, controls, 'Admin controls updated successfully');
};