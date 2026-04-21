import { Redemption } from '@models/redemption.model.js';
import { Offer } from '@models/offer.model.js';
import { User } from '@models/user.model.js';

/**
 * Get total transactions (redemptions) in date range
 */
export const getTotalTransactions = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  return await Redemption.countDocuments({
    redeemedAt: { $gte: dateRange.start, $lte: dateRange.end },
  });
};

/**
 * Get total revenue (simulated based on redemptions)
 */
export const getTotalRevenue = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  const redemptions = await Redemption.countDocuments({
    redeemedAt: { $gte: dateRange.start, $lte: dateRange.end },
  });
  
  // Simulate revenue: average $15 per redemption
  return redemptions * 15;
};

/**
 * Get average transaction value
 */
export const getAverageTransactionValue = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  const totalTransactions = await getTotalTransactions(dateRange);
  const totalRevenue = await getTotalRevenue(dateRange);
  
  return totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
};

/**
 * Get success rate (percentage of successful redemptions)
 */
export const getSuccessRate = async (dateRange: { start: Date; end: Date }): Promise<number> => {
  const totalRedemptions = await getTotalTransactions(dateRange);
  
  // For now, assume 95% success rate (in real implementation, track failed attempts)
  return totalRedemptions > 0 ? 95 : 0;
};

/**
 * Get previous period stats for comparison
 */
export const getPreviousPeriodStats = async (dateRange: { start: Date; end: Date }) => {
  const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
  const previousStart = new Date(dateRange.start.getTime() - periodLength);
  const previousEnd = new Date(dateRange.end.getTime() - periodLength);
  
  const previousRange = { start: previousStart, end: previousEnd };
  
  const [transactions, revenue, avgValue, successRate] = await Promise.all([
    getTotalTransactions(previousRange),
    getTotalRevenue(previousRange),
    getAverageTransactionValue(previousRange),
    getSuccessRate(previousRange),
  ]);
  
  return { transactions, revenue, avgValue, successRate };
};

/**
 * Get transactions with filters and pagination
 */
export const getTransactionsWithFilters = async (params: {
  type?: string;
  status?: string;
  method?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}) => {
  const { page, limit } = params;
  const skip = (page - 1) * limit;
  
  // Build date range
  const dateRange = buildDateRange(params.startDate, params.endDate);
  
  // For now, use redemptions as transactions
  // In a real implementation, you'd have a dedicated transactions collection
  const query: any = {
    redeemedAt: { $gte: dateRange.start, $lte: dateRange.end },
  };
  
  const [transactions, total] = await Promise.all([
    Redemption.find(query)
      .populate('client', 'firstName lastName email')
      .populate('offer', 'title')
      .populate('merchant', 'firstName lastName')
      .sort({ redeemedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Redemption.countDocuments(query),
  ]);
  
  // Map to transaction format
  const mappedTransactions = transactions.map((redemption) => {
    const merchant = redemption.merchant as any; // Type assertion for populated field
    const client = redemption.client as any; // Type assertion for populated field
    const offer = redemption.offer as any; // Type assertion for populated field
    
    return {
      _id: redemption._id,
      type: 'redemption',
      amount: Math.floor(Math.random() * 50) + 10, // Simulate amount
      status: 'succeeded',
      method: 'mobile',
      location: merchant?.firstName && merchant?.lastName 
        ? `${merchant.firstName} ${merchant.lastName}` 
        : 'Unknown',
      customer: client?.firstName && client?.lastName 
        ? `${client.firstName} ${client.lastName}` 
        : 'Anonymous',
      createdAt: redemption.redeemedAt,
      metadata: {
        offerId: offer?._id,
        offerTitle: offer?.title,
      },
    };
  });
  
  return { transactions: mappedTransactions, total };
};

/**
 * Get transactions for CSV export (no pagination)
 */
export const getTransactionsForExport = async (params: {
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
  method?: string;
  location?: string;
}) => {
  const dateRange = buildDateRange(params.startDate, params.endDate);
  
  const query: any = {
    redeemedAt: { $gte: dateRange.start, $lte: dateRange.end },
  };
  
  const transactions = await Redemption.find(query)
    .populate('client', 'firstName lastName email')
    .populate('offer', 'title')
    .populate('merchant', 'firstName lastName')
    .sort({ redeemedAt: -1 })
    .limit(10000) // Reasonable limit for CSV export
    .exec();
  
  // Map to transaction format
  return transactions.map((redemption) => {
    const merchant = redemption.merchant as any; // Type assertion for populated field
    const client = redemption.client as any; // Type assertion for populated field
    
    return {
      _id: redemption._id,
      type: 'redemption',
      amount: Math.floor(Math.random() * 50) + 10, // Simulate amount
      status: 'succeeded',
      method: 'mobile',
      location: merchant?.firstName && merchant?.lastName 
        ? `${merchant.firstName} ${merchant.lastName}` 
        : 'Unknown',
      customer: client?.firstName && client?.lastName 
        ? `${client.firstName} ${client.lastName}` 
        : 'Anonymous',
      createdAt: redemption.redeemedAt,
    };
  });
};

/**
 * Build date range helper
 */
function buildDateRange(startDate?: string, endDate?: string) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = endDate ? new Date(endDate) : now;
  
  return { start, end };
}