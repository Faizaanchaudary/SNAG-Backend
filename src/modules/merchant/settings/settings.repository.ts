import mongoose from 'mongoose';
import { MerchantSettings, MerchantSettingsDocument } from '@models/MerchantSettings.js';

export const findByMerchant = async (merchantId: mongoose.Types.ObjectId): Promise<MerchantSettingsDocument | null> => {
  return MerchantSettings.findOne({ merchant: merchantId });
};

export const create = async (merchantId: mongoose.Types.ObjectId): Promise<MerchantSettingsDocument> => {
  return MerchantSettings.create({ merchant: merchantId });
};

export const update = async (
  merchantId: mongoose.Types.ObjectId,
  updates: Partial<MerchantSettingsDocument>
): Promise<MerchantSettingsDocument | null> => {
  return MerchantSettings.findOneAndUpdate(
    { merchant: merchantId },
    { $set: updates },
    { new: true, runValidators: true }
  );
};
