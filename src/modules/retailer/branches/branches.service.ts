import { NotFoundError, ConflictError } from '@core/errors/app-error.js';
import { cloudinary } from '@config/cloudinary.js';
import * as branchesRepository from './branches.repository.js';
import { CreateBranchDto, UpdateBranchDto, BranchesFilterDto } from './branches.validation.js';

/** Upload file to Cloudinary */
const uploadToCloudinary = (file: Express.Multer.File, folder: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, res) => (err ? reject(err) : resolve((res as any).secure_url)),
    );
    stream.end(file.buffer);
  });
import { CreateBranchDto, UpdateBranchDto, BranchesFilterDto } from './branches.validation.js';

interface BranchResponse {
  id: string;
  merchantId: string;
  merchantName: string;
  branchName: string;
  phoneNumber: string;
  branchAddress: string;
  logoUrl?: string;
  industry: string;
  subCategories: string[];
  role?: string;
  createdAt: Date;
}

/** Transform branch document to response format */
const toBranchResponse = (branch: any): BranchResponse => {
  const merchant = branch.merchant as any;
  return {
    id: branch._id.toString(),
    merchantId: merchant._id.toString(),
    merchantName: `${merchant.firstName} ${merchant.lastName}`.trim(),
    branchName: branch.branchName,
    phoneNumber: branch.phoneNumber,
    branchAddress: branch.branchAddress,
    logoUrl: branch.logoUrl,
    industry: branch.industry,
    subCategories: branch.subCategories,
    role: branch.role,
    createdAt: branch.createdAt,
  };
};

/** Get all branches with pagination and filtering */
export const getBranches = async (params: BranchesFilterDto) => {
  const { page, limit } = params;
  const { branches, total } = await branchesRepository.findBranches(params);

  const items = branches.map(toBranchResponse);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/** Get merchants for dropdown */
export const getMerchantsForDropdown = async () => {
  const merchants = await branchesRepository.findMerchantsForDropdown();
  
  // Get merchants that already have branches to exclude them
  const merchantsWithBranches = await branchesRepository.findBranches({ 
    page: 1, 
    limit: 1000 // Get all to check which merchants have branches
  });
  
  const merchantsWithBranchesIds = new Set(
    merchantsWithBranches.branches.map(branch => (branch.merchant as any)._id.toString())
  );

  // Filter out merchants that already have branches
  const availableMerchants = merchants.filter(
    merchant => !merchantsWithBranchesIds.has(merchant._id.toString())
  );

  return availableMerchants.map(merchant => ({
    id: merchant._id.toString(),
    name: `${merchant.firstName} ${merchant.lastName}`.trim(),
    email: merchant.email,
  }));
};

/** Create new branch */
export const createBranch = async (dto: CreateBranchDto, logoFile?: Express.Multer.File) => {
  // Check if merchant exists and is not deleted
  const merchant = await branchesRepository.findMerchantById(dto.merchantId);
  if (!merchant) throw new NotFoundError('Merchant not found');

  // Check if merchant already has a branch (unique constraint)
  const existingBranch = await branchesRepository.findBranchByMerchant(dto.merchantId);
  if (existingBranch) throw new ConflictError('Merchant already has a branch profile');

  // Upload logo if provided
  const logoUrl = logoFile
    ? await uploadToCloudinary(logoFile, 'snag/branch-logos')
    : dto.logoUrl;

  const newBranch = await branchesRepository.createBranch({ ...dto, logoUrl });

  const branchWithMerchant = await branchesRepository.findBranchById(newBranch._id.toString());
  if (!branchWithMerchant) throw new NotFoundError('Branch not found after creation');

  return toBranchResponse(branchWithMerchant);
};

/** Update branch */
export const updateBranch = async (branchId: string, dto: UpdateBranchDto, logoFile?: Express.Multer.File) => {
  const branch = await branchesRepository.findBranchById(branchId);
  if (!branch || !branch.merchant || (branch.merchant as any).isDeleted) {
    throw new NotFoundError('Branch not found');
  }

  // Upload new logo if provided
  const logoUrl = logoFile
    ? await uploadToCloudinary(logoFile, 'snag/branch-logos')
    : dto.logoUrl;

  const updatedBranch = await branchesRepository.updateBranch(branchId, { ...dto, logoUrl });
  if (!updatedBranch) throw new NotFoundError('Branch not found after update');

  return toBranchResponse(updatedBranch);
};

/** Soft delete branch */
export const deleteBranch = async (branchId: string) => {
  const branch = await branchesRepository.findBranchById(branchId);
  
  if (!branch || !branch.merchant || (branch.merchant as any).isDeleted) {
    throw new NotFoundError('Branch not found');
  }

  await branchesRepository.deleteBranch(branchId);
  return { deleted: true };
};