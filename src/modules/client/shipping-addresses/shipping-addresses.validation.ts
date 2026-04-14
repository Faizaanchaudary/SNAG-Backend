import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).trim(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  addressLine1: z.string().min(5, 'Address must be at least 5 characters').max(200).trim(),
  addressLine2: z.string().max(200).trim().optional(),
  city: z.string().min(2).max(100).trim(),
  state: z.string().min(2).max(100).trim(),
  zipCode: z.string().min(3).max(20).trim(),
  country: z.string().min(2).max(100).trim(),
  isDefault: z.boolean().default(false),
});

export type ShippingAddressDto = z.infer<typeof shippingAddressSchema>;
