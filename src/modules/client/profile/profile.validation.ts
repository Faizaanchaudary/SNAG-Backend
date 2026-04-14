import { z } from 'zod';
import { CLIENT_INTERESTS } from '@common/constants.js';

export const updateInterestsSchema = z.object({
  interests: z.array(z.enum(CLIENT_INTERESTS)).min(1),
});

export type UpdateInterestsDto = z.infer<typeof updateInterestsSchema>;
