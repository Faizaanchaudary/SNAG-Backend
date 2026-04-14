import mongoose from 'mongoose';
import * as merchantSettingsRepo from './settings.repository.js';
import { MerchantSettingsDocument } from '@models/MerchantSettings.js';

export const getSettings = async (merchantId: mongoose.Types.ObjectId): Promise<MerchantSettingsDocument> => {
  let settings = await merchantSettingsRepo.findByMerchant(merchantId);

  // Create default settings if not exists (upsert pattern)
  if (!settings) {
    settings = await merchantSettingsRepo.create(merchantId);
  }

  return settings;
};

export const updateSettings = async (
  merchantId: mongoose.Types.ObjectId,
  updates: Partial<MerchantSettingsDocument>
): Promise<MerchantSettingsDocument> => {
  // Ensure settings exist first
  await getSettings(merchantId);

  const updatedSettings = await merchantSettingsRepo.update(merchantId, updates);
  if (!updatedSettings) {
    throw new Error('Failed to update settings');
  }

  return updatedSettings;
};
