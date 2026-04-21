import * as analyticsRepository from './analytics.repository.js';

/**
 * Get analytics KPIs with date range filtering
 */
export const getKpis = async (params: {
  startDate?: string;
  endDate?: string;
}) => {
  const dateRange = buildDateRange(params.startDate, params.endDate);
  
  const [
    totalTransactions,
    totalRevenue,
    avgTransactionValue,
    successRate,
    previousPeriodStats,
  ] = await Promise.all([
    analyticsRepository.getTotalTransactions(dateRange),
    analyticsRepository.getTotalRevenue(dateRange),
    analyticsRepository.getAverageTransactionValue(dateRange),
    analyticsRepository.getSuccessRate(dateRange),
    analyticsRepository.getPreviousPeriodStats(dateRange),
  ]);

  // Calculate growth percentages
  const transactionGrowth = calculateGrowth(totalTransactions, previousPeriodStats.transactions);
  const revenueGrowth = calculateGrowth(totalRevenue, previousPeriodStats.revenue);
  const avgValueGrowth = calculateGrowth(avgTransactionValue, previousPeriodStats.avgValue);
  const successRateGrowth = calculateGrowth(successRate, previousPeriodStats.successRate);

  return {
    transactions: {
      title: 'Total Transactions',
      value: totalTransactions.toLocaleString(),
      trend: transactionGrowth,
      icon: 'transactions',
    },
    revenue: {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      trend: revenueGrowth,
      icon: 'revenue',
    },
    avgValue: {
      title: 'Avg Transaction Value',
      value: `$${avgTransactionValue.toFixed(2)}`,
      trend: avgValueGrowth,
      icon: 'avg-value',
    },
    successRate: {
      title: 'Success Rate',
      value: `${successRate.toFixed(1)}%`,
      trend: successRateGrowth,
      icon: 'success-rate',
    },
  };
};

/**
 * Get transaction history with filters
 */
export const getTransactions = async (params: {
  type?: string;
  status?: string;
  method?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}) => {
  const { transactions, total } = await analyticsRepository.getTransactionsWithFilters(params);
  
  // Map transactions to frontend format
  const items = transactions.map((transaction) => ({
    id: transaction._id.toString(),
    type: transaction.type || 'payment',
    amount: transaction.amount || 0,
    status: transaction.status || 'succeeded',
    method: transaction.method || 'card',
    location: transaction.location || 'Unknown',
    customer: transaction.customer || 'Anonymous',
    createdAt: transaction.createdAt,
    metadata: transaction.metadata || {},
  }));

  return { items, total };
};

/**
 * Export transactions as CSV
 */
export const exportTransactionsCsv = async (params: {
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
  method?: string;
  location?: string;
}) => {
  const transactions = await analyticsRepository.getTransactionsForExport(params);
  
  // CSV headers
  const headers = [
    'ID',
    'Type',
    'Amount',
    'Status',
    'Method',
    'Location',
    'Customer',
    'Created At',
  ];

  // CSV rows
  const rows = transactions.map((transaction) => [
    transaction._id.toString(),
    transaction.type || 'payment',
    transaction.amount || 0,
    transaction.status || 'succeeded',
    transaction.method || 'card',
    transaction.location || 'Unknown',
    transaction.customer || 'Anonymous',
    transaction.createdAt.toISOString(),
  ]);

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(',')),
  ].join('\n');

  return csvContent;
};

/**
 * Build date range for queries
 */
function buildDateRange(startDate?: string, endDate?: string) {
  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
  const end = endDate ? new Date(endDate) : now;
  
  return { start, end };
}

/**
 * Calculate growth percentage
 */
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}