import { z } from 'zod';

export const createRuleSchema = z.object({
  name:                  z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  description:           z.string().max(500).trim().optional(),
  scope:                 z.enum(['global', 'retailer']).default('global'),
  retailerId:            z.string().optional().nullable(),
  maxLiveOffersPerStore: z.coerce.number().int().min(0).optional(),
  maxDurationDays:       z.coerce.number().int().min(0).optional(),
  allowOpenEnded:        z.coerce.boolean().default(false),
  enabled:               z.coerce.boolean().default(true),
}).refine(
  (data) => data.scope !== 'retailer' || !!data.retailerId,
  { message: 'Merchant ID is required when scope is retailer', path: ['retailerId'] }
);

// Update schema - same fields but all optional, no cross-field refine needed
export const updateRuleSchema = z.object({
  name:                  z.string().min(2).max(100).trim().optional(),
  description:           z.string().max(500).trim().optional(),
  scope:                 z.enum(['global', 'retailer']).optional(),
  retailerId:            z.string().optional().nullable(),
  maxLiveOffersPerStore: z.coerce.number().int().min(0).optional(),
  maxDurationDays:       z.coerce.number().int().min(0).optional(),
  allowOpenEnded:        z.coerce.boolean().optional(),
  enabled:               z.coerce.boolean().optional(),
});

export const rulesFilterSchema = z.object({
  page:  z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type CreateRuleDto  = z.infer<typeof createRuleSchema>;
export type UpdateRuleDto  = z.infer<typeof updateRuleSchema>;
export type RulesFilterDto = z.infer<typeof rulesFilterSchema>;