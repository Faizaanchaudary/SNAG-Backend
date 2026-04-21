import { z } from 'zod';
import { LOCATION_TYPES } from '@models/location.model.js';

export const createStoreSchema = z.object({
  address:       z.string().min(2).trim(),
  state:         z.string().min(2).trim(),
  country:       z.string().min(2).trim(),
  branchAddress: z.string().min(2).trim(),
  locationType:  z.enum([LOCATION_TYPES.MAIN, LOCATION_TYPES.FRANCHISE]),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  branchInfo: z.object({
    phoneNumber: z.string().optional(),
    email:       z.string().email().optional(),
    contactName: z.string().optional(),
  }).optional(),
});

export const updateStoreSchema = createStoreSchema.partial();

export type CreateStoreDto = z.infer<typeof createStoreSchema>;
export type UpdateStoreDto = z.infer<typeof updateStoreSchema>;
