import crypto from 'crypto';
import { OTP_LENGTH } from '@common/constants.js';

export const generateOtp = (): string => {
  // Cryptographically secure random OTP
  const max = Math.pow(10, OTP_LENGTH);
  const min = Math.pow(10, OTP_LENGTH - 1);
  return (crypto.randomInt(min, max)).toString();
};
