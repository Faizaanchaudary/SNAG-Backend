import mongoose, { Document, Schema } from 'mongoose';

export interface IMerchantSettings {
  merchant: mongoose.Types.ObjectId;
  notifications: {
    email: {
      newRedemption: boolean;
      offerExpiring: boolean;
      weeklyReport: boolean;
      systemUpdates: boolean;
    };
    push: {
      newRedemption: boolean;
      offerExpiring: boolean;
      lowStock: boolean;
    };
    sms: {
      newRedemption: boolean;
      criticalAlerts: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantSettingsDocument extends IMerchantSettings, Document {}

const merchantSettingsSchema = new Schema<MerchantSettingsDocument>(
  {
    merchant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notifications: {
      email: {
        newRedemption: { type: Boolean, default: true },
        offerExpiring: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: true },
      },
      push: {
        newRedemption: { type: Boolean, default: true },
        offerExpiring: { type: Boolean, default: true },
        lowStock: { type: Boolean, default: false },
      },
      sms: {
        newRedemption: { type: Boolean, default: false },
        criticalAlerts: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true }
);

export const MerchantSettings = mongoose.model<MerchantSettingsDocument>(
  'MerchantSettings',
  merchantSettingsSchema
);
