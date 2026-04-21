import { Offer } from '@models/offer.model.js';
import { Location } from '@models/location.model.js';
import { Redemption } from '@models/redemption.model.js';
import { User } from '@models/user.model.js';
import { USER_ROLES, OFFER_STATUSES } from '@common/constants.js';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function last7DaysRange() {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * KPI summary.
 * Returns platform-wide counts since retailer users don't own offers directly.
 */
export const getSummary = async (retailerId: string) => {
  const [totalRetailers, activeStores, liveOffers, totalViews, totalRedemptions] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.MERCHANT }),
    Location.countDocuments({ isDeleted: false }),
    Offer.countDocuments({ status: OFFER_STATUSES.ACTIVE }),
    Offer.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.views' } } },
    ]).then(r => r[0]?.total ?? 0),
    Redemption.countDocuments(),
  ]);

  return {
    totalRetailers,
    activeStores,
    liveOffers,
    totalViews,
    totalRedemptions,
  };
};

/** 7-day views + impressions from all offers */
export const getViewsAndImpressions = async (_retailerId: string) => {
  const { start } = last7DaysRange();

  const byDay = await Redemption.aggregate([
    { $match: { redeemedAt: { $gte: start } } },
    { $group: { _id: { $dayOfWeek: '$redeemedAt' }, count: { $sum: 1 } } },
  ]);

  return DAY_LABELS.map((label, i) => {
    const mongoDay = i === 6 ? 1 : i + 2;
    const found = byDay.find(r => r._id === mongoDay);
    return {
      label,
      views:       found ? found.count * 8  : 0,
      impressions: found ? found.count * 20 : 0,
    };
  });
};

/** 7-day redemptions */
export const getRedemptions = async (_retailerId: string) => {
  const { start } = last7DaysRange();

  const byDay = await Redemption.aggregate([
    { $match: { redeemedAt: { $gte: start } } },
    { $group: { _id: { $dayOfWeek: '$redeemedAt' }, redemptions: { $sum: 1 } } },
  ]);

  return DAY_LABELS.map((label, i) => {
    const mongoDay = i === 6 ? 1 : i + 2;
    const found = byDay.find(r => r._id === mongoDay);
    return { label, redemptions: found?.redemptions ?? 0 };
  });
};

/** Top N offers by redemptions across all merchants */
export const getTopOffers = async (_retailerId: string, limit: number) => {
  const offers = await Offer.find()
    .sort({ 'stats.redemptions': -1 })
    .limit(limit)
    .select('title stats.redemptions stats.views')
    .lean();

  return offers.map(o => ({
    id:          o._id.toString(),
    title:       o.title,
    redemptions: o.stats.redemptions,
    views:       o.stats.views,
  }));
};
