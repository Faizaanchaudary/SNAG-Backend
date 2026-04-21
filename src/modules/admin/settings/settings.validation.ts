import { z } from 'zod';

export const updateSettingsSchema = z.object({
  business: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    website: z.string().url().optional(),
    supportEmail: z.string().email().optional(),
    supportPhone: z.string().optional(),
  }).optional(),
  
  appearance: z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    logo: z.string().url().optional(),
    favicon: z.string().url().optional(),
  }).optional(),
  
  security: z.object({
    requireTwoFactor: z.boolean().optional(),
    sessionTimeout: z.number().min(5).max(1440).optional(), // 5 minutes to 24 hours
    maxLoginAttempts: z.number().min(3).max(10).optional(),
    passwordMinLength: z.number().min(6).max(32).optional(),
  }).optional(),
  
  notifications: z.object({
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    adminNotifications: z.object({
      newUserRegistration: z.boolean().optional(),
      newMerchantRegistration: z.boolean().optional(),
      fraudAlert: z.boolean().optional(),
      systemError: z.boolean().optional(),
    }).optional(),
  }).optional(),
  
  features: z.object({
    userRegistrationEnabled: z.boolean().optional(),
    merchantRegistrationEnabled: z.boolean().optional(),
    offerCreationEnabled: z.boolean().optional(),
    redemptionEnabled: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
  }).optional(),
});

export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;