import jwt from 'jsonwebtoken';
import { config } from '@config/index.js';
import { UserRole } from '@common/constants.js';
import { AuthError } from '@core/errors/app-error.js';

export interface JwtPayload {
  id: string;
  role: UserRole;
}

export const signAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtAccessExpiry as jwt.SignOptions['expiresIn'] });

export const signRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiry as jwt.SignOptions['expiresIn'] });

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch {
    throw new AuthError('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
  } catch {
    throw new AuthError('Invalid or expired refresh token');
  }
};
