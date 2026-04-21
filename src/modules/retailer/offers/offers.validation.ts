import { z } from 'zod';
import { OFFER_TYPES, OFFER_STATUSES, DISCOUNT_TYPES } from '@common/constants.js';

export const createOfferSchema = z.object({
  title:              z.string().min(2).max(200).trim(),
  description:        z.string().min(5).max(2000).trim(),
  offerType:          z.enum([OFFER_TYPES.IN_STORE, OFFER_TYPES.ONLINE]),
  categories:         z.array(z.string()).min(1),
  termsAndConditions: z.string().min(5).max(5000).trim(),
  discountType:       z.enum([DISCOUNT_TYPES.PERCENTAGE, DISCOUNT_TYPES.AMOUNT, DISCOUNT_TYPES.BUY_X_GET_Y]).optional(),
  couponCode:         z.string().trim().optional(),
  redemptionLimit:    z.number().int().positive().optional(),
  locationIds:        z.array(z.string()).optional(),
  startDate:          z.string().datetime().optional(),
  endDate:            z.string().datetime().optional(),
  targetAudience: z.object({
    demographics: z.array(z.string()).optional(),
    interests:    z.array(z.string()).optional(),
    behaviors:    z.array(z.string()).optional(),
    radiusKm:     z.number().positive().optional(),
  }).optional(),
});

export const updateOfferSchema = createOfferSchema.partial();

export const offersFilterSchema = z.object({
  status: z.enum([OFFER_STATUSES.ACTIVE, OFFER_STATUSES.EXPIRED, OFFER_STATUSES.SCHEDULED, OFFER_STATUSES.DRAFT]).optional(),
  search: z.string().optional(),
  page:   z.coerce.number().min(1).default(1),
  limit:  z.coerce.number().min(1).max(100).default(20),
});

export type CreateOfferDto  = z.infer<typeof createOfferSchema>;
export type UpdateOfferDto  = z.infer<typeof updateOfferSchema>;
export type OffersFilterDto = z.infer<typeof offersFilterSchema>;
