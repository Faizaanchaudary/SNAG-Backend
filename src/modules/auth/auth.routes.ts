import { Router } from 'express';
import { validateBody } from '@middleware/validation.js';
import { authenticate } from '@middleware/auth.js';
import {
  merchantRegisterSchema,
  clientRegisterSchema,
  verifyEmailSchema,
  resendCodeSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
} from './auth.validation.js';
import * as authController from './auth.controller.js';

const router = Router();

// Merchant auth
router.post('/merchant/register',     validateBody(merchantRegisterSchema), authController.merchantRegister);
router.post('/merchant/verify-email', validateBody(verifyEmailSchema),      authController.verifyEmail);
router.post('/merchant/resend-code',  validateBody(resendCodeSchema),       authController.resendCode);

// Client auth
router.post('/client/register',     validateBody(clientRegisterSchema), authController.clientRegister);
router.post('/client/verify-email', validateBody(verifyEmailSchema),    authController.verifyEmail);
router.post('/client/resend-code',  validateBody(resendCodeSchema),     authController.resendCode);

// Shared login
router.post('/login', validateBody(loginSchema), authController.login);

// Refresh token (unauthenticated — uses refresh token for auth)
router.post('/refresh-token', validateBody(refreshTokenSchema), authController.refreshAccessToken);

// Password reset (unauthenticated — both roles)
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password',  validateBody(resetPasswordSchema),  authController.resetPassword);

// Change password (authenticated — both roles)
router.post('/change-password', authenticate, validateBody(changePasswordSchema), authController.changePassword);

// Get current user (authenticated — both roles)
router.get('/me', authenticate, authController.getCurrentUser);

// Logout (authenticated — both roles)
router.post('/logout', authenticate, authController.logout);

// Delete account (authenticated — both roles)
router.delete('/account', authenticate, authController.deleteAccount);

export default router;
