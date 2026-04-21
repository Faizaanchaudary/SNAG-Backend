import { Request, Response, NextFunction } from 'express';
import * as auditService from '@modules/admin/audit/audit.service.js';

/**
 * Audit middleware to log admin actions
 */
export const auditLog = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(body: any) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const user = (req as any).user;
        if (user) {
          // Extract resource ID from params or response
          const resourceId = req.params.id || body?.data?.id;
          
          // Log the action asynchronously (don't block response)
          auditService.createAuditLog({
            userId: user.id,
            action,
            resource,
            resourceId,
            details: {
              method: req.method,
              path: req.path,
              body: req.method !== 'GET' ? req.body : undefined,
              params: req.params,
              query: req.query,
            },
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
          }).catch(console.error); // Log errors but don't fail the request
        }
      }
      
      // Call original json method
      return originalJson.call(this, body);
    };
    
    next();
  };
};

/**
 * Audit login attempts
 */
export const auditLogin = async (req: Request, userId?: string, success: boolean = true) => {
  try {
    await auditService.createAuditLog({
      userId: userId || 'anonymous',
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      resource: 'auth',
      details: {
        email: req.body.email,
        success,
        timestamp: new Date().toISOString(),
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    });
  } catch (error) {
    console.error('Failed to log audit entry:', error);
  }
};