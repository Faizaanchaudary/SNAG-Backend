import { z } from 'zod';
import { LOCATION_TYPES } from '@models/location.model.js';
import { INDUSTRIES } from '@common/constants.js';

export const branchProfileSchema = z.object({
  branchName:    z.string().min(2).max(100).trim(),
  phoneNumber:   z.string().min(5).max(20).trim(),
  branchAddress: z.string().min(5).max(200).trim(),
  industry:      z.enum(INDUSTRIES),
  subCategories: z.array(z.string().min(1).max(100)).min(1),
  role:          z.string().trim().optional(),
});

export const addLocationSchema = z.object({
  address:       z.string().min(2).max(200).trim(),
  state:         z.string().min(1).max(100).trim(),
  country:       z.string().min(1).max(100).trim(),
  branchAddress: z.string().min(2).max(200).trim(),
  locationType:  z.enum([LOCATION_TYPES.MAIN, LOCATION_TYPES.FRANCHISE]),
  coordinates: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
  branchInfo: z.object({
    phoneNumber: z.string().min(5).max(20).trim(),
    email:       z.string().email().toLowerCase().trim(),
  }),
});

export const branchInfoSchema = z.object({
  locationId:  z.string().min(1),
  phoneNumber: z.string().min(5).max(20).trim(),
  email:       z.string().email().toLowerCase().trim(),
  contactName: z.string().min(2).max(100).trim(),
});

export const saveMerchantLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const bulkUploadSchema = z.object({
  notes: z.string().max(500).optional(),
});

// Shape expected per CSV row
export const csvLocationRowSchema = z.object({
  address:       z.string().min(1),
  state:         z.string().min(1),
  country:       z.string().min(1),
  branchAddress: z.string().min(1),
  locationType:  z.enum([LOCATION_TYPES.MAIN, LOCATION_TYPES.FRANCHISE]),
  lat:           z.coerce.number().min(-90).max(90),
  lng:           z.coerce.number().min(-180).max(180),
  phoneNumber:   z.string().min(1),
  email:         z.string().email(),
  contactName:   z.string().min(1),
});

export const editLocationSchema = z.object({
  address:       z.string().min(2).max(200).trim().optional(),
  state:         z.string().min(1).max(100).trim().optional(),
  country:       z.string().min(1).max(100).trim().optional(),
  branchAddress: z.string().min(2).max(200).trim().optional(),
  locationType:  z.enum([LOCATION_TYPES.MAIN, LOCATION_TYPES.FRANCHISE]).optional(),
  coordinates: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }).optional(),
  branchInfo: z.object({
    phoneNumber: z.string().min(5).max(20).trim().optional(),
    email:       z.string().email().toLowerCase().trim().optional(),
  }).optional(),
});

export type BranchProfileDto        = z.infer<typeof branchProfileSchema>;
export type AddLocationDto          = z.infer<typeof addLocationSchema>;
export type BranchInfoDto           = z.infer<typeof branchInfoSchema>;
export type SaveMerchantLocationDto = z.infer<typeof saveMerchantLocationSchema>;
export type EditLocationDto         = z.infer<typeof editLocationSchema>;
export type CsvLocationRow          = z.infer<typeof csvLocationRowSchema>;
