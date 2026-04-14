import { Request, Response } from 'express';
import * as onboardingService from './onboarding.service.js';
import { sendSuccess } from '@core/http/response.js';

export const saveLocation = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.saveLocation(req.user!.id, req.body);
  sendSuccess(res, result, 'Location saved');
};

export const saveInterests = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.saveInterests(req.user!.id, req.body);
  sendSuccess(res, result, 'Interests saved');
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Image file is required' } });
    return;
  }
  const result = await onboardingService.uploadAvatar(req.user!.id, req.file);
  sendSuccess(res, result, 'Profile picture uploaded');
};

export const completeOnboarding = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.completeOnboarding(req.user!.id);
  sendSuccess(res, result, "You're all set");
};
