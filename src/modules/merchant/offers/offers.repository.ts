import mongoose from 'mongoose';

import { Location, LocationDocument } from '@models/location.model.js';
import { Offer, OfferDocument } from '@models/offer.model.js';

import type {
  BasicInfoDto,
  LocationInfoDto,
  ScanInfoDto,
  TargetAudienceDto,
} from './offers.validation.js';

// ── Create ────────────────────────────────────────────────────────────────────

export const createOffer = (
  merchantId: string,
  dto: BasicInfoDto & { bannerUrl?: string },
): Promise<OfferDocument> => {
  return new Offer({ ...dto, merchant: merchantId }).save();
};

// ── Update ────────────────────────────────────────────────────────────────────

export const updateScanInfo = (
  offerId: string,
  merchantId: string,
  dto: ScanInfoDto & { qrCodeUrl?: string; barCodeUrl?: string },
): Promise<OfferDocument | null> =>
  Offer.findOneAndUpdate(
    { _id: offerId, merchant: merchantId },
    { $set: dto },
    { new: true },
  ).exec();

export const updateLocationInfo = (
  offerId: string,
  merchantId: string,
  dto: LocationInfoDto,
): Promise<OfferDocument | null> =>
  Offer.findOneAndUpdate(
    { _id: offerId, merchant: merchantId },
    {
      $set: {
        locationIds: dto.locationIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
    },
    { new: true },
  ).exec();

export const updateTargetAudience = (
  offerId: string,
  merchantId: string,
  dto: TargetAudienceDto,
): Promise<OfferDocument | null> =>
  Offer.findOneAndUpdate(
    { _id: offerId, merchant: merchantId },
    { $set: { targetAudience: dto } },
    { new: true },
  ).exec();

export const updateBanner = (
  offerId: string,
  merchantId: string,
  bannerUrl: string,
): Promise<OfferDocument | null> =>
  Offer.findOneAndUpdate(
    { _id: offerId, merchant: merchantId },
    { $set: { bannerUrl } },
    { new: true },
  ).exec();

// ── Read ──────────────────────────────────────────────────────────────────────

export const findOfferById = (
  offerId: string,
  merchantId: string,
): Promise<OfferDocument | null> =>
  Offer.findOne({ _id: offerId, merchant: merchantId })
    .populate('locationIds')
    .exec();

export const findMerchantOffers = async (
  merchantId: string,
  filters?: {
    status?: string;
    offerType?: string;
    keyword?: string;
    locationId?: string;
    location?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<OfferDocument[]> => {
  const query: Record<string, unknown> = { merchant: merchantId };

  if (filters?.status)     query['status']      = filters.status;
  if (filters?.offerType)  query['offerType']   = filters.offerType;
  if (filters?.locationId) query['locationIds'] = new mongoose.Types.ObjectId(filters.locationId);
  
  // Search by keyword in title or description
  if (filters?.keyword) {
    query['$or'] = [
      { title:       { $regex: filters.keyword, $options: 'i' } },
      { description: { $regex: filters.keyword, $options: 'i' } },
    ];
  }
  
  // Search by category
  if (filters?.category) {
    query['categories'] = { $regex: filters.category, $options: 'i' };
  }
  
  // Date range filters
  if (filters?.startDate) query['startDate'] = { $gte: new Date(filters.startDate) };
  if (filters?.endDate)   query['endDate']   = { $lte: new Date(filters.endDate) };

  // First, get offers matching basic criteria
  let offers = await Offer.find(query)
    .populate('locationIds')
    .sort({ createdAt: -1 })
    .exec();

  // Filter by location name/address if provided (post-query filter since locationIds is populated)
  if (filters?.location) {
    offers = offers.filter(offer => {
      const locations = offer.locationIds as any[];
      return locations.some(loc => 
        loc.name?.toLowerCase().includes(filters.location!.toLowerCase()) ||
        loc.branchAddress?.toLowerCase().includes(filters.location!.toLowerCase()) ||
        loc.city?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    });
  }

  return offers;
};

// ── Merchant locations (for location tab dropdown) ────────────────────────────

export const findMerchantLocations = (merchantId: string): Promise<LocationDocument[]> =>
  Location.find({ merchant: merchantId, isDeleted: false }).exec();

// ── Edit (combined update) ────────────────────────────────────────────────────

export const editOffer = (
  offerId: string,
  merchantId: string,
  data: Record<string, unknown>,
): Promise<OfferDocument | null> => {
  return Offer.findOneAndUpdate(
    { _id: offerId, merchant: merchantId },
    { $set: data },
    { new: true },
  ).exec();
};

// ── Delete ────────────────────────────────────────────────────────────────────

export const softDeleteOffer = (
  offerId: string,
  merchantId: string,
): Promise<OfferDocument | null> =>
  Offer.findOneAndUpdate(
    { _id: offerId, merchant: merchantId },
    { isDeleted: true },
    { new: true },
  ).exec();

// ── Stats ─────────────────────────────────────────────────────────────────────

export const countRedemptions = async (
  offerId: string,
  startDate: Date,
  endDate: Date,
): Promise<number> => {
  const { Redemption } = await import('@models/redemption.model.js');
  return Redemption.countDocuments({
    offer: new mongoose.Types.ObjectId(offerId),
    redeemedAt: { $gte: startDate, $lte: endDate },
  }).exec();
};

export const getTopPerformingBranch = async (
  offerId: string,
): Promise<{ locationId: string; locationName: string; redemptions: number } | null> => {
  const { Redemption } = await import('@models/redemption.model.js');
  const { BranchProfile } = await import('@models/branch-profile.model.js');
  
  const offer = await Offer.findById(offerId).populate('locationIds').exec();
  if (!offer || offer.locationIds.length === 0) return null;

  // Get merchant's branch profile for the name
  const branchProfile = await BranchProfile.findOne({ merchant: offer.merchant }).exec();
  const branchName = branchProfile?.branchName || 'Unknown Branch';

  // Aggregate redemptions by location
  const locationStats = await Promise.all(
    offer.locationIds.map(async (locationId) => {
      const count = await Redemption.countDocuments({
        offer: new mongoose.Types.ObjectId(offerId),
      }).exec();
      
      const location = await Location.findById(locationId).exec();
      // Use branch name + location address for clarity
      const locationLabel = location 
        ? `${branchName} - ${location.branchAddress}`
        : 'Unknown';
      
      return {
        locationId: locationId.toString(),
        locationName: locationLabel,
        redemptions: count,
      };
    })
  );

  // Find the location with most redemptions
  const topLocation = locationStats.reduce((max, current) =>
    current.redemptions > max.redemptions ? current : max
  );

  return topLocation.redemptions > 0 ? topLocation : null;
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────

export const getDashboardStats = async (merchantId: string) => {
  // Date ranges for current and previous month
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    activeCount,
    expiredCount,
    draftCount,
    totalRedemptions,
    totalImpressions,
    currentMonthRedemptions,
    previousMonthRedemptions,
    currentMonthImpressions,
    previousMonthImpressions,
    totalBranches,
  ] = await Promise.all([
    // Offer counts by status
    Offer.countDocuments({ merchant: merchantId, status: 'active', isDeleted: false }).exec(),
    Offer.countDocuments({ merchant: merchantId, status: 'expired', isDeleted: false }).exec(),
    Offer.countDocuments({ merchant: merchantId, status: 'draft', isDeleted: false }).exec(),
    
    // Total redemptions (all time)
    Offer.aggregate([
      { $match: { merchant: new mongoose.Types.ObjectId(merchantId), isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$stats.redemptions' } } },
    ]).exec().then(res => res[0]?.total || 0),
    
    // Total impressions (all time)
    Offer.aggregate([
      { $match: { merchant: new mongoose.Types.ObjectId(merchantId), isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$stats.views' } } },
    ]).exec().then(res => res[0]?.total || 0),
    
    // Current month redemptions
    (async () => {
      const { Redemption } = await import('@models/redemption.model.js');
      const merchantOffers = await Offer.find({ merchant: merchantId, isDeleted: false }).distinct('_id').exec();
      return Redemption.countDocuments({
        offer: { $in: merchantOffers },
        redeemedAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
      }).exec();
    })(),
    
    // Previous month redemptions
    (async () => {
      const { Redemption } = await import('@models/redemption.model.js');
      const merchantOffers = await Offer.find({ merchant: merchantId, isDeleted: false }).distinct('_id').exec();
      return Redemption.countDocuments({
        offer: { $in: merchantOffers },
        redeemedAt: { $gte: previousMonthStart, $lte: previousMonthEnd },
      }).exec();
    })(),
    
    // Current month impressions (views)
    Offer.aggregate([
      { 
        $match: { 
          merchant: new mongoose.Types.ObjectId(merchantId), 
          isDeleted: false,
          createdAt: { $lte: currentMonthEnd },
        } 
      },
      { $group: { _id: null, total: { $sum: '$stats.views' } } },
    ]).exec().then(res => res[0]?.total || 0),
    
    // Previous month impressions (views) - approximate based on growth
    Offer.aggregate([
      { 
        $match: { 
          merchant: new mongoose.Types.ObjectId(merchantId), 
          isDeleted: false,
          createdAt: { $lte: previousMonthEnd },
        } 
      },
      { $group: { _id: null, total: { $sum: '$stats.views' } } },
    ]).exec().then(res => res[0]?.total || 0),
    
    // Total branches (locations)
    Location.countDocuments({ merchant: merchantId, isDeleted: false }).exec(),
  ]);

  // Get saved offers count (from SavedOffer model)
  const { SavedOffer } = await import('@models/saved-offer.model.js');
  const merchantOfferIds = await Offer.find({ merchant: merchantId, isDeleted: false }).distinct('_id').exec();
  const savedCount = await SavedOffer.countDocuments({ offer: { $in: merchantOfferIds } }).exec();

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return {
    activeOffers: activeCount,
    savedOffers: savedCount,
    expiredOffers: expiredCount,
    draftedOffers: draftCount,
    totalRedemptions,
    totalImpressions,
    redemptionsChange: calculateChange(currentMonthRedemptions, previousMonthRedemptions),
    impressionsChange: calculateChange(currentMonthImpressions, previousMonthImpressions),
    totalBranches,
    totalFeedback: 0, // TODO: Implement feedback count when feedback model is ready
  };
};
