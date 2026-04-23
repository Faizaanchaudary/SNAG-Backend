import * as dashboardRepository from './dashboard.repository.js';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function last7DaysRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * KPI summary for retailer dashboard.
 * Returns platform-wide counts - retailers manage merchants and their data.
 */
export const getSummary = async (_retailerId: string) => {
  const [totalMerchants, activeBranches, liveOffers, totalViews, totalRedemptions] = await Promise.all([
    dashboardRepository.getTotalMerchants(),
    dashboardRepository.getActiveBranches(),
    dashboardRepository.getLiveOffers(),
    dashboardRepository.getTotalViews(),
    dashboardRepository.getTotalRedemptions(),
  ]);

  return {
    totalMerchants,
    activeBranches,
    liveOffers,
    totalViews,
    totalRedemptions,
  };
};

/** 7-day views + impressions from all offers */
export const getViewsAndImpressions = async (_retailerId: string) => {
  const { start } = last7DaysRange();
  const viewsData = await dashboardRepository.getViewsImpressionsData(start);

  return DAY_LABELS.map((label, i) => {
    const mongoDay = i === 6 ? 1 : i + 2;
    const found = viewsData.find(r => r._id === mongoDay);
    return {
      label,
      views: found?.views || 0,
      impressions: found?.impressions || 0,
    };
  });
};

/** 7-day redemptions */
export const getRedemptions = async (_retailerId: string) => {
  const { start } = last7DaysRange();
  const byDay = await dashboardRepository.getRedemptionsData(start);

  return DAY_LABELS.map((label, i) => {
    const mongoDay = i === 6 ? 1 : i + 2;
    const found = byDay.find(r => r._id === mongoDay);
    return { label, redemptions: found?.redemptions ?? 0 };
  });
};

/** Top N offers by redemptions across all merchants */
export const getTopOffers = async (_retailerId: string, limit: number) => {
  const offers = await dashboardRepository.getTopOffersByRedemptions(limit);

  return offers.map(o => ({
    id:          o._id.toString(),
    title:       o.title,
    redemptions: o.stats.redemptions,
    views:       o.stats.views,
    merchantName: o.merchant ? `${(o.merchant as any).firstName} ${(o.merchant as any).lastName}`.trim() : 'Unknown Merchant',
  }));
};

/** Recent activity feed for retailer dashboard */
export const getActivity = async (_retailerId: string, limit: number) => {
  interface ActivityItem {
    id: string;
    title: string;
    description: string;
    timeAgo: string;
    type: 'merchant' | 'offer' | 'redemption';
    timestamp: Date;
  }

  const activities: ActivityItem[] = [];
  const itemsPerType = Math.ceil(limit / 3);

  // Get recent data from repository
  const [recentMerchants, recentOffers, recentRedemptions] = await Promise.all([
    dashboardRepository.getRecentMerchants(itemsPerType),
    dashboardRepository.getRecentOffers(itemsPerType),
    dashboardRepository.getRecentRedemptions(itemsPerType),
  ]);

  // Add merchant activities
  recentMerchants.forEach(merchant => {
    activities.push({
      id: `merchant_${merchant._id}`,
      title: 'New merchant joined',
      description: `${merchant.firstName} ${merchant.lastName}`,
      timeAgo: getTimeAgo(merchant.createdAt),
      type: 'merchant',
      timestamp: merchant.createdAt
    });
  });

  // Add offer activities
  recentOffers.forEach(offer => {
    activities.push({
      id: `offer_${offer._id}`,
      title: 'New offer created',
      description: offer.title,
      timeAgo: getTimeAgo(offer.createdAt),
      type: 'offer',
      timestamp: offer.createdAt
    });
  });

  // Add redemption activities
  recentRedemptions.forEach(redemption => {
    activities.push({
      id: `redemption_${redemption._id}`,
      title: 'Offer redeemed',
      description: (redemption.offer as any)?.title || 'Unknown offer',
      timeAgo: getTimeAgo(redemption.redeemedAt),
      type: 'redemption',
      timestamp: redemption.redeemedAt
    });
  });

  // Sort by most recent timestamp and limit
  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit)
    .map(({ timestamp, ...activity }) => activity); // Remove timestamp from final response
};

/** Helper function to calculate time ago */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d`;
  } else if (diffHours > 0) {
    return `${diffHours}h`;
  } else {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `${Math.max(1, diffMinutes)}m`;
  }
}
