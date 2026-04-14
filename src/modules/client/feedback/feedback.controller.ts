import { Request, Response } from 'express';
import * as feedbackService from './feedback.service.js';
import { sendSuccess } from '@core/http/response.js';

export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  const result = await feedbackService.submitFeedback(req.user!.id, req.body);
  sendSuccess(res, result, 'Feedback submitted', 201);
};
