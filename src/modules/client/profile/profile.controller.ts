import { Request, Response } from 'express';
import * as profileService from './profile.service.js';
import { sendSuccess } from '@core/http/response.js';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const profile = await profileService.getProfile(req.user!.id);
  sendSuccess(res, profile);
};

export const updateInterests = async (req: Request, res: Response): Promise<void> => {
  const profile = await profileService.updateInterests(req.user!.id, req.body);
  sendSuccess(res, profile, 'Preferences updated');
};

export const updateAvatar = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Image file is required' } });
    return;
  }
  const profile = await profileService.updateAvatar(req.user!.id, req.file);
  sendSuccess(res, profile, 'Avatar updated');
};
