import { AuditLog, AuditLogDocument } from '@models/audit-log.model.js';

/**
 * Find audit logs with pagination and filters
 */
export const findAuditLogsWithFilters = async (params: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}) => {
  const { userId, action, resource, startDate, endDate, page, limit } = params;
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery: any = {};
  
  if (userId) {
    searchQuery.userId = userId;
  }
  
  if (action) {
    searchQuery.action = { $regex: action, $options: 'i' };
  }
  
  if (resource) {
    searchQuery.resource = { $regex: resource, $options: 'i' };
  }
  
  if (startDate || endDate) {
    searchQuery.timestamp = {};
    if (startDate) {
      searchQuery.timestamp.$gte = new Date(startDate);
    }
    if (endDate) {
      searchQuery.timestamp.$lte = new Date(endDate);
    }
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(searchQuery)
      .populate('userId', 'firstName lastName email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    AuditLog.countDocuments(searchQuery),
  ]);

  return { logs, total };
};

/**
 * Create audit log entry
 */
export const createAuditLog = async (data: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuditLogDocument> => {
  return new AuditLog(data).save();
};

/**
 * Get audit log statistics
 */
export const getAuditStats = async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalLogs,
    todayLogs,
    weekLogs,
    monthLogs,
    topActions,
    topResources,
  ] = await Promise.all([
    AuditLog.countDocuments(),
    AuditLog.countDocuments({ timestamp: { $gte: today } }),
    AuditLog.countDocuments({ timestamp: { $gte: thisWeek } }),
    AuditLog.countDocuments({ timestamp: { $gte: thisMonth } }),
    AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    AuditLog.aggregate([
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return {
    totalLogs,
    todayLogs,
    weekLogs,
    monthLogs,
    topActions: topActions.map((item) => ({ action: item._id, count: item.count })),
    topResources: topResources.map((item) => ({ resource: item._id, count: item.count })),
  };
};