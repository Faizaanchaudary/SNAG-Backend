import mongoose from 'mongoose';
import { Redemption } from '@models/redemption.model.js';
import { BranchProfile } from '@models/branch-profile.model.js';

export const getScorecard = async (clientId: string) => {
  const cid = new mongoose.Types.ObjectId(clientId);

  const [totalRedemptions, monthlyStats, topMerchantResult] = await Promise.all([
    // Total redemptions
    Redemption.countDocuments({ client: cid }),

    // Redemptions per month (last 6 months) for avg monthly calc
    Redemption.aggregate([
      { $match: { client: cid } },
      {
        $group: {
          _id: { month: { $month: '$redeemedAt' }, year: { $year: '$redeemedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]),

    // Most snagged merchant
    Redemption.aggregate([
      { $match: { client: cid } },
      { $group: { _id: '$merchant', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
  ]);

  // Average monthly redemptions across recorded months
  const avgMonthly =
    monthlyStats.length > 0
      ? Math.round(monthlyStats.reduce((s, m) => s + m.count, 0) / monthlyStats.length)
      : 0;

  // Most snagged merchant name
  let mostSnagged = 'N/A';
  if (topMerchantResult.length > 0) {
    const profile = await BranchProfile.findOne({ merchant: topMerchantResult[0]._id }).lean().exec();
    mostSnagged = profile?.branchName ?? 'N/A';
  }

  // Streak: consecutive weeks with at least 1 redemption (up to last 12 weeks)
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const weeklyRedemptions = await Redemption.aggregate([
    { $match: { client: cid, redeemedAt: { $gte: twelveWeeksAgo } } },
    {
      $group: {
        _id: { week: { $isoWeek: '$redeemedAt' }, year: { $isoWeekYear: '$redeemedAt' } },
      },
    },
    { $sort: { '_id.year': -1, '_id.week': -1 } },
  ]);

  // Count streak from most recent week backward
  let streakWeeks = 0;
  const now = new Date();
  let checkYear = now.getFullYear();
  // Approximate current ISO week
  const startOfYear = new Date(checkYear, 0, 1);
  let checkWeek = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

  const weekSet = new Set(weeklyRedemptions.map((w) => `${w._id.year}-${w._id.week}`));

  for (let i = 0; i < 12; i++) {
    if (weekSet.has(`${checkYear}-${checkWeek}`)) {
      streakWeeks++;
      checkWeek--;
      if (checkWeek === 0) {
        checkYear--;
        checkWeek = 52;
      }
    } else {
      break;
    }
  }

  // User score: simple metric — capped at 100, 2 pts per redemption
  const userScore = Math.min(totalRedemptions * 2, 100);

  return {
    offersRedeemed: totalRedemptions,
    userScore,
    avgMonthly,
    mostSnagged,
    streakWeeks,
  };
};
