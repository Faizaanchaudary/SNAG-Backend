import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, message?: string, status = 200): Response => {
  return res.status(status).json({ success: true, data, ...(message && { message }) });
};

export const sendError = (res: Response, code: string, message: string, status = 500): Response => {
  return res.status(status).json({ success: false, error: { code, message } });
};
