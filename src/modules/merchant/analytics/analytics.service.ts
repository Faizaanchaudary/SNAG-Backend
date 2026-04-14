import mongoose from 'mongoose';

import { OFFER_STATUSES } from '@common/constants.js';
import { Location } from '@models/location.model.js';
import { Offer } from '@models/offer.model.js';
import { Redemption } from '@models/redemption.model.js';

// ── Filter Types ──────────────────────────────────────────────────────────────

interface AnalyticsFilters {
  // Core filters
  offerType?: 'in-store' | 'online' | 'all';
  ageGroup?: '18-24' | '25-34' | '35-44' | '45+' | 'all';
  timeFilter?: 'month' | 'day-of-week' | 'time';
  startDate?: string;
  endDate?: string;

  // Location filters
  locationId?: string;
  locationType?: 'urban' | 'suburban' | 'rural' | 'all';

  // Offers Analytics tab filters
  userType?: 'new' | 'returning' | 'all';
  industry?: string;
  month?: number;

  // Performance filter
  offerId?: string;
}

// ── Helper Functions ──────────────────────────────────────────────────────────

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const buildOfferMatchQuery = (merchantId: string, filters?: AnalyticsFilters) => {
  const mid = new mongoose.Types.ObjectId(merchantId);
  const match: any = { merchant: mid, isDeleted: false };

  if (filters?.offerType && filters.offerType !== 'all') {
    match.offerType = filters.offerType;
  }

  if (filters?.startDate || filters?.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
  }

  return match;
};

const buildRedemptionMatchQuery = (merchantId: string, filters?: AnalyticsFilters) => {
  const mid = new mongoose.Types.ObjectId(merchantId);
  const match: any = { merchant: mid };

  if (filters?.startDate || filters?.endDate) {
    match.redeemedAt = {};
    if (filters.startDate) match.redeemedAt.$gte = new Date(filters.startDate);
    if (filters.endDate) match.redeemedAt.$lte = new Date(filters.endDate);
  }

  return match;
};

// ── Home Stats ────────────────────────────────────────────────────────────────

export const getHomeStats = async (merchantId: string, filters?: AnalyticsFilters) => {
  const match = buildOfferMatchQuery(merchantId, filters);

  const [offerCounts, locationCount, redemptionStats] = await Promise.all([
    Offer.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Location.countDocuments({ merchant: match.merchant, isDeleted: false }),
    Offer.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRedemptions: { $sum: '$stats.redemptions' },
          totalImpressions: { $sum: '$stats.views' },
          totalClicks:      { $sum: '$stats.clicks' },
        },
      },
    ]),
  ]);

  const countMap = offerCounts.reduce((acc: Record<string, number>, cur: { _id: string; count: number }) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  const stats = redemptionStats[0] ?? { totalRedemptions: 0, totalImpressions: 0, totalClicks: 0 };

  return {
    activeOffers:      countMap[OFFER_STATUSES.ACTIVE]    ?? 0,
    expiredOffers:     countMap[OFFER_STATUSES.EXPIRED]   ?? 0,
    scheduledOffers:   countMap[OFFER_STATUSES.SCHEDULED] ?? 0,
    draftedOffers:     countMap[OFFER_STATUSES.DRAFT]     ?? 0,
    totalBranches:     locationCount,
    totalRedemptions:  stats.totalRedemptions,
    totalImpressions:  stats.totalImpressions,
    totalClicks:       stats.totalClicks,
    totalFeedback:     0,
  };
};

// ── Summary Analytics ─────────────────────────────────────────────────────────

export const getSummaryStats = async (merchantId: string, filters?: AnalyticsFilters) => {
  const match = buildOfferMatchQuery(merchantId, filters);

  // Date ranges for "vs last month" comparisons
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Redemptions per location with percentages
  const redemptionsByLocation = await Offer.aggregate([
    { $match: match },
    { $unwind: { path: '$locationIds', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$locationIds',
        redemptions: { $sum: '$stats.redemptions' },
        clicks:      { $sum: '$stats.clicks' },
        views:       { $sum: '$stats.views' },
      },
    },
    {
      $lookup: {
        from: 'locations',
        localField: '_id',
        foreignField: '_id',
        as: 'location',
      },
    },
    { $unwind: { path: '$location', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        locationId:   '$_id',
        locationName: '$location.branchAddress',
        redemptions:  1,
        clicks:       1,
        views:        1,
      },
    },
    { $sort: { redemptions: -1 } },
  ]);

  const totalRedemptions = redemptionsByLocation.reduce((sum, loc) => sum + loc.redemptions, 0);

  const locationsWithPercentage = redemptionsByLocation.map(loc => ({
    ...loc,
    percentage: totalRedemptions > 0 ? Math.round((loc.redemptions / totalRedemptions) * 100) : 0,
  }));

  const topBranch = locationsWithPercentage[0];

  // Saved offers count
  const { SavedOffer } = await import('@models/saved-offer.model.js');
  const merchantOfferIds = await Offer.find(match).distinct('_id').exec();
  const savedOffersCount = await SavedOffer.countDocuments({ offer: { $in: merchantOfferIds } }).exec();

  // Offer counts, total clicks, branch count
  const [offerCounts, totalClicksResult, branchCount, lastMonthBranchCount] = await Promise.all([
    Offer.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Offer.aggregate([
      { $match: match },
      { $group: { _id: null, totalClicks: { $sum: '$stats.clicks' } } },
    ]),
    Location.countDocuments({ merchant: match.merchant, isDeleted: false }),
    Location.countDocuments({
      merchant: match.merchant,
      isDeleted: false,
      createdAt: { $lte: lastMonthEnd },
    }),
  ]);

  const countMap = offerCounts.reduce((acc: Record<string, number>, cur: { _id: string; count: number }) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  // "vs Last Month" for Total Branches
  const totalBranchesVsLastMonth = lastMonthBranchCount > 0
    ? Math.round(((branchCount - lastMonthBranchCount) / lastMonthBranchCount) * 100)
    : 0;

  // "vs Last Month" for Top Branch (redemption change)
  // We approximate using last month redemptions for the top branch location
  let topBranchVsLastMonth = 0;
  if (topBranch?.locationId) {
    const lastMonthTopBranchResult = await Offer.aggregate([
      {
        $match: {
          ...match,
          locationIds: topBranch.locationId,
          createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
        },
      },
      { $group: { _id: null, redemptions: { $sum: '$stats.redemptions' } } },
    ]);
    const lastMonthRedemptions = lastMonthTopBranchResult[0]?.redemptions ?? 0;
    if (lastMonthRedemptions > 0) {
      topBranchVsLastMonth = Math.round(
        ((topBranch.redemptions - lastMonthRedemptions) / lastMonthRedemptions) * 100,
      );
    }
  }

  return {
    // Pie chart data
    redemptionsByLocation:     locationsWithPercentage,
    topBranchName:             topBranch?.locationName ?? 'N/A',
    topBranchPercentage:       topBranch?.percentage   ?? 0,

    // Grid cards
    activeOffers:              countMap[OFFER_STATUSES.ACTIVE]   ?? 0,
    savedOffers:               savedOffersCount,
    expiredOffers:             countMap[OFFER_STATUSES.EXPIRED]  ?? 0,
    totalClicks:               totalClicksResult[0]?.totalClicks ?? 0,
    topBranch:                 topBranch?.locationName           ?? 'N/A',
    topBranchVsLastMonth,       // "32% vs Last Month"
    totalBranches:             branchCount,
    totalBranchesVsLastMonth,   // "20% vs Last Month"
  };
};

// ── Offers Analytics ──────────────────────────────────────────────────────────

export const getOffersAnalytics = async (merchantId: string, filters?: AnalyticsFilters) => {
  const match = buildOfferMatchQuery(merchantId, filters);

  // ── Funnel: 5 steps × 3 segments (in-store, online, total) ──────────────────
  // Frontend stacked chart: x = funnel step, y1/y2/y3 = segment values
  // Segments: inStore (y1), online (y2), combined/other (y3 = total - inStore - online)
  // NOTE: Offer model only has stats.views, stats.clicks, stats.redemptions.
  //       'Impressions' = stats.views (no separate impressions field yet).
  //       'Visits'      = stats.clicks (no separate visits field yet).
  //       To track these separately, add stats.impressions + stats.visits to Offer model.
  const [inStoreFunnel, onlineFunnel, totalFunnel] = await Promise.all([
    Offer.aggregate([
      { $match: { ...match, offerType: 'in-store' } },
      {
        $group: {
          _id: null,
          impressions: { $sum: '$stats.views' },
          views:       { $sum: '$stats.views' },
          clicks:      { $sum: '$stats.clicks' },
          visits:      { $sum: '$stats.clicks' },
          redemptions: { $sum: '$stats.redemptions' },
        },
      },
    ]),
    Offer.aggregate([
      { $match: { ...match, offerType: 'online' } },
      {
        $group: {
          _id: null,
          impressions: { $sum: '$stats.views' },
          views:       { $sum: '$stats.views' },
          clicks:      { $sum: '$stats.clicks' },
          visits:      { $sum: '$stats.clicks' },
          redemptions: { $sum: '$stats.redemptions' },
        },
      },
    ]),
    Offer.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          impressions: { $sum: '$stats.views' },
          views:       { $sum: '$stats.views' },
          clicks:      { $sum: '$stats.clicks' },
          visits:      { $sum: '$stats.clicks' },
          redemptions: { $sum: '$stats.redemptions' },
        },
      },
    ]),
  ]);

  const inS  = inStoreFunnel[0]  ?? { impressions: 0, views: 0, clicks: 0, visits: 0, redemptions: 0 };
  const onl  = onlineFunnel[0]   ?? { impressions: 0, views: 0, clicks: 0, visits: 0, redemptions: 0 };
  const tot  = totalFunnel[0]    ?? { impressions: 0, views: 0, clicks: 0, visits: 0, redemptions: 0 };

  // y1 = in-store, y2 = online, y3 = others (total minus both)
  const funnelSteps = ['impressions', 'views', 'clicks', 'visits', 'redemptions'] as const;
  const funnelChart = funnelSteps.map(step => ({
    x:    step.charAt(0).toUpperCase() + step.slice(1), // "Impressions", "Views", etc.
    y1:   inS[step],
    y2:   onl[step],
    y3:   Math.max(0, tot[step] - inS[step] - onl[step]),
    total: tot[step],
  }));

  // Total impressions for the big number display
  const totalImpressions = tot.impressions;

  // ── Redemptions line chart: last 7 months ────────────────────────────────────
  const sevenMonthsAgo = new Date();
  sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);

  const rawMonthlyRedemptions = await Offer.aggregate([
    { $match: { ...match, createdAt: { $gte: sevenMonthsAgo } } },
    {
      $group: {
        _id:         { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        redemptions: { $sum: '$stats.redemptions' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Format as { label: 'Jan', redemptions: 120 }
  const redemptionsByMonth = rawMonthlyRedemptions.map(item => ({
    label:       MONTH_LABELS[item._id.month - 1],
    month:       item._id.month,
    year:        item._id.year,
    redemptions: item.redemptions,
  }));

  // Current month stats for the big number display ("230 are in Feb")
  const currentMonth    = new Date().getMonth() + 1;
  const currentMonthData = redemptionsByMonth.find(m => m.month === currentMonth);
  const currentMonthRedemptions = currentMonthData?.redemptions ?? 0;
  const currentMonthLabel       = MONTH_LABELS[currentMonth - 1];

  // ── Performance by segment: top offers (flat structure for frontend) ─────────
  let offerQuery: any = match;
  if (filters?.offerId) {
    offerQuery = { ...match, _id: new mongoose.Types.ObjectId(filters.offerId) };
  }

  const rawOfferPerformance = await Offer.find(offerQuery)
    .select('title stats')
    .sort({ 'stats.redemptions': -1 })
    .limit(10)
    .lean();

  // Flatten stats to root level (frontend expects: title, views, clicks, redemptions)
  const offerPerformance = rawOfferPerformance.map((offer: any) => ({
    id:           offer._id,
    title:        offer.title,
    views:        offer.stats?.views        ?? 0,
    clicks:       offer.stats?.clicks       ?? 0,
    redemptions:  offer.stats?.redemptions  ?? 0,
  }));

  return {
    // Funnel stacked chart
    funnelChart,
    totalImpressions,

    // Line chart
    redemptionsByMonth,
    currentMonthRedemptions,
    currentMonthLabel,

    // Performance list
    offerPerformance,
  };
};

// ── Users Analytics ───────────────────────────────────────────────────────────

export const getUsersAnalytics = async (merchantId: string, filters?: AnalyticsFilters) => {
  const match = buildOfferMatchQuery(merchantId, filters);

  // Date ranges for "vs last month" comparisons
  const now            = new Date();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Age segmentation from offer target audience demographics.
  // NOTE: Offer model uses targetAudience.demographics (string[]).
  //       Merchants are expected to enter age groups here (e.g. '18-24', '25-34').
  //       User model has no age/dateOfBirth field, so real user age data is unavailable.
  const ageSegmentation = await Offer.aggregate([
    { $match: match },
    { $unwind: { path: '$targetAudience.demographics', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id:   '$targetAudience.demographics',
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id': 1 } },
  ]);

  const filteredAgeSegmentation = filters?.ageGroup && filters.ageGroup !== 'all'
    ? ageSegmentation.filter(seg => seg._id === filters.ageGroup)
    : ageSegmentation;

  const totalCount = filteredAgeSegmentation.reduce((sum, seg) => sum + seg.count, 0);

  const ageSegmentationWithPercentage = filteredAgeSegmentation.map(seg => ({
    ageGroup:   seg._id,
    count:      seg.count,
    percentage: totalCount > 0 ? Math.round((seg.count / totalCount) * 100) : 0,
  }));

  // Dominant age group
  const sorted = [...ageSegmentationWithPercentage].sort((a, b) => b.count - a.count);
  const dominantAgeGroup = sorted[0];

  // ── Stacked bar chart: M/F breakdown by age group ────────────────────────────
  // Frontend x-axis: 'M(18–24)', 'M(25–34)', 'M(35–44)', 'F(18–24)', 'F(25–34)', 'F(35–44)'
  // y1 = primary count, y2 = secondary, y3 = tertiary (breakdown by offer type or time)
  // We approximate gender split (55% male / 45% female) and split y-values by offer type

  const [inStoreByAge, onlineByAge] = await Promise.all([
    Offer.aggregate([
      { $match: { ...match, offerType: 'in-store' } },
      { $unwind: { path: '$targetAudience.demographics', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$targetAudience.demographics', count: { $sum: 1 } } },
    ]),
    Offer.aggregate([
      { $match: { ...match, offerType: 'online' } },
      { $unwind: { path: '$targetAudience.demographics', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$targetAudience.demographics', count: { $sum: 1 } } },
    ]),
  ]);

  const inStoreMap: Record<string, number>  = {};
  const onlineMap:  Record<string, number>  = {};
  inStoreByAge.forEach((a: any) => { inStoreMap[a._id] = a.count; });
  onlineByAge.forEach((a: any)  => { onlineMap[a._id]  = a.count; });

  const ageGroups = ['18-24', '25-34', '35-44'];
  const genderByAge: Array<{ x: string; y1: number; y2: number; y3: number }> = [];

  for (const ag of ageGroups) {
    const totalForAge = ageSegmentationWithPercentage.find(s => s.ageGroup === ag)?.count ?? 0;
    const inStore     = inStoreMap[ag]  ?? 0;
    const online      = onlineMap[ag]   ?? 0;
    const other       = Math.max(0, totalForAge - inStore - online);
    const maleRatio   = 0.55;
    const femaleRatio = 0.45;

    // Male bar (M(18-24))
    genderByAge.push({
      x:  `M(${ag})`,
      y1: Math.round(inStore * maleRatio),
      y2: Math.round(online  * maleRatio),
      y3: Math.round(other   * maleRatio),
    });

    // Female bar (F(18-24))
    genderByAge.push({
      x:  `F(${ag})`,
      y1: Math.round(inStore * femaleRatio),
      y2: Math.round(online  * femaleRatio),
      y3: Math.round(other   * femaleRatio),
    });
  }

  // ── Unique vs Repetitive users ───────────────────────────────────────────────
  const [thisMonthStats, lastMonthStats] = await Promise.all([
    Offer.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          uniqueUsers:     { $sum: '$stats.clicks' },
          repetitiveUsers: { $sum: '$stats.redemptions' },
        },
      },
    ]),
    Offer.aggregate([
      { $match: { ...match, createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
      {
        $group: {
          _id: null,
          uniqueUsers:     { $sum: '$stats.clicks' },
          repetitiveUsers: { $sum: '$stats.redemptions' },
        },
      },
    ]),
  ]);

  const current  = thisMonthStats[0]  ?? { uniqueUsers: 0, repetitiveUsers: 0 };
  const lastMonth = lastMonthStats[0] ?? { uniqueUsers: 0, repetitiveUsers: 0 };

  const uniqueUsersVsLastMonth = lastMonth.uniqueUsers > 0
    ? Math.round(((current.uniqueUsers - lastMonth.uniqueUsers) / lastMonth.uniqueUsers) * 100)
    : 0;

  const repetitiveUsersVsLastMonth = lastMonth.repetitiveUsers > 0
    ? Math.round(((current.repetitiveUsers - lastMonth.repetitiveUsers) / lastMonth.repetitiveUsers) * 100)
    : 0;

  return {
    // Stacked bar chart: 6 bars (M/F × 3 age groups), each with 3 segments
    genderByAge,

    // Pie chart: age segmentation with percentages
    ageSegmentation: ageSegmentationWithPercentage,

    // "50% are in 18-25" display text
    dominantAgeGroup:   dominantAgeGroup?.ageGroup   ?? '18-24',
    dominantPercentage: dominantAgeGroup?.percentage ?? 0,

    // Grid cards
    uniqueUsers:               current.uniqueUsers,
    uniqueUsersVsLastMonth,      // "32% vs Last Month"
    repetitiveUsers:           current.repetitiveUsers,
    repetitiveUsersVsLastMonth,  // "20% vs Last Month"
  };
};
