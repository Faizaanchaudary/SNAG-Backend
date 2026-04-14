import { Request, Response } from 'express';
import * as supportService from './support.service.js';
import { sendSuccess } from '@core/http/response.js';

export const submitSupportTicket = async (req: Request, res: Response): Promise<void> => {
  const result = await supportService.submitSupportTicket(req.user!.id, req.body);
  sendSuccess(res, result, 'Support ticket submitted', 201);
};
