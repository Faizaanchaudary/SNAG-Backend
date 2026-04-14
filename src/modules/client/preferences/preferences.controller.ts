import { Request, Response } from 'express';
import * as preferencesService from './preferences.service.js';
import { sendSuccess } from '@core/http/response.js';

export const getPreferences = async (req: Request, res: Response): Promise<void> => {
  const preferences = await preferencesService.getPreferences(req.user!.id);
  sendSuccess(res, preferences);
};

export const updatePreferences = async (req: Request, res: Response): Promise<void> => {
  const preferences = await preferencesService.updatePreferences(req.user!.id, req.body);
  sendSuccess(res, preferences, 'Preferences updated');
};
