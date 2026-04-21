import { z } from 'zod';
import { OFFER_STATUSES } from '@common/constants.js';

// Add admin-specific statuses that map to existing offer statuses
export const ADMIN_DEAL_STATUSES = {
  // Core offer statuses
  ACTIVE: OFFER_STATUSES.ACTIVE,
  DRAFT: OFFER_STATUSES.DRAFT,
  EXPIRED: OFFER_STATUSES.EXPIRED,
  SCHEDULED: OFFER_STATUSES.SCHEDULED,
  // Admin-friendly aliases
  LIVE: 'live',
  PUBLISHED: 'published',
  NEEDS_APPROVAL: 'needs-approval',
  FLAGGED: 'flagged',
  ARCHIVED: 'archived',
} as const;

export const createDealSchema = z.object({
  merchantId: z.string().min(1, 'Merchant ID is required'),
  title: z.string().min(2).max(100).trim(),
  description: z.string().min(10).max(1000).trim(),
  offerType: z.enum(['in-store', 'online']),
  categories: z.array(z.string()).min(1, 'At least one category is required'),
  termsAndConditions: z.string().min(10).max(2000).trim(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  redemptionLimit: z.number().min(1).optional(),
  targetAudience: z.object({
    demographics: z.array(z.string()).default([]),
    interests: z.array(z.string()).default([]),
    behaviors: z.array(z.string()).default([]),
    radiusKm: z.number().min(0.1).max(100).optional(),
  }).optional(),
});

export const updateDealSchema = z.object({
  title: z.string().min(2).max(100).trim().optional(),
  description: z.string().min(10).max(1000).trim().optional(),
  status: z.enum([
    ADMIN_DEAL_STATUSES.ACTIVE,
    ADMIN_DEAL_STATUSES.DRAFT,
    ADMIN_DEAL_STATUSES.EXPIRED,
    ADMIN_DEAL_STATUSES.SCHEDULED,
    ADMIN_DEAL_STATUSES.LIVE,
    ADMIN_DEAL_STATUSES.PUBLISHED,
    ADMIN_DEAL_STATUSES.NEEDS_APPROVAL,
    ADMIN_DEAL_STATUSES.FLAGGED,
    ADMIN_DEAL_STATUSES.ARCHIVED,
  ]).optional(),
  categories: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  redemptionLimit: z.number().min(1).optional(),
  termsAndConditions: z.string().min(10).max(2000).trim().optional(),
});

export type CreateDealDto = z.infer<typeof createDealSchema>;
export type UpdateDealDto = z.infer<typeof updateDealSchema>;