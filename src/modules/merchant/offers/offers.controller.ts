import { Request, Response } from 'express';

import { sendSuccess } from '@core/http/response.js';

import * as offersService from './offers.service.js';

// ── Create Offer ──────────────────────────────────────────────────────────────

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  const offer = await offersService.createOffer(req.user!.id, req.body, req.file);
  sendSuccess(res, offer, 'Offer created', 201);
};

// ── Update Scan Info ──────────────────────────────────────────────────────────

export const updateScanInfo = async (req: Request, res: Response): Promise<void> => {
  const files   = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const qrFile  = files?.['qrCode']?.[0];
  const barFile = files?.['barCode']?.[0];
  const offer = await offersService.updateScanInfo(
    req.user!.id, req.params['id'] as string, req.body, qrFile, barFile,
  );
  sendSuccess(res, offer, 'Scan info updated');
};

// ── Update Location Info ──────────────────────────────────────────────────────

export const updateLocationInfo = async (req: Request, res: Response): Promise<void> => {
  const offer = await offersService.updateLocationInfo(req.user!.id, req.params['id'] as string, req.body);
  sendSuccess(res, offer, 'Location info updated');
};

// ── Get Merchant Locations ────────────────────────────────────────────────────

export const getMerchantLocations = async (req: Request, res: Response): Promise<void> => {
  const locations = await offersService.getMerchantLocations(req.user!.id);
  sendSuccess(res, locations);
};

// ── Update Target Audience ────────────────────────────────────────────────────

export const updateTargetAudience = async (req: Request, res: Response): Promise<void> => {
  const offer = await offersService.updateTargetAudience(req.user!.id, req.params['id'] as string, req.body);
  sendSuccess(res, offer, 'Target audience updated');
};

// ── Get Offers ────────────────────────────────────────────────────────────────

export const getOffers = async (req: Request, res: Response): Promise<void> => {
  const offers = await offersService.getOffers(req.user!.id, req.query as any);
  sendSuccess(res, offers);
};

// ── Get Offer By ID ───────────────────────────────────────────────────────────

export const getOfferById = async (req: Request, res: Response): Promise<void> => {
  const offer = await offersService.getOfferById(req.user!.id, req.params['id'] as string);
  sendSuccess(res, offer);
};

// ── Edit Offer ────────────────────────────────────────────────────────────────

export const editOffer = async (req: Request, res: Response): Promise<void> => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const bannerFile = req.file || files?.['banner']?.[0];
  const qrFile = files?.['qrCode']?.[0];
  const barFile = files?.['barCode']?.[0];
  
  const offer = await offersService.editOffer(
    req.user!.id,
    req.params['id'] as string,
    req.body,
    bannerFile,
    qrFile,
    barFile,
  );
  sendSuccess(res, offer, 'Offer updated');
};

// ── Delete Offer ──────────────────────────────────────────────────────────────

export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  const result = await offersService.deleteOffer(req.user!.id, req.params['id'] as string);
  sendSuccess(res, result);
};

// ── Get Offer Stats ───────────────────────────────────────────────────────────

export const getOfferStats = async (req: Request, res: Response): Promise<void> => {
  const stats = await offersService.getOfferStats(req.user!.id, req.params['id'] as string);
  sendSuccess(res, stats);
};

// ── Get Dashboard Stats ───────────────────────────────────────────────────────

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  const stats = await offersService.getDashboardStats(req.user!.id);
  sendSuccess(res, stats);
};
