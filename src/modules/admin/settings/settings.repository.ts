import { PlatformSettings } from '@models/platform-settings.model.js';

/**
 * Get platform settings
 */
export const getSettings = async () => {
  return await PlatformSettings.findOne().exec();
};

/**
 * Update platform settings (upsert)
 */
export const updateSettings = async (settings: any) => {
  return await PlatformSettings.findOneAndUpdate(
    {},
    settings,
    { upsert: true, new: true }
  ).exec();
};