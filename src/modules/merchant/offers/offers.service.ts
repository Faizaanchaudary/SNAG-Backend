import mongoose from 'mongoose';

import { cloudinary } from '@config/cloudinary.js';
import { NotFoundError } from '@core/errors/app-error.js';

import * as offersRepository from './offers.repository.js';
import type {
  BasicInfoDto,
  EditOfferDto,
  LocationInfoDto,
  OffersFilterDto,
  ScanInfoDto,
  TargetAudienceDto,
} from './offers.validation.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
): Promise<string> => {
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, res) => (err ? reject(err) : resolve(res as { secure_url: string })),
    );
    stream.end(file.buffer);
  });
  return result.secure_url;
};

// ── Tab 1: Basic Info ─────────────────────────────────────────────────────────

export const createOffer = async (
  merchantId: string,
  dto: BasicInfoDto,
  bannerFile?: Express.Multer.File,
) => {
  // Validate dates
  if (dto.startDate && dto.endDate) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    
    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
  }

  if (dto.startDate) {
    const startDate = new Date(dto.startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    
    if (startDate < now) {
      throw new Error('Start date cannot be in the past');
    }
  }

  const bannerUrl = bannerFile
    ? await uploadToCloudinary(bannerFile, 'snag/offers/banners')
    : undefined;

  return offersRepository.createOffer(merchantId, { ...dto, bannerUrl });
};

// ── Tab 2: Scan Info ──────────────────────────────────────────────────────────

export const updateScanInfo = async (
  merchantId: string,
  offerId: string,
  dto: ScanInfoDto,
  qrFile?: Express.Multer.File,
  barFile?: Express.Multer.File,
) => {
  const qrCodeUrl  = qrFile  ? await uploadToCloudinary(qrFile,  'snag/offers/qr')  : undefined;
  const barCodeUrl = barFile ? await uploadToCloudinary(barFile, 'snag/offers/bar') : undefined;

  const updated = await offersRepository.updateScanInfo(offerId, merchantId, {
    ...dto,
    ...(qrCodeUrl  && { qrCodeUrl }),
    ...(barCodeUrl && { barCodeUrl }),
  });

  if (!updated) throw new NotFoundError('Offer not found');
  return updated;
};

// ── Tab 3: Location Info ──────────────────────────────────────────────────────

export const updateLocationInfo = async (
  merchantId: string,
  offerId: string,
  dto: LocationInfoDto,
) => {
  const updated = await offersRepository.updateLocationInfo(offerId, merchantId, dto);
  if (!updated) throw new NotFoundError('Offer not found');
  return updated;
};

// ── Get merchant locations (for dropdown in tab 3) ────────────────────────────

export const getMerchantLocations = (merchantId: string) =>
  offersRepository.findMerchantLocations(merchantId);

// ── Target Audience ───────────────────────────────────────────────────────────

export const updateTargetAudience = async (
  merchantId: string,
  offerId: string,
  dto: TargetAudienceDto,
) => {
  const updated = await offersRepository.updateTargetAudience(offerId, merchantId, dto);
  if (!updated) throw new NotFoundError('Offer not found');
  return updated;
};

// ── List & Detail ─────────────────────────────────────────────────────────────

export const getOffers = (merchantId: string, filters?: OffersFilterDto) =>
  offersRepository.findMerchantOffers(merchantId, filters);

export const getOfferById = async (merchantId: string, offerId: string) => {
  const offer = await offersRepository.findOfferById(offerId, merchantId);
  if (!offer) throw new NotFoundError('Offer not found');
  return offer;
};

// ── Edit (combined — Edit Offer screen) ──────────────────────────────────────

export const editOffer = async (
  merchantId: string,
  offerId: string,
  dto: EditOfferDto,
  bannerFile?: Express.Multer.File,
  qrFile?: Express.Multer.File,
  barFile?: Express.Multer.File,
) => {
  // Validate dates if both are provided
  if (dto.startDate && dto.endDate) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    
    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }
  }

  // For edit, we allow past dates since the offer might already be running
  // Only validate if startDate is being updated and is in the future
  if (dto.startDate) {
    const startDate = new Date(dto.startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    
    // Only check if it's a new start date being set
    if (startDate < now) {
      // Get existing offer to check if this is an update to an already-past date
      const existingOffer = await offersRepository.findOfferById(offerId, merchantId);
      if (existingOffer && existingOffer.startDate) {
        const existingStart = new Date(existingOffer.startDate);
        existingStart.setHours(0, 0, 0, 0);
        // If the existing start date is already in the past, allow the update
        if (existingStart >= now && startDate < now) {
          throw new Error('Start date cannot be in the past');
        }
      } else if (startDate < now) {
        throw new Error('Start date cannot be in the past');
      }
    }
  }

  const bannerUrl = bannerFile
    ? await uploadToCloudinary(bannerFile, 'snag/offers/banners')
    : undefined;
  
  const qrCodeUrl = qrFile
    ? await uploadToCloudinary(qrFile, 'snag/offers/qr')
    : undefined;
  
  const barCodeUrl = barFile
    ? await uploadToCloudinary(barFile, 'snag/offers/bar')
    : undefined;

  const updated = await offersRepository.editOffer(offerId, merchantId, {
    ...dto,
    ...(bannerUrl && { bannerUrl }),
    ...(qrCodeUrl && { qrCodeUrl }),
    ...(barCodeUrl && { barCodeUrl }),
    ...(dto.locationIds && {
      locationIds: dto.locationIds.map((id) => new mongoose.Types.ObjectId(id)),
    }),
  });

  if (!updated) throw new NotFoundError('Offer not found');
  return updated;
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const deleteOffer = async (merchantId: string, offerId: string) => {
  const deleted = await offersRepository.softDeleteOffer(offerId, merchantId);
  if (!deleted) throw new NotFoundError('Offer not found');
  return { message: 'Offer deleted' };
};

// ── Offer Stats ───────────────────────────────────────────────────────────────

export const getOfferStats = async (merchantId: string, offerId: string) => {
  const offer = await offersRepository.findOfferById(offerId, merchantId);
  if (!offer) throw new NotFoundError('Offer not found');

  // Get current month stats
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get previous month stats
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Get redemptions for current and previous month
  const currentMonthRedemptions = await offersRepository.countRedemptions(
    offerId,
    currentMonthStart,
    currentMonthEnd
  );

  const previousMonthRedemptions = await offersRepository.countRedemptions(
    offerId,
    previousMonthStart,
    previousMonthEnd
  );

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Get top performing branch
  const topBranch = await offersRepository.getTopPerformingBranch(offerId);

  return {
    views: {
      total: offer.stats.views,
      change: 0, // Views tracking would need to be implemented separately
    },
    clicks: {
      total: offer.stats.clicks,
      change: 0, // Clicks tracking would need to be implemented separately
    },
    redemptions: {
      total: offer.stats.redemptions,
      currentMonth: currentMonthRedemptions,
      previousMonth: previousMonthRedemptions,
      change: calculateChange(currentMonthRedemptions, previousMonthRedemptions),
    },
    topPerformingBranch: topBranch,
  };
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export const getDashboardStats = (merchantId: string) =>
  offersRepository.getDashboardStats(merchantId);
