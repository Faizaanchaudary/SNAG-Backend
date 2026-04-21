import { User } from '@models/user.model.js';
import { Offer } from '@models/offer.model.js';
import { Redemption } from '@models/redemption.model.js';
import { USER_ROLES, OFFER_STATUSES } from '@common/constants.js';

// ── User Reports ────────────────────────────────────────────────────────────

export const getTotalUsers = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  return await User.countDocuments({
    createdAt: { $lte: dateRange.end },
  });
};

export const getNewUsers = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  return await User.countDocuments({
    createdAt: { $gte: dateRange.start, $lte: dateRange.end },
  });
};

export const getActiveUsers = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  // Users who have been updated (active) in the date range
  return await User.countDocuments({
    updatedAt: { $gte: dateRange.start, $lte: dateRange.end },
  });
};

export const getUsersByRole = async (dateRange: { start: Date; end: Date }) => {
  const result = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  return result.map((item) => ({
    role: item._id,
    count: item.count,
  }));
};

export const getUserGrowthTrend = async (dateRange: { start: Date; end: Date }, period: string) => {
  const groupBy = getGroupByFormat(period);
  
  const result = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return result.map((item) => ({
    period: item._id,
    count: item.count,
  }));
};

export const getTopUserLocations = async (dateRange: { start: Date; end: Date }) => {
  // Simulate location data since we don't have detailed location tracking
  return [
    { location: 'New York', count: 150 },
    { location: 'Los Angeles', count: 120 },
    { location: 'Chicago', count: 90 },
    { location: 'Houston', count: 75 },
    { location: 'Phoenix', count: 60 },
  ];
};

// ── Merchant Reports ───────────────────────────────────────────────────────

export const getTotalMerchants = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  return await User.countDocuments({
    role: USER_ROLES.MERCHANT,
    createdAt: { $lte: dateRange.end },
  });
};

export const getNewMerchants = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  return await User.countDocuments({
    role: USER_ROLES.MERCHANT,
    createdAt: { $gte: dateRange.start, $lte: dateRange.end },
  });
};

export const getActiveMerchants = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  return await User.countDocuments({
    role: USER_ROLES.MERCHANT,
    isVerified: true,
    updatedAt: { $gte: dateRange.start, $lte: dateRange.end },
  });
};

export const getMerchantsByStatus = async (dateRange: { start: Date; end: Date }) => {
  const result = await User.aggregate([
    {
      $match: {
        role: USER_ROLES.MERCHANT,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $group: {
        _id: '$isVerified',
        count: { $sum: 1 },
      },
    },
  ]);

  return result.map((item) => ({
    status: item._id ? 'verified' : 'pending',
    count: item.count,
  }));
};

export const getMerchantGrowthTrend = async (dateRange: { start: Date; end: Date }, period: string) => {
  const groupBy = getGroupByFormat(period);
  
  const result = await User.aggregate([
    {
      $match: {
        role: USER_ROLES.MERCHANT,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return result.map((item) => ({
    period: item._id,
    count: item.count,
  }));
};

export const getTopPerformingMerchants = async (dateRange: { start: Date; end: Date }) => {
  const result = await Redemption.aggregate([
    {
      $match: {
        redeemedAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $group: {
        _id: '$merchant',
        redemptions: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'merchantData',
      },
    },
    {
      $unwind: '$merchantData',
    },
    {
      $sort: { redemptions: -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return result.map((item) => ({
    merchantId: item._id,
    merchantName: `${item.merchantData.firstName} ${item.merchantData.lastName}`,
    redemptions: item.redemptions,
  }));
};

// ── Financial Reports ──────────────────────────────────────────────────────

export const getTotalRevenue = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  const redemptions = await Redemption.countDocuments({
    redeemedAt: { $gte: dateRange.start, $lte: dateRange.end },
  });
  
  // Simulate revenue: average $15 per redemption
  return redemptions * 15;
};

export const getTotalRedemptions = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  return await Redemption.countDocuments({
    redeemedAt: { $gte: dateRange.start, $lte: dateRange.end },
  });
};

export const getAverageOrderValue = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  const totalRevenue = await getTotalRevenue(dateRange);
  const totalRedemptions = await getTotalRedemptions(dateRange);
  
  return totalRedemptions > 0 ? totalRevenue / totalRedemptions : 0;
};

export const getRevenueByCategory = async (dateRange: { start: Date; end: Date }) => {
  const result = await Redemption.aggregate([
    {
      $match: {
        redeemedAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $lookup: {
        from: 'offers',
        localField: 'offer',
        foreignField: '_id',
        as: 'offerData',
      },
    },
    {
      $unwind: '$offerData',
    },
    {
      $unwind: '$offerData.categories',
    },
    {
      $group: {
        _id: '$offerData.categories',
        redemptions: { $sum: 1 },
      },
    },
    {
      $sort: { redemptions: -1 },
    },
  ]);

  return result.map((item) => ({
    category: item._id,
    redemptions: item.redemptions,
    revenue: item.redemptions * 15, // Simulate revenue
  }));
};

export const getRevenueTrend = async (dateRange: { start: Date; end: Date }, period: string) => {
  const groupBy = getGroupByFormat(period);
  
  const result = await Redemption.aggregate([
    {
      $match: {
        redeemedAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $group: {
        _id: groupBy,
        redemptions: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return result.map((item) => ({
    period: item._id,
    redemptions: item.redemptions,
    revenue: item.redemptions * 15, // Simulate revenue
  }));
};

// ── Fraud Reports ──────────────────────────────────────────────────────────

export const getTotalFraudFlags = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  // Simulate fraud flags (in real implementation, you'd have a fraud flags collection)
  const totalRedemptions = await getTotalRedemptions(dateRange);
  return Math.floor(totalRedemptions * 0.02); // 2% fraud rate
};

export const getResolvedFraudFlags = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  const totalFlags = await getTotalFraudFlags(dateRange);
  return Math.floor(totalFlags * 0.85); // 85% resolution rate
};

export const getPendingFraudFlags = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  const totalFlags = await getTotalFraudFlags(dateRange);
  const resolvedFlags = await getResolvedFraudFlags(dateRange);
  return totalFlags - resolvedFlags;
};

export const getFraudFlagsByType = async (dateRange: { start: Date; end: Date }) => {
  const totalFlags = await getTotalFraudFlags(dateRange);
  
  // Simulate fraud types distribution
  return [
    { type: 'Suspicious Activity', count: Math.floor(totalFlags * 0.4) },
    { type: 'Multiple Redemptions', count: Math.floor(totalFlags * 0.3) },
    { type: 'Invalid Location', count: Math.floor(totalFlags * 0.2) },
    { type: 'Other', count: Math.floor(totalFlags * 0.1) },
  ];
};

export const getFraudTrend = async (dateRange: { start: Date; end: Date }, period: string) => {
  // Simulate fraud trend data
  const days = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
  const dataPoints = period === 'week' ? 7 : period === 'month' ? 30 : days;
  
  return Array.from({ length: Math.min(dataPoints, 30) }, (_, i) => ({
    period: i + 1,
    flags: Math.floor(Math.random() * 10) + 1,
  }));
};

// ── Offer Reports ──────────────────────────────────────────────────────────

export const getTotalOffers = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  return await Offer.countDocuments({
    createdAt: { $lte: dateRange.end },
  });
};

export const getActiveOffers = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  return await Offer.countDocuments({
    status: OFFER_STATUSES.ACTIVE,
    createdAt: { $lte: dateRange.end },
  });
};

export const getExpiredOffers = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  return await Offer.countDocuments({
    status: OFFER_STATUSES.EXPIRED,
    createdAt: { $lte: dateRange.end },
  });
};

export const getOffersByCategory = async (dateRange: { start: Date; end: Date }) => {
  const result = await Offer.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $unwind: '$categories',
    },
    {
      $group: {
        _id: '$categories',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  return result.map((item) => ({
    category: item._id,
    count: item.count,
  }));
};

export const getTopPerformingOffers = async (dateRange: { start: Date; end: Date }) => {
  const result = await Offer.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $sort: { 'stats.redemptions': -1 },
    },
    {
      $limit: 10,
    },
  ]);

  return result.map((offer) => ({
    offerId: offer._id,
    title: offer.title,
    redemptions: offer.stats.redemptions,
    views: offer.stats.views,
    clicks: offer.stats.clicks,
  }));
};

export const getOfferTrend = async (dateRange: { start: Date; end: Date }, period: string) => {
  const groupBy = getGroupByFormat(period);
  
  const result = await Offer.aggregate([
    {
      $match: {
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      },
    },
    {
      $group: {
        _id: groupBy,
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return result.map((item) => ({
    period: item._id,
    count: item.count,
  }));
};

// ── Helper Functions ───────────────────────────────────────────────────────

function getGroupByFormat(period: string) {
  switch (period) {
    case 'week':
      return { $dayOfWeek: '$createdAt' };
    case 'month':
      return { $dayOfMonth: '$createdAt' };
    case 'year':
      return { $month: '$createdAt' };
    default:
      return { $dayOfMonth: '$createdAt' };
  }
}