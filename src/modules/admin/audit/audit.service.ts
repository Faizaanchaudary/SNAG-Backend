import * as auditRepository from './audit.repository.js';
import { AuditLogFilterDto } from './audit.validation.js';

/**
 * List audit logs with pagination and filters
 */
export const listAuditLogs = async (params: AuditLogFilterDto) => {
  const { logs, total } = await auditRepository.findAuditLogsWithFilters(params);
  
  // Map logs to admin-friendly format
  const items = logs.map((log) => {
    const user = log.userId as any; // Type assertion for populated field
    return {
      id: log._id.toString(),
      user: user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : 'Unknown User',
      userEmail: user?.email,
      userRole: user?.role,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.timestamp.toISOString(),
    };
  });

  return { items, total };
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
}) => {
  return await auditRepository.createAuditLog(data);
};

/**
 * Get audit statistics
 */
export const getAuditStats = async () => {
  return await auditRepository.getAuditStats();
};