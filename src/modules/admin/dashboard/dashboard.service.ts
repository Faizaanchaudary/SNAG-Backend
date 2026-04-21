import * as dashboardRepository from './dashboard.repository.js';

/**
 * Get admin dashboard KPIs (Key Performance Indicators)
 */
export const getKpis = async () => {
  const [
    totalUsers,
    totalMerchants,
    activeOffers,
    totalRedemptions,
    userGrowth,
    merchantGrowth,
    offerGrowth,
    redemptionGrowth,
  ] = await Promise.all([
    dashboardRepository.getTotalUsers(),
    dashboardRepository.getTotalMerchants(),
    dashboardRepository.getActiveOffers(),
    dashboardRepository.getTotalRedemptions(),
    dashboardRepository.getUserGrowthPercentage(),
    dashboardRepository.getMerchantGrowthPercentage(),
    dashboardRepository.getOfferGrowthPercentage(),
    dashboardRepository.getRedemptionGrowthPercentage(),
  ]);

  return {
    users: {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      trend: userGrowth,
      icon: 'users',
    },
    merchants: {
      title: 'Total Merchants',
      value: totalMerchants.toLocaleString(),
      trend: merchantGrowth,
      icon: 'merchants',
    },
    offers: {
      title: 'Active Offers',
      value: activeOffers.toLocaleString(),
      trend: offerGrowth,
      icon: 'offers',
    },
    redemptions: {
      title: 'Total Redemptions',
      value: totalRedemptions.toLocaleString(),
      trend: redemptionGrowth,
      icon: 'redemptions',
    },
  };
};

/**
 * Get platform sentiment distribution (user platform breakdown)
 * For now, we'll simulate platform data - in real implementation,
 * this could track user agents or device types
 */
export const getSentimentDistribution = async () => {
  const platformData = await dashboardRepository.getPlatformDistribution();
  
  return [
    { label: 'iOS', value: platformData.ios, color: '#3b82f6' },
    { label: 'Android', value: platformData.android, color: '#10b981' },
    { label: 'Web', value: platformData.web, color: '#f59e0b' },
  ];
};

/**
 * Get offers redeemed analytics with time filtering
 */
export const getOffersRedeemed = async (period: string, option?: string) => {
  return await dashboardRepository.getOffersRedeemedByPeriod(period, option);
};

/**
 * Get monthly revenue analytics with time filtering
 */
export const getMonthlyRevenue = async (period: string, option?: string) => {
  return await dashboardRepository.getRevenueByPeriod(period, option);
};

/**
 * Get revenue split by offer category
 */
export const getRevenueSplit = async (period: string, option?: string) => {
  return await dashboardRepository.getRevenueSplitByCategory(period, option);
};