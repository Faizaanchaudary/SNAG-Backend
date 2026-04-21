import * as reportsRepository from './reports.repository.js';

/**
 * Get user reports with analytics
 */
export const getUserReports = async (params: {
  period: string;
  startDate?: string;
  endDate?: string;
}) => {
  const dateRange = buildDateRange(params.startDate, params.endDate, params.period);
  
  const [
    totalUsers,
    newUsers,
    activeUsers,
    usersByRole,
    userGrowthTrend,
    topLocations,
  ] = await Promise.all([
    reportsRepository.getTotalUsers(dateRange),
    reportsRepository.getNewUsers(dateRange),
    reportsRepository.getActiveUsers(dateRange),
    reportsRepository.getUsersByRole(dateRange),
    reportsRepository.getUserGrowthTrend(dateRange, params.period),
    reportsRepository.getTopUserLocations(dateRange),
  ]);

  return {
    summary: {
      totalUsers,
      newUsers,
      activeUsers,
      growthRate: calculateGrowthRate(newUsers, totalUsers),
    },
    breakdown: {
      byRole: usersByRole,
      byLocation: topLocations,
    },
    trends: {
      growth: userGrowthTrend,
    },
    period: params.period,
    dateRange: {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    },
  };
};

/**
 * Get merchant reports with analytics
 */
export const getMerchantReports = async (params: {
  period: string;
  startDate?: string;
  endDate?: string;
}) => {
  const dateRange = buildDateRange(params.startDate, params.endDate, params.period);
  
  const [
    totalMerchants,
    newMerchants,
    activeMerchants,
    merchantsByStatus,
    merchantGrowthTrend,
    topPerformingMerchants,
  ] = await Promise.all([
    reportsRepository.getTotalMerchants(dateRange),
    reportsRepository.getNewMerchants(dateRange),
    reportsRepository.getActiveMerchants(dateRange),
    reportsRepository.getMerchantsByStatus(dateRange),
    reportsRepository.getMerchantGrowthTrend(dateRange, params.period),
    reportsRepository.getTopPerformingMerchants(dateRange),
  ]);

  return {
    summary: {
      totalMerchants,
      newMerchants,
      activeMerchants,
      growthRate: calculateGrowthRate(newMerchants, totalMerchants),
    },
    breakdown: {
      byStatus: merchantsByStatus,
      topPerforming: topPerformingMerchants,
    },
    trends: {
      growth: merchantGrowthTrend,
    },
    period: params.period,
    dateRange: {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    },
  };
};

/**
 * Get financial reports
 */
export const getFinancialReports = async (params: {
  period: string;
  startDate?: string;
  endDate?: string;
}) => {
  const dateRange = buildDateRange(params.startDate, params.endDate, params.period);
  
  const [
    totalRevenue,
    totalRedemptions,
    averageOrderValue,
    revenueByCategory,
    revenueTrend,
  ] = await Promise.all([
    reportsRepository.getTotalRevenue(dateRange),
    reportsRepository.getTotalRedemptions(dateRange),
    reportsRepository.getAverageOrderValue(dateRange),
    reportsRepository.getRevenueByCategory(dateRange),
    reportsRepository.getRevenueTrend(dateRange, params.period),
  ]);

  return {
    summary: {
      totalRevenue,
      totalRedemptions,
      averageOrderValue,
      conversionRate: calculateConversionRate(totalRedemptions, totalRevenue),
    },
    breakdown: {
      byCategory: revenueByCategory,
    },
    trends: {
      revenue: revenueTrend,
    },
    period: params.period,
    dateRange: {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    },
  };
};

/**
 * Get fraud reports
 */
export const getFraudReports = async (params: {
  period: string;
  startDate?: string;
  endDate?: string;
}) => {
  const dateRange = buildDateRange(params.startDate, params.endDate, params.period);
  
  const [
    totalFlags,
    resolvedFlags,
    pendingFlags,
    flagsByType,
    fraudTrend,
  ] = await Promise.all([
    reportsRepository.getTotalFraudFlags(dateRange),
    reportsRepository.getResolvedFraudFlags(dateRange),
    reportsRepository.getPendingFraudFlags(dateRange),
    reportsRepository.getFraudFlagsByType(dateRange),
    reportsRepository.getFraudTrend(dateRange, params.period),
  ]);

  return {
    summary: {
      totalFlags,
      resolvedFlags,
      pendingFlags,
      resolutionRate: calculateResolutionRate(resolvedFlags, totalFlags),
    },
    breakdown: {
      byType: flagsByType,
    },
    trends: {
      flags: fraudTrend,
    },
    period: params.period,
    dateRange: {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    },
  };
};

/**
 * Get offer reports
 */
export const getOfferReports = async (params: {
  period: string;
  startDate?: string;
  endDate?: string;
}) => {
  const dateRange = buildDateRange(params.startDate, params.endDate, params.period);
  
  const [
    totalOffers,
    activeOffers,
    expiredOffers,
    offersByCategory,
    offerPerformance,
    offerTrend,
  ] = await Promise.all([
    reportsRepository.getTotalOffers(dateRange),
    reportsRepository.getActiveOffers(dateRange),
    reportsRepository.getExpiredOffers(dateRange),
    reportsRepository.getOffersByCategory(dateRange),
    reportsRepository.getTopPerformingOffers(dateRange),
    reportsRepository.getOfferTrend(dateRange, params.period),
  ]);

  return {
    summary: {
      totalOffers,
      activeOffers,
      expiredOffers,
      activeRate: calculateActiveRate(activeOffers, totalOffers),
    },
    breakdown: {
      byCategory: offersByCategory,
      topPerforming: offerPerformance,
    },
    trends: {
      offers: offerTrend,
    },
    period: params.period,
    dateRange: {
      start: dateRange.start.toISOString(),
      end: dateRange.end.toISOString(),
    },
  };
};

/**
 * Build date range for queries
 */
function buildDateRange(startDate?: string, endDate?: string, period?: string) {
  const now = new Date();
  
  if (startDate && endDate) {
    return {
      start: new Date(startDate),
      end: new Date(endDate),
    };
  }
  
  // Default ranges based on period
  switch (period) {
    case 'week':
      return {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
      };
    case 'year':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now,
      };
    case 'month':
    default:
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
      };
  }
}

/**
 * Calculate growth rate percentage
 */
function calculateGrowthRate(newCount: number, totalCount: number): number {
  return totalCount > 0 ? Math.round((newCount / totalCount) * 100) : 0;
}

/**
 * Calculate conversion rate
 */
function calculateConversionRate(redemptions: number, revenue: number): number {
  return revenue > 0 ? Math.round((redemptions / revenue) * 100) : 0;
}

/**
 * Calculate resolution rate
 */
function calculateResolutionRate(resolved: number, total: number): number {
  return total > 0 ? Math.round((resolved / total) * 100) : 0;
}

/**
 * Calculate active rate
 */
function calculateActiveRate(active: number, total: number): number {
  return total > 0 ? Math.round((active / total) * 100) : 0;
}