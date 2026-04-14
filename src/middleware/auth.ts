import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@core/auth/jwt.js';
import { AuthError, ForbiddenError } from '@core/errors/app-error.js';
import { UserRole } from '@common/constants.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AuthError('No token provided');

  req.user = verifyAccessToken(header.substring(7));
  next();
};

export const requireRole = (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }
    next();
  };
