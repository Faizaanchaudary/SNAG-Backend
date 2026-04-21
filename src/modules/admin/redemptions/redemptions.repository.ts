import { Redemption, RedemptionDocument } from '@models/redemption.model.js';

/**
 * Find redemptions with pagination and filters
 */
export const findRedemptionsWithFilters = async (params: {
  q?: string;
  offerId?: string;
  merchantId?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}) => {
  const { q, offerId, merchantId, clientId, startDate, endDate, page, limit } = params;
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery: any = {};
  
  if (offerId) {
    searchQuery.offer = offerId;
  }
  
  if (merchantId) {
    searchQuery.merchant = merchantId;
  }
  
  if (clientId) {
    searchQuery.client = clientId;
  }
  
  if (startDate || endDate) {
    searchQuery.redeemedAt = {};
    if (startDate) {
      searchQuery.redeemedAt.$gte = new Date(startDate);
    }
    if (endDate) {
      searchQuery.redeemedAt.$lte = new Date(endDate);
    }
  }

  const [redemptions, total] = await Promise.all([
    Redemption.find(searchQuery)
      .populate('client', 'firstName lastName email')
      .populate('offer', 'title categories')
      .populate('merchant', 'firstName lastName email')
      .sort({ redeemedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Redemption.countDocuments(searchQuery),
  ]);

  // Apply text search filter if provided (after population)
  let filteredRedemptions = redemptions;
  if (q) {
    const searchTerm = q.toLowerCase();
    filteredRedemptions = redemptions.filter((redemption) => {
      const client = redemption.client as any;
      const offer = redemption.offer as any;
      const merchant = redemption.merchant as any;
      
      return (
        client?.firstName?.toLowerCase().includes(searchTerm) ||
        client?.lastName?.toLowerCase().includes(searchTerm) ||
        client?.email?.toLowerCase().includes(searchTerm) ||
        offer?.title?.toLowerCase().includes(searchTerm) ||
        merchant?.firstName?.toLowerCase().includes(searchTerm) ||
        merchant?.lastName?.toLowerCase().includes(searchTerm) ||
        merchant?.email?.toLowerCase().includes(searchTerm)
      );
    });
  }

  return { redemptions: filteredRedemptions, total };
};

/**
 * Get redemption by ID
 */
export const findRedemptionById = (id: string): Promise<RedemptionDocument | null> => {
  return Redemption.findById(id)
    .populate('client', 'firstName lastName email phoneNumber')
    .populate('offer', 'title description categories bannerUrl')
    .populate('merchant', 'firstName lastName email')
    .exec();
};

/**
 * Get redemption statistics
 */
export const getRedemptionStats = async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalRedemptions,
    todayRedemptions,
    weekRedemptions,
    monthRedemptions,
    topOffers,
    topMerchants,
  ] = await Promise.all([
    Redemption.countDocuments(),
    Redemption.countDocuments({ redeemedAt: { $gte: today } }),
    Redemption.countDocuments({ redeemedAt: { $gte: thisWeek } }),
    Redemption.countDocuments({ redeemedAt: { $gte: thisMonth } }),
    Redemption.aggregate([
      { $group: { _id: '$offer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'offers', localField: '_id', foreignField: '_id', as: 'offer' } },
      { $unwind: '$offer' },
      { $project: { title: '$offer.title', count: 1 } },
    ]),
    Redemption.aggregate([
      { $group: { _id: '$merchant', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'merchant' } },
      { $unwind: '$merchant' },
      { $project: { name: { $concat: ['$merchant.firstName', ' ', '$merchant.lastName'] }, count: 1 } },
    ]),
  ]);

  return {
    totalRedemptions,
    todayRedemptions,
    weekRedemptions,
    monthRedemptions,
    topOffers,
    topMerchants,
  };
};