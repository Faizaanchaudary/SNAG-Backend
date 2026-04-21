import * as settingsRepository from './settings.repository.js';
import { UpdateSettingsDto } from './settings.validation.js';

/**
 * Get all platform settings
 */
export const getSettings = async () => {
  const settings = await settingsRepository.getSettings();
  
  // Return default settings if none exist
  if (!settings) {
    return getDefaultSettings();
  }
  
  return {
    business: settings.business || getDefaultSettings().business,
    appearance: settings.appearance || getDefaultSettings().appearance,
    security: settings.security || getDefaultSettings().security,
    notifications: settings.notifications || getDefaultSettings().notifications,
    features: settings.features || getDefaultSettings().features,
    updatedAt: settings.updatedAt,
  };
};

/**
 * Update platform settings
 */
export const updateSettings = async (dto: UpdateSettingsDto) => {
  const currentSettings = await settingsRepository.getSettings();
  
  // Merge with existing settings
  const updatedSettings = {
    business: { ...currentSettings?.business, ...dto.business },
    appearance: { ...currentSettings?.appearance, ...dto.appearance },
    security: { ...currentSettings?.security, ...dto.security },
    notifications: { ...currentSettings?.notifications, ...dto.notifications },
    features: { ...currentSettings?.features, ...dto.features },
  };
  
  return await settingsRepository.updateSettings(updatedSettings);
};

/**
 * Get admin controls settings
 */
export const getAdminControls = async () => {
  const settings = await getSettings();
  
  return {
    features: settings.features,
    security: settings.security,
    notifications: settings.notifications.adminNotifications,
  };
};

/**
 * Update admin controls settings
 */
export const updateAdminControls = async (dto: any) => {
  const currentSettings = await settingsRepository.getSettings();
  
  const updatedSettings = {
    ...currentSettings,
    features: { ...currentSettings?.features, ...dto.features },
    security: { ...currentSettings?.security, ...dto.security },
    notifications: {
      ...currentSettings?.notifications,
      adminNotifications: { ...currentSettings?.notifications?.adminNotifications, ...dto.notifications },
    },
  };
  
  return await settingsRepository.updateSettings(updatedSettings);
};

/**
 * Get default settings
 */
function getDefaultSettings() {
  return {
    business: {
      name: 'SNAG Platform',
      description: 'Location-based offers platform',
      website: 'https://snag.com',
      supportEmail: 'support@snag.com',
      supportPhone: '+1-555-0123',
    },
    appearance: {
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      logo: null,
      favicon: null,
    },
    security: {
      requireTwoFactor: false,
      sessionTimeout: 60, // minutes
      maxLoginAttempts: 5,
      passwordMinLength: 8,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      adminNotifications: {
        newUserRegistration: true,
        newMerchantRegistration: true,
        fraudAlert: true,
        systemError: true,
      },
    },
    features: {
      userRegistrationEnabled: true,
      merchantRegistrationEnabled: true,
      offerCreationEnabled: true,
      redemptionEnabled: true,
      maintenanceMode: false,
    },
  };
}