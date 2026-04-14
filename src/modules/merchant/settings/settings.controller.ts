import { Request, Response, NextFunction } from 'express';
import * as merchantSettingsService from './settings.service.js';
import { sendSuccess } from '@core/http/response.js';
import mongoose from 'mongoose';

export const getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const merchantId = new mongoose.Types.ObjectId(req.user!.id);
    const settings = await merchantSettingsService.getSettings(merchantId);
    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const merchantId = new mongoose.Types.ObjectId(req.user!.id);
    const settings = await merchantSettingsService.updateSettings(merchantId, req.body);
    sendSuccess(res, settings, 'Settings updated successfully');
  } catch (error) {
    next(error);
  }
};
