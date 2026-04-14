import { z } from 'zod';
import { OFFER_TYPES, OFFER_STATUSES } from '@common/constants.js';

export const discoverOffersSchema = z.object({
  lat:       z.coerce.number().min(-90).max(90).optional(),
  lng:       z.coerce.number().min(-180).max(180).optional(),
  radiusKm:  z.coerce.number().min(0.1).max(500).optional(),
  category:  z.string().trim().optional(),
  keyword:   z.string().trim().optional(),
  offerType: z.enum([OFFER_TYPES.IN_STORE, OFFER_TYPES.ONLINE]).optional(),
  brand:     z.string().trim().optional(),
  startDate: z.string().datetime().optional(),
  endDate:   z.string().datetime().optional(),
});

export const myOffersFilterSchema = z.object({
  keyword:   z.string().trim().optional(),
  offerType: z.enum([OFFER_TYPES.IN_STORE, OFFER_TYPES.ONLINE]).optional(),
  status:    z.enum([OFFER_STATUSES.ACTIVE, OFFER_STATUSES.EXPIRED, OFFER_STATUSES.SCHEDULED]).optional(),
  category:  z.string().trim().optional(),
  startDate: z.string().datetime().optional(),
  endDate:   z.string().datetime().optional(),
});

export const savedOffersFilterSchema = z.object({
  keyword:   z.string().trim().optional(),
  offerType: z.enum([OFFER_TYPES.IN_STORE, OFFER_TYPES.ONLINE]).optional(),
  category:  z.string().trim().optional(),
  brand:     z.string().trim().optional(),
});

export type DiscoverOffersDto   = z.infer<typeof discoverOffersSchema>;
export type MyOffersFilterDto   = z.infer<typeof myOffersFilterSchema>;
export type SavedOffersFilterDto = z.infer<typeof savedOffersFilterSchema>;
