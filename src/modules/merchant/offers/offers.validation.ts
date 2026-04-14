import { z } from 'zod';
import { OFFER_TYPES, OFFER_STATUSES, DISCOUNT_TYPES } from '@common/constants.js';

// ── Tab 1: Basic Info ─────────────────────────────────────────────────────────

export const basicInfoSchema = z.object({
  title:              z.string().min(3).max(200).trim(),
  description:        z.string().min(10).max(1000).trim(),
  offerType:          z.enum([OFFER_TYPES.IN_STORE, OFFER_TYPES.ONLINE]),
  categories:         z.array(z.string()).default([]),
  status:             z.enum([OFFER_STATUSES.ACTIVE, OFFER_STATUSES.EXPIRED, OFFER_STATUSES.SCHEDULED, OFFER_STATUSES.DRAFT])
                       .default(OFFER_STATUSES.ACTIVE),
  termsAndConditions: z.string().min(5).max(2000).trim(),
  startDate:          z.string().datetime().optional(),
  endDate:            z.string().datetime().optional(),
});

// ── Tab 2: Scan Info ──────────────────────────────────────────────────────────

export const scanInfoSchema = z.object({
  discountType:    z.enum([DISCOUNT_TYPES.PERCENTAGE, DISCOUNT_TYPES.AMOUNT, DISCOUNT_TYPES.BUY_X_GET_Y]).optional(),
  redemptionUrl:   z.string().url().optional().or(z.literal('')),
  couponCode:      z.string().max(50).trim().optional(),
  redemptionLimit: z.coerce.number().int().min(1).optional(),
});

// ── Tab 3: Location Info ──────────────────────────────────────────────────────

export const locationInfoSchema = z.object({
  locationIds: z.array(z.string().min(1)).min(1, 'Select at least one location'),
});

// ── Target Audience ───────────────────────────────────────────────────────────

export const targetAudienceSchema = z.object({
  demographics: z.array(z.string()).default([]),
  interests:    z.array(z.string()).default([]),
  behaviors:    z.array(z.string()).default([]),
  radiusKm:     z.coerce.number().min(1).max(100).optional(),
});

// ── Combined edit (Edit Offer screen — Save Details button) ──────────────────

export const editOfferSchema = basicInfoSchema.partial().merge(
  scanInfoSchema.partial().merge(
    locationInfoSchema.partial()
  )
);

// ── Filters ───────────────────────────────────────────────────────────────────

export const offersFilterSchema = z.object({
  status:     z.enum([OFFER_STATUSES.ACTIVE, OFFER_STATUSES.EXPIRED, OFFER_STATUSES.SCHEDULED, OFFER_STATUSES.DRAFT]).optional(),
  offerType:  z.enum([OFFER_TYPES.IN_STORE, OFFER_TYPES.ONLINE]).optional(),
  keyword:    z.string().trim().optional(),
  locationId: z.string().trim().optional(),
  location:   z.string().trim().optional(), // Search by location name/address
  category:   z.string().trim().optional(), // Search by category
  startDate:  z.string().datetime().optional(),
  endDate:    z.string().datetime().optional(),
});

export type OffersFilterDto   = z.infer<typeof offersFilterSchema>;
export type BasicInfoDto      = z.infer<typeof basicInfoSchema>;
export type ScanInfoDto       = z.infer<typeof scanInfoSchema>;
export type LocationInfoDto   = z.infer<typeof locationInfoSchema>;
export type TargetAudienceDto = z.infer<typeof targetAudienceSchema>;
export type EditOfferDto      = z.infer<typeof editOfferSchema>;
