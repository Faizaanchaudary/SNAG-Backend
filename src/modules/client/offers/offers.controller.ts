import { Request, Response } from 'express';
import * as offersService from './offers.service.js';
import { sendSuccess } from '@core/http/response.js';

export const discoverOffers = async (req: Request, res: Response): Promise<void> => {
  const offers = await offersService.discoverOffers(req.user!.id, req.query as any);
  sendSuccess(res, offers);
};

export const getOfferById = async (req: Request, res: Response): Promise<void> => {
  const offer = await offersService.getOfferById(req.user!.id, req.params['id'] as string);
  sendSuccess(res, offer);
};

export const saveOffer = async (req: Request, res: Response): Promise<void> => {
  const result = await offersService.saveOffer(req.user!.id, req.params['id'] as string);
  sendSuccess(res, result, 'Offer saved');
};

export const unsaveOffer = async (req: Request, res: Response): Promise<void> => {
  const result = await offersService.unsaveOffer(req.user!.id, req.params['id'] as string);
  sendSuccess(res, result, 'Offer removed from saved');
};

export const snagOffer = async (req: Request, res: Response): Promise<void> => {
  const result = await offersService.snagOffer(req.user!.id, req.params['id'] as string);
  sendSuccess(res, result, 'Offer snagged!', 201);
};

export const clickOffer = async (req: Request, res: Response): Promise<void> => {
  const result = await offersService.clickOffer(req.user!.id, req.params['id'] as string);
  sendSuccess(res, result, 'Click tracked');
};

export const getMyOffers = async (req: Request, res: Response): Promise<void> => {
  const offers = await offersService.getMyOffers(req.user!.id, req.query as any);
  sendSuccess(res, offers);
};

export const getSavedOffers = async (req: Request, res: Response): Promise<void> => {
  const offers = await offersService.getSavedOffers(req.user!.id, req.query as any);
  sendSuccess(res, offers);
};
