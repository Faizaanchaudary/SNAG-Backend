import { Request, Response } from 'express';
import { INDUSTRIES } from '@common/constants.js';
import { sendSuccess } from '@core/http/response.js';

/// Returns the fixed list of industries.
/// Public endpoint — no auth required.
/// Both merchant (branch profile) and client (discover offers) use this.
export const getIndustries = (_req: Request, res: Response): void => {
  sendSuccess(res, { industries: INDUSTRIES });
};
