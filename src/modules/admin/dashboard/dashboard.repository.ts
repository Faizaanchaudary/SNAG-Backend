import { User } from '@models/user.model.js';
import { Offer } from '@models/offer.model.js';
import { Redemption } from '@models/redemption.model.js';
import { USER_ROLES, OFFER_STATUSES } from '@common/constants.js';

/**
 * Get total number of users (clients + merchants)
 */
export const getTotalUsers = async (): Promise<number> => {
  return await User.countDocuments({
    role: { $in: [USER_ROLES.CLIENT, USER_ROLES.MERCHANT] },
  });
};

/**
 * Get total number of merchants
 */
export const getTotalMerchants = async (): Promise<number> => {
  return await User.countDocuments({ role: USER_ROLES.MERCHANT });
};

/**
 * Get total number of active offers
 */
export const getActiveOffers = async (): Promise<number> => {
  return await Offer.countDocuments({ status: OFFER_STATUSES.ACTIVE });
};

/**
 * Get total number of redemptions
 */
export const getTotalRedemptions = async (): Promise<number> => {
  return await Redemption.countDocuments();
};

/**
 * Get user growth percentage (compared to last month)
 */
export const getUserGrowthPercentage = async (): Promise<number> => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [lastMonthCount, thisMonthCount] = await Promise.all([
    User.countDocuments({
      role: { $in: [USER_ROLES.CLIENT, USER_ROLES.MERCHANT] },
      createdAt: { $gte: lastMonth, $lt: thisMonth },
    }),
    User.countDocuments({
      role: { $in: [USER_ROLES.CLIENT, USER_ROLES.MERCHANT] },
      createdAt: { $gte: thisMonth },
    }),
  ]);

  if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;
  return Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
};

/**
 * Get merchant growth percentage (compared to last month)
 */
export const getMerchantGrowthPercentage = async (): Promise<number> => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [lastMonthCount, thisMonthCount] = await Promise.all([
    User.countDocuments({
      role: USER_ROLES.MERCHANT,
      createdAt: { $gte: lastMonth, $lt: thisMonth },
    }),
    User.countDocuments({
      role: USER_ROLES.MERCHANT,
      createdAt: { $gte: thisMonth },
    }),
  ]);

  if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;
  return Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
};

/**
 * Get offer growth percentage (compared to last month)
 */
export const getOfferGrowthPercentage = async (): Promise<number> => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [lastMonthCount, thisMonthCount] = await Promise.all([
    Offer.countDocuments({
      createdAt: { $gte: lastMonth, $lt: thisMonth },
    }),
    Offer.countDocuments({
      createdAt: { $gte: thisMonth },
    }),
  ]);

  if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;
  return Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
};

/**
 * Get redemption growth percentage (compared to last month)
 */
export const getRedemptionGrowthPercentage = async (): Promise<number> => {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [lastMonthCount, thisMonthCount] = await Promise.all([
    Redemption.countDocuments({
      redeemedAt: { $gte: lastMonth, $lt: thisMonth },
    }),
    Redemption.countDocuments({
      redeemedAt: { $gte: thisMonth },
    }),
  ]);

  if (lastMonthCount === 0) return thisMonthCount > 0 ? 100 : 0;
  return Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
};

/**
 * Get platform distribution (simulated for now)
 * In a real implementation, this would track user agents or device types
 */
export const getPlatformDistribution = async () => {
  const totalUsers = await getTotalUsers();
  
  // Simulate platform distribution based on typical mobile app usage
  return {
    ios: Math.round(totalUsers * 0.45),
    android: Math.round(totalUsers * 0.50),
    web: Math.round(totalUsers * 0.05),
  };
};

/**
 * Get offers redeemed by time period
 */
export const getOffersRedeemedByPeriod = async (period: string, option?: string) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;
  let groupBy: any;
  let labels: string[];

  switch (period) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      // Group by weeks in the month
      const weeksInMonth = Math.ceil(now.getDate() / 7);
      labels = Array.from({ length: weeksInMonth }, (_, i) => `Week ${i + 1}`);
      groupBy = {
        $dateToString: {
          format: '%U',
          date: '$redeemedAt',
        },
      };
      break;

    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      groupBy = {
        $dayOfWeek: '$redeemedAt',
      };
      break;

    case 'day':
    case 'date':
      if (period === 'date' && option) {
        startDate = new Date(option);
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }
      labels = Array.from({ length: 8 }, (_, i) => `${i * 3}:00`);
      groupBy = {
        $hour: '$redeemedAt',
      };
      break;

    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      groupBy = {
        $dateToString: {
          format: '%U',
          date: '$redeemedAt',
        },
      };
  }

  const redemptions = await Redemption.aggregate([
    {
      $match: {
        redeemedAt: { $gte: startDate, $lte: endDate },
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

  // Map the results to the expected format
  return labels.map((label, index) => {
    const found = redemptions.find((r) => {
      if (period === 'week') {
        // MongoDB dayOfWeek: 1=Sunday, 2=Monday, etc.
        const dayIndex = r._id === 1 ? 6 : r._id - 2; // Convert to 0=Monday
        return dayIndex === index;
      }
      return r._id === index.toString() || r._id === index;
    });
    return {
      label,
      value: found ? found.count : 0,
    };
  });
};

/**
 * Get revenue by time period
 * Note: This is simulated since we don't have actual revenue tracking yet
 */
export const getRevenueByPeriod = async (period: string, option?: string) => {
  // For now, we'll simulate revenue based on redemptions
  const redemptionData = await getOffersRedeemedByPeriod(period, option);
  
  return redemptionData.map((item) => ({
    label: item.label,
    value: Math.round(item.value * (Math.random() * 0.5 + 0.5)), // Simulate revenue conversion
  }));
};

/**
 * Get revenue split by offer category
 */
export const getRevenueSplitByCategory = async (period: string, option?: string) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (period) {
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'date':
      if (option) {
        startDate = new Date(option);
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const categoryData = await Redemption.aggregate([
    {
      $match: {
        redeemedAt: { $gte: startDate, $lte: endDate },
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
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const colors = ['#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b'];
  const total = categoryData.reduce((sum, item) => sum + item.count, 0);

  return categoryData.slice(0, 5).map((item, index) => ({
    label: item._id || 'Other',
    value: Math.round((item.count / total) * 100),
    color: colors[index] || '#6b7280',
  }));
};