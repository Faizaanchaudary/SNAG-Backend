import { Request, Response } from 'express';
import * as scorecardService from './scorecard.service.js';
import { sendSuccess } from '@core/http/response.js';

export const getScorecard = async (req: Request, res: Response): Promise<void> => {
  const scorecard = await scorecardService.getScorecard(req.user!.id);
  sendSuccess(res, scorecard);
};
