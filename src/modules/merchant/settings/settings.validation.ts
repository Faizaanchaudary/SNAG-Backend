import { z } from 'zod';

export const updateMerchantSettingsSchema = z.object({
  notifications: z.object({
    email: z.object({
      newRedemption: z.boolean().optional(),
      offerExpiring: z.boolean().optional(),
      weeklyReport: z.boolean().optional(),
      systemUpdates: z.boolean().optional(),
    }).optional(),
    push: z.object({
      newRedemption: z.boolean().optional(),
      offerExpiring: z.boolean().optional(),
      lowStock: z.boolean().optional(),
    }).optional(),
    sms: z.object({
      newRedemption: z.boolean().optional(),
      criticalAlerts: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

export type UpdateMerchantSettingsDto = z.infer<typeof updateMerchantSettingsSchema>;
