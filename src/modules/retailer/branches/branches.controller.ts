import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as branchesService from './branches.service.js';
import { CreateBranchDto, UpdateBranchDto, BranchesFilterDto } from './branches.validation.js';

/** GET /retailer/branches - Get all branches with pagination */
export const getBranches = async (req: Request, res: Response): Promise<void> => {
  const params = req.query as unknown as BranchesFilterDto;
  
  const data = await branchesService.getBranches(params);
  sendSuccess(res, data, 'Branches retrieved');
};

/** GET /retailer/branches/merchants - Get all merchants for dropdown */
export const getMerchantsForDropdown = async (req: Request, res: Response): Promise<void> => {
  const data = await branchesService.getMerchantsForDropdown();
  sendSuccess(res, data, 'Merchants for dropdown retrieved');
};

/** POST /retailer/branches - Create new branch */
export const createBranch = async (req: Request, res: Response): Promise<void> => {
  const dto = req.body as CreateBranchDto;
  const logoFile = req.file;

  const branch = await branchesService.createBranch(dto, logoFile);
  sendSuccess(res, branch, 'Branch created successfully', 201);
};

/** PUT /retailer/branches/:id - Update branch */
export const updateBranch = async (req: Request, res: Response): Promise<void> => {
  const branchId = req.params['id'] as string;
  const dto = req.body as UpdateBranchDto;
  const logoFile = req.file;

  const branch = await branchesService.updateBranch(branchId, dto, logoFile);
  sendSuccess(res, branch, 'Branch updated');
};

/** DELETE /retailer/branches/:id - Soft delete branch */
export const deleteBranch = async (req: Request, res: Response): Promise<void> => {
  const branchId = req.params['id'] as string;

  await branchesService.deleteBranch(branchId);
  sendSuccess(res, { deleted: true }, 'Branch deleted');
};