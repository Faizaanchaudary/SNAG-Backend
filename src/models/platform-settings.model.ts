import mongoose, { Document, Schema } from 'mongoose';

export interface IPlatformSettings {
  business: {
    name: string;
    description?: string;
    website?: string;
    supportEmail?: string;
    supportPhone?: string;
  };
  appearance: {
    primaryColor?: string;
    secondaryColor?: string;
    logo?: string;
    favicon?: string;
  };
  security: {
    requireTwoFactor: boolean;
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    passwordMinLength: number;
  };
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    adminNotifications: {
      newUserRegistration: boolean;
      newMerchantRegistration: boolean;
      fraudAlert: boolean;
      systemError: boolean;
    };
  };
  features: {
    userRegistrationEnabled: boolean;
    merchantRegistrationEnabled: boolean;
    offerCreationEnabled: boolean;
    redemptionEnabled: boolean;
    maintenanceMode: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformSettingsDocument extends IPlatformSettings, Document {}

const platformSettingsSchema = new Schema<PlatformSettingsDocument>(
  {
    business: {
      name: { type: String, required: true, default: 'SNAG Platform' },
      description: { type: String },
      website: { type: String },
      supportEmail: { type: String },
      supportPhone: { type: String },
    },
    appearance: {
      primaryColor: { type: String, default: '#3b82f6' },
      secondaryColor: { type: String, default: '#10b981' },
      logo: { type: String },
      favicon: { type: String },
    },
    security: {
      requireTwoFactor: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 60 }, // minutes
      maxLoginAttempts: { type: Number, default: 5 },
      passwordMinLength: { type: Number, default: 8 },
    },
    notifications: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
      pushEnabled: { type: Boolean, default: true },
      adminNotifications: {
        newUserRegistration: { type: Boolean, default: true },
        newMerchantRegistration: { type: Boolean, default: true },
        fraudAlert: { type: Boolean, default: true },
        systemError: { type: Boolean, default: true },
      },
    },
    features: {
      userRegistrationEnabled: { type: Boolean, default: true },
      merchantRegistrationEnabled: { type: Boolean, default: true },
      offerCreationEnabled: { type: Boolean, default: true },
      redemptionEnabled: { type: Boolean, default: true },
      maintenanceMode: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const PlatformSettings = mongoose.model<PlatformSettingsDocument>(
  'PlatformSettings',
  platformSettingsSchema
);