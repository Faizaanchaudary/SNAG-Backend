import { z } from 'zod';

export const importOffersSchema = z.object({
  merchantId: z.string().min(1, 'Merchant ID is required'),
  offers: z.array(z.object({
    title: z.string().min(2).max(100).trim(),
    description: z.string().min(10).max(1000).trim(),
    offerType: z.enum(['in-store', 'online']),
    categories: z.array(z.string()).min(1),
    termsAndConditions: z.string().min(10).max(2000).trim(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    redemptionLimit: z.number().min(1).optional(),
  })).min(1, 'At least one offer is required'),
});

export const importStatusSchema = z.object({
  importId: z.string().min(1),
});

export type ImportOffersDto = z.infer<typeof importOffersSchema>;
export type ImportStatusDto = z.infer<typeof importStatusSchema>;