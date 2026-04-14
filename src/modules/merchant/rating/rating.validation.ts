import { z } from 'zod';

export const submitRatingSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).trim().optional(),
});

export type SubmitRatingDto = z.infer<typeof submitRatingSchema>;
