import { Offer, OfferDocument } from '@models/offer.model.js';
import { BranchProfile, BranchProfileDocument } from '@models/branch-profile.model.js';
import { Redemption, RedemptionDocument } from '@models/redemption.model.js';
import { User, UserDocument } from '@models/user.model.js';
import { USER_ROLES, OFFER_STATUSES } from '@common/constants.js';

/** Get total merchants count */
export const getTotalMerchants = (): Promise<number> =>
  User.countDocuments({ role: USER_ROLES.MERCHANT, isDeleted: false });

/** Get active branches count */
export const getActiveBranches = (): Promise<number> =>
  BranchProfile.countDocuments({ isDeleted: false });

/** Get live offers count */
export const getLiveOffers = (): Promise<number> =>
  Offer.countDocuments({ status: OFFER_STATUSES.ACTIVE });

/** Get total views across all offers */
export const getTotalViews = (): Promise<number> =>
  Offer.aggregate([
    { $group: { _id: null, total: { $sum: '$stats.views' } } },
  ]).then(r => r[0]?.total ?? 0);

/** Get total redemptions count */
export const getTotalRedemptions = (): Promise<number> =>
  Redemption.countDocuments();

/** Get views and impressions data for last 7 days */
export const getViewsImpressionsData = (startDate: Date) =>
  Offer.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' },
        views: { $sum: '$stats.views' },
        impressions: { $sum: { $multiply: ['$stats.views', 2.5] } }
      }
    }
  ]);

/** Get redemptions data for last 7 days */
export const getRedemptionsData = (startDate: Date) =>
  Redemption.aggregate([
    { $match: { redeemedAt: { $gte: startDate } } },
    { $group: { _id: { $dayOfWeek: '$redeemedAt' }, redemptions: { $sum: 1 } } },
  ]);

/** Get top offers by redemptions */
export const getTopOffersByRedemptions = (limit: number): Promise<OfferDocument[]> =>
  Offer.find()
    .populate('merchant', 'firstName lastName')
    .sort({ 'stats.redemptions': -1 })
    .limit(limit)
    .select('title stats.redemptions stats.views merchant')
    .exec();

/** Get recent merchants */
export const getRecentMerchants = (limit: number): Promise<UserDocument[]> =>
  User.find({ role: USER_ROLES.MERCHANT, isDeleted: false })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('firstName lastName createdAt')
    .exec();

/** Get recent offers */
export const getRecentOffers = (limit: number): Promise<OfferDocument[]> =>
  Offer.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('title createdAt')
    .exec();

/** Get recent redemptions */
export const getRecentRedemptions = (limit: number): Promise<RedemptionDocument[]> =>
  Redemption.find()
    .sort({ redeemedAt: -1 })
    .limit(limit)
    .populate('offer', 'title')
    .select('redeemedAt offer')
    .exec();