import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as offersService from './offers.service.js';

export const listOffers = async (req: Request, res: Response): Promise<void> => {
  const result = await offersService.listOffers(req.user!.id, req.query as any);
  sendSuccess(res, result, 'Offers retrieved');
};

export const getOffer = async (req: Request, res: Response): Promise<void> => {
  const offer = await offersService.getOffer(req.user!.id, req.params['id'] as string);
  sendSuccess(res, offer, 'Offer retrieved');
};

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  const bannerUrl = (req.file as any)?.location ?? req.file?.path;
  const offer = await offersService.createOffer(req.user!.id, req.body, bannerUrl);
  sendSuccess(res, offer, 'Offer created', 201);
};

export const updateOffer = async (req: Request, res: Response): Promise<void> => {
  const bannerUrl = (req.file as any)?.location ?? req.file?.path;
  const offer = await offersService.updateOffer(req.user!.id, req.params['id'] as string, req.body, bannerUrl);
  sendSuccess(res, offer, 'Offer updated');
};

export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  const result = await offersService.deleteOffer(req.user!.id, req.params['id'] as string);
  sendSuccess(res, result, 'Offer deleted');
};
