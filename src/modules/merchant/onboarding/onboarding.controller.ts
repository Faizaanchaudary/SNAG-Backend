import { Request, Response } from 'express';
import * as onboardingService from './onboarding.service.js';
import * as onboardingRepository from './onboarding.repository.js';
import { sendSuccess } from '@core/http/response.js';

export const saveBranchProfile = async (req: Request, res: Response): Promise<void> => {
  console.log('🔵 [BACKEND] saveBranchProfile called');
  console.log('🔵 Method:', req.method);
  console.log('🔵 User ID:', req.user!.id);
  console.log('🔵 Body:', req.body);
  console.log('🔵 File:', req.file ? req.file.filename : 'No file');
  
  // Only update onboarding step for POST (onboarding), not PATCH (settings edit)
  const shouldUpdateStep = req.method === 'POST';
  
  const result = await onboardingService.saveBranchProfile(
    req.user!.id,
    req.body,
    req.file,
    shouldUpdateStep,
  );
  
  console.log('✅ [BACKEND] saveBranchProfile result:', result);
  sendSuccess(res, result, 'Branch profile saved');
};

export const addLocation = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.addLocation(req.user!.id, req.body, req.file);
  sendSuccess(res, result, 'Location added', 201);
};

export const saveBranchInfo = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.saveBranchInfo(req.user!.id, req.body);
  sendSuccess(res, result, 'Branch info saved');
};

export const bulkUploadLocations = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'CSV file is required' } });
    return;
  }
  const result = await onboardingService.bulkUploadLocations(
    req.user!.id,
    req.file,
    req.body.notes,
  );
  sendSuccess(res, result, 'Bulk upload complete');
};

export const getLocations = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.getLocations(req.user!.id);
  sendSuccess(res, result);
};

export const completeOnboarding = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.completeOnboarding(req.user!.id);
  sendSuccess(res, result, "You're all set");
};

export const saveMerchantLocation = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.saveMerchantLocation(req.user!.id, req.body);
  sendSuccess(res, result, 'Location saved');
};

export const getLocationById = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.getLocationById(req.user!.id, req.params['id'] as string);
  sendSuccess(res, result);
};

export const editLocation = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.editLocation(
    req.user!.id,
    req.params['id'] as string,
    req.body,
    req.file,
  );
  sendSuccess(res, result, 'Location updated');
};

export const deleteLocation = async (req: Request, res: Response): Promise<void> => {
  const result = await onboardingService.deleteLocation(req.user!.id, req.params['id'] as string);
  sendSuccess(res, result);
};

export const getBranchProfile = async (req: Request, res: Response): Promise<void> => {
  const profile = await onboardingRepository.findBranchProfile(req.user!.id);
  sendSuccess(res, profile);
};
