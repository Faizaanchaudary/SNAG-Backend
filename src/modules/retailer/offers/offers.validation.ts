import { z } from 'zod';
import { OFFER_TYPES, OFFER_STATUSES, DISCOUNT_TYPES } from '@common/constants.js';

export const offersFilterSchema = z.object({
  page:    z.coerce.number().min(1).default(1),
  limit:   z.coerce.number().min(1).max(100).default(20),
  search:  z.string().trim().optional(),
  status:  z.enum([OFFER_STATUSES.ACTIVE, OFFER_STATUSES.EXPIRED, OFFER_STATUSES.SCHEDULED, OFFER_STATUSES.DRAFT]).optional(),
  merchantId: z.string().optional(),
});

export const createOfferSchema = z.object({
  merchantId:         z.string().min(1, 'Merchant is required'),
  title:              z.string().min(3, 'Title must be at least 3 characters').max(200).trim(),
  description:        z.string().min(10, 'Description must be at least 10 characters').max(1000).trim(),
  offerType:          z.enum([OFFER_TYPES.IN_STORE, OFFER_TYPES.ONLINE]),
  categories:         z.array(z.string()).default([]),
  status:             z.enum([OFFER_STATUSES.ACTIVE, OFFER_STATUSES.EXPIRED, OFFER_STATUSES.SCHEDULED, OFFER_STATUSES.DRAFT]).default(OFFER_STATUSES.ACTIVE),
  termsAndConditions: z.string().min(5, 'Terms and conditions must be at least 5 characters').max(2000).trim(),
  startDate:          z.string().datetime().optional(),
  endDate:            z.string().datetime().optional(),
  discountType:       z.enum([DISCOUNT_TYPES.PERCENTAGE, DISCOUNT_TYPES.AMOUNT]).optional(),
  couponCode:         z.string().max(50).trim().optional(),
  redemptionLimit:    z.coerce.number().int().min(1).optional(),
});

export const updateOfferSchema = createOfferSchema.omit({ merchantId: true }).partial();

export type OffersFilterDto = z.infer<typeof offersFilterSchema>;
export type CreateOfferDto  = z.infer<typeof createOfferSchema>;
export type UpdateOfferDto  = z.infer<typeof updateOfferSchema>;