import { z } from 'zod';
import { FEEDBACK_RATINGS } from '@models/feedback.model.js';

export const submitFeedbackSchema = z.object({
  offerId: z.string().min(1),
  rating:  z.enum([FEEDBACK_RATINGS.GOOD, FEEDBACK_RATINGS.BAD]),
  comment: z.string().max(500).trim().optional(),
});

export type SubmitFeedbackDto = z.infer<typeof submitFeedbackSchema>;
