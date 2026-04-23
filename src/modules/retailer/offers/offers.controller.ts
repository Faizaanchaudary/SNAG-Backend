import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as offersService from './offers.service.js';
import { OffersFilterDto, CreateOfferDto, UpdateOfferDto } from './offers.validation.js';

/** GET /retailer/offers - List all offers */
export const getOffers = async (req: Request, res: Response): Promise<void> => {
  const params = req.query as unknown as OffersFilterDto;
  const data = await offersService.getOffers(params);
  sendSuccess(res, data, 'Offers retrieved');
};

/** GET /retailer/offers/merchants - Merchants dropdown */
export const getMerchantsForDropdown = async (req: Request, res: Response): Promise<void> => {
  const data = await offersService.getMerchantsForDropdown();
  sendSuccess(res, data, 'Merchants retrieved');
};

/** POST /retailer/offers - Create offer */
export const createOffer = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateOfferDto;
  const bannerFile = req.file;
  const offer = await offersService.createOffer(dto, bannerFile);
  sendSuccess(res, offer, 'Offer created', 201);
};

/** PUT /retailer/offers/:id - Update offer */
export const updateOffer = async (req: Request, res: Response): Promise<void> => {
  const offerId = req.params['id'] as string;
  const dto = req.body as UpdateOfferDto;
  const bannerFile = req.file;
  const offer = await offersService.updateOffer(offerId, dto, bannerFile);
  sendSuccess(res, offer, 'Offer updated');
};

/** DELETE /retailer/offers/:id - Delete offer */
export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  const offerId = req.params['id'] as string;
  await offersService.deleteOffer(offerId);
  sendSuccess(res, { deleted: true }, 'Offer deleted');
};