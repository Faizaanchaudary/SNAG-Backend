import { Request, Response } from 'express';
import * as ratingService from './rating.service.js';
import { sendSuccess } from '@core/http/response.js';

export const submitRating = async (req: Request, res: Response): Promise<void> => {
  const merchantId = Array.isArray(req.params.merchantId) 
    ? req.params.merchantId[0] 
    : req.params.merchantId;
  const result = await ratingService.submitRating(merchantId, req.body);
  sendSuccess(res, result, 'Rating submitted successfully', 201);
};

export const getMerchantRating = async (req: Request, res: Response): Promise<void> => {
  const merchantId = Array.isArray(req.params.merchantId) 
    ? req.params.merchantId[0] 
    : req.params.merchantId;
  const result = await ratingService.getMerchantRating(merchantId);
  sendSuccess(res, result);
};
