import { z } from 'zod';
import { CLIENT_INTERESTS } from '@common/constants.js';

export const saveLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const saveInterestsSchema = z.object({
  interests: z
    .array(z.enum(CLIENT_INTERESTS))
    .min(1, 'Select at least one interest'),
});

export type SaveLocationDto  = z.infer<typeof saveLocationSchema>;
export type SaveInterestsDto = z.infer<typeof saveInterestsSchema>;
