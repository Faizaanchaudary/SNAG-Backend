import { z } from 'zod';

export const preferencesSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }).optional(),
  language: z.string().min(2).max(10).optional(),
  distanceUnit: z.enum(['km', 'miles']).optional(),
  currency: z.string().length(3).optional(), // ISO 4217 currency codes
  privacy: z.object({
    showProfile: z.boolean(),
    shareLocation: z.boolean(),
  }).optional(),
});

export type PreferencesDto = z.infer<typeof preferencesSchema>;
