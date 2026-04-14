import mongoose from 'mongoose';
import { Offer, OfferDocument } from '@models/offer.model.js';
import { SavedOffer, SavedOfferDocument } from '@models/saved-offer.model.js';
import { Redemption, RedemptionDocument } from '@models/redemption.model.js';
import { OFFER_STATUSES } from '@common/constants.js';

// ── Discover ──────────────────────────────────────────────────────────────────

export const findActiveOffers = (filters?: {
  category?:    string;
  keyword?:     string;
  offerType?:   string;
  merchantIds?: mongoose.Types.ObjectId[];   // pre-resolved from brand filter
  startDate?:   string;
  endDate?:     string;
}): Promise<OfferDocument[]> => {
  const query: Record<string, unknown> = {
    status:    OFFER_STATUSES.ACTIVE,
    isDeleted: false,
  };

  if (filters?.offerType)   query['offerType']  = filters.offerType;
  if (filters?.category)    query['categories'] = { $in: [filters.category] };
  if (filters?.merchantIds) query['merchant']   = { $in: filters.merchantIds };
  if (filters?.keyword)     query['$or'] = [
    { title:       { $regex: filters.keyword, $options: 'i' } },
    { categories:  { $regex: filters.keyword, $options: 'i' } },
  ];
  if (filters?.startDate) query['endDate']   = { $gte: new Date(filters.startDate) };
  if (filters?.endDate)   query['startDate'] = { $lte: new Date(filters.endDate) };

  // Hide fully redeemed offers (where redemptions >= redemptionLimit)
  // Only apply filter if redemptionLimit exists (not null/undefined)
  query['$or'] = [
    { redemptionLimit: { $exists: false } },  // No limit set
    { redemptionLimit: null },                 // Explicitly null
    { $expr: { $lt: ['$stats.redemptions', '$redemptionLimit'] } }, // Not reached limit
  ];

  return Offer.find(query)
    .populate({ path: 'merchant', select: 'firstName lastName' })
    .populate({ path: 'locationIds', select: 'branchAddress coordinates locationType merchant' })
    .sort({ createdAt: -1 })
    .exec();
};

export const findOfferById = (offerId: string): Promise<OfferDocument | null> =>
  Offer.findOne({ _id: offerId, status: OFFER_STATUSES.ACTIVE, isDeleted: false })
    .populate({ path: 'merchant', select: 'firstName lastName' })
    .populate({ path: 'locationIds', select: 'branchAddress coordinates locationType' })
    .exec();

// ── Save / Unsave ─────────────────────────────────────────────────────────────

export const saveOffer = (clientId: string, offerId: string): Promise<SavedOfferDocument> =>
  SavedOffer.findOneAndUpdate(
    { client: clientId, offer: offerId },
    { client: clientId, offer: offerId, savedAt: new Date() },
    { upsert: true, new: true },
  ).exec() as Promise<SavedOfferDocument>;

export const unsaveOffer = (clientId: string, offerId: string) =>
  SavedOffer.deleteOne({ client: clientId, offer: offerId }).exec();

export const isOfferSaved = (clientId: string, offerId: string): Promise<boolean> =>
  SavedOffer.exists({ client: clientId, offer: offerId }).then(Boolean);

export const findSavedOfferIds = (clientId: string, offerIds: string[]) =>
  SavedOffer.find({
    client: clientId,
    offer: { $in: offerIds },
  })
    .select('offer')
    .lean()
    .exec();

export const findRedeemedOfferIds = (clientId: string, offerIds: string[]) =>
  Redemption.find({
    client: clientId,
    offer: { $in: offerIds },
  })
    .select('offer')
    .lean()
    .exec();

// ── Snag ──────────────────────────────────────────────────────────────────────

export const createRedemption = (
  clientId:   string,
  offerId:    string,
  merchantId: string,
  data: { couponCode?: string; qrCodeUrl?: string; barCodeUrl?: string },
): Promise<RedemptionDocument> =>
  new Redemption({
    client:   clientId,
    offer:    offerId,
    merchant: merchantId,
    ...data,
    redeemedAt: new Date(),
  }).save();

export const incrementOfferRedemptions = (offerId: string) =>
  Offer.findByIdAndUpdate(offerId, { $inc: { 'stats.redemptions': 1 } }).exec();

export const countRedemptionsForOffer = (offerId: string): Promise<number> =>
  Redemption.countDocuments({ offer: new mongoose.Types.ObjectId(offerId) }).exec();

export const hasClientRedeemedOffer = (clientId: string, offerId: string): Promise<boolean> =>
  Redemption.exists({ 
    client: new mongoose.Types.ObjectId(clientId),
    offer: new mongoose.Types.ObjectId(offerId) 
  }).then(Boolean);

// ── My Offers (client redemption history) ─────────────────────────────────────

export const findClientRedemptions = (
  clientId: string,
  filters?: {
    keyword?:   string;
    offerType?: string;
    status?:    string;
    category?:  string;
    startDate?: string;
    endDate?:   string;
  },
) =>
  Redemption.find({ client: new mongoose.Types.ObjectId(clientId) })
    .populate({
      path: 'offer',
      match: {
        isDeleted: false,
        ...(filters?.offerType && { offerType: filters.offerType }),
        ...(filters?.status    && { status:    filters.status }),
        ...(filters?.category  && { categories: { $in: [filters.category] } }),
        ...(filters?.keyword   && { title: { $regex: filters.keyword, $options: 'i' } }),
        ...(filters?.startDate && { endDate:   { $gte: new Date(filters.startDate) } }),
        ...(filters?.endDate   && { startDate: { $lte: new Date(filters.endDate) } }),
      },
      populate: [
        { path: 'locationIds', select: 'branchAddress locationType' },
      ],
    })
    .sort({ redeemedAt: -1 })
    .exec();

// ── Saved Offers List ─────────────────────────────────────────────────────────

export const findSavedOffers = (
  clientId: string,
  filters?: {
    keyword?:     string;
    offerType?:   string;
    category?:    string;
    merchantIds?: mongoose.Types.ObjectId[];
  },
): Promise<SavedOfferDocument[]> => {
  const matchConditions: Record<string, unknown> = { isDeleted: false };

  if (filters?.offerType)   matchConditions['offerType']  = filters.offerType;
  if (filters?.category)    matchConditions['categories'] = { $in: [filters.category] };
  if (filters?.merchantIds) matchConditions['merchant']   = { $in: filters.merchantIds };
  if (filters?.keyword) {
    matchConditions['$or'] = [
      { title:      { $regex: filters.keyword, $options: 'i' } },
      { categories: { $regex: filters.keyword, $options: 'i' } },
    ];
  }

  return SavedOffer.find({ client: clientId })
    .populate({
      path: 'offer',
      match: matchConditions,
      populate: [
        { path: 'merchant',     select: 'firstName lastName' },
        { path: 'locationIds',  select: 'branchAddress locationType' },
      ],
    })
    .sort({ savedAt: -1 })
    .exec();
};
