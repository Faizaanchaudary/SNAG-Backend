import { z } from 'zod';
import { SUPPORT_SUBJECTS } from '@models/support-ticket.model.js';

export const submitSupportSchema = z.object({
  email:         z.string().email().trim().toLowerCase(),
  phoneNumber:   z.string().min(5).max(20).trim(),
  subject:       z.enum(SUPPORT_SUBJECTS),
  message:       z.string().min(10).max(2000).trim(),
  attachmentUrl: z.string().url().optional(),
});

export type SubmitSupportDto = z.infer<typeof submitSupportSchema>;
