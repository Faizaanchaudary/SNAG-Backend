import { Request, Response } from 'express';
import * as authService from './auth.service.js';
import { sendSuccess } from '@core/http/response.js';
import { auditLogin } from '@middleware/audit.js';

export const merchantRegister = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.merchantRegister(req.body);
  sendSuccess(res, result, 'Registration successful', 201);
};

export const clientRegister = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.clientRegister(req.body);
  sendSuccess(res, result, 'Registration successful', 201);
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.verifyEmail(req.body);
  sendSuccess(res, result, 'Email verified');
};

export const resendCode = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.resendCode(req.body);
  sendSuccess(res, result);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    
    // Log successful login
    await auditLogin(req, result.user.id, true);
    
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    // Log failed login attempt
    await auditLogin(req, undefined, false);
    throw error; // Re-throw to be handled by error middleware
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.forgotPassword(req.body);
  sendSuccess(res, result);
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.resetPassword(req.body);
  sendSuccess(res, result);
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.changePassword(req.user!.id, req.body);
  sendSuccess(res, result);
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  const user = await authService.getCurrentUser(req.user!.id);
  sendSuccess(res, user);
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.body.refreshToken;
  const result = await authService.logout(req.user!.id, refreshToken);
  sendSuccess(res, result);
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.refreshAccessToken(req.body.refreshToken);
  sendSuccess(res, result);
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.deleteAccount(req.user!.id);
  sendSuccess(res, result);
};
