import { Offer, OfferDocument } from '@models/offer.model.js';
import { UpdateDealDto } from './deals.validation.js';

/**
 * Find deals with filters, search, and pagination
 */
export const findDealsWithFilters = async (params: {
  q: string;
  status?: string;
  category?: string;
  maxRadius?: number;
  page: number;
  limit: number;
}) => {
  const { q, status, category, maxRadius, page, limit } = params;
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery: any = {};

  // Text search
  if (q) {
    searchQuery.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  // Status filter (map admin status to offer status)
  if (status) {
    switch (status) {
      case 'live':
      case 'published':
        searchQuery.status = 'active';
        break;
      case 'needs-approval':
      case 'flagged':
        searchQuery.status = 'draft';
        break;
      case 'archived':
        searchQuery.status = 'expired';
        break;
      default:
        searchQuery.status = status;
    }
  }

  // Category filter
  if (category) {
    searchQuery.categories = { $in: [category] };
  }

  // Radius filter (convert meters to km)
  if (maxRadius) {
    const maxRadiusKm = maxRadius / 1000;
    searchQuery['targetAudience.radiusKm'] = { $lte: maxRadiusKm };
  }

  const [deals, total] = await Promise.all([
    Offer.find(searchQuery)
      .populate('merchant', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Offer.countDocuments(searchQuery),
  ]);

  return { deals, total };
};

/**
 * Find deal by ID with merchant details
 */
export const findDealById = (id: string): Promise<OfferDocument | null> => {
  return Offer.findById(id)
    .populate('merchant', 'firstName lastName email')
    .populate('locationIds')
    .exec();
};

/**
 * Create new deal
 */
export const createDeal = (data: any): Promise<OfferDocument> => {
  return new Offer(data).save();
};

/**
 * Update deal
 */
export const updateDeal = (id: string, data: any): Promise<OfferDocument | null> => {
  return Offer.findByIdAndUpdate(id, data, { new: true })
    .populate('merchant', 'firstName lastName')
    .exec();
};

/**
 * Soft delete deal
 */
export const softDeleteDeal = (id: string): Promise<OfferDocument | null> => {
  return Offer.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
};

/**
 * Get deal statistics for admin dashboard
 */
export const getDealStats = async () => {
  const [
    totalDeals,
    liveDeals,
    draftDeals,
    expiredDeals,
    flaggedDeals,
  ] = await Promise.all([
    Offer.countDocuments(),
    Offer.countDocuments({ status: 'active' }),
    Offer.countDocuments({ status: 'draft' }),
    Offer.countDocuments({ status: 'expired' }),
    // For flagged deals, we'd need to add a flag field or use metadata
    Offer.countDocuments({ status: 'draft' }), // Placeholder
  ]);

  return {
    totalDeals,
    liveDeals,
    draftDeals,
    expiredDeals,
    flaggedDeals,
    pendingApproval: draftDeals, // Assuming draft deals need approval
  };
};

/**
 * Get deals by merchant
 */
export const getDealsByMerchant = async (merchantId: string) => {
  return await Offer.find({ merchant: merchantId })
    .sort({ createdAt: -1 })
    .exec();
};

/**
 * Get recent deals activity
 */
export const getRecentDealsActivity = async (limit: number = 10) => {
  return await Offer.find()
    .populate('merchant', 'firstName lastName')
    .sort({ updatedAt: -1 })
    .limit(limit)
    .exec();
};