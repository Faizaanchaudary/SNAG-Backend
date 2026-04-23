import { BranchProfile, BranchProfileDocument } from '@models/branch-profile.model.js';
import { User } from '@models/user.model.js';
import { USER_ROLES } from '@common/constants.js';
import { CreateBranchDto, UpdateBranchDto, BranchesFilterDto } from './branches.validation.js';

interface PaginatedBranches {
  branches: BranchProfileDocument[];
  total: number;
}

/** Find branches with pagination and filtering */
export const findBranches = async (params: BranchesFilterDto): Promise<PaginatedBranches> => {
  const { page, limit, search, merchantId } = params;
  const skip = (page - 1) * limit;

  // Build query - filter out deleted branches
  const query: any = { isDeleted: false };

  // Filter by specific merchant
  if (merchantId) {
    query.merchant = merchantId;
  }

  // Add search filter
  if (search) {
    query.$or = [
      { branchName: { $regex: search, $options: 'i' } },
      { branchAddress: { $regex: search, $options: 'i' } },
      { industry: { $regex: search, $options: 'i' } },
    ];
  }

  const [branches, total] = await Promise.all([
    BranchProfile.find(query)
      .populate({
        path: 'merchant',
        select: 'firstName lastName isDeleted',
        match: { isDeleted: false } // Only include non-deleted merchants
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    BranchProfile.countDocuments(query),
  ]);

  // Filter out branches whose merchants are deleted (populate returns null)
  const validBranches = branches.filter(branch => branch.merchant !== null);

  return {
    branches: validBranches,
    total: validBranches.length,
  };
};

/** Find branch by ID */
export const findBranchById = (branchId: string): Promise<BranchProfileDocument | null> =>
  BranchProfile.findOne({ _id: branchId, isDeleted: false })
    .populate('merchant', 'firstName lastName isDeleted')
    .exec();

/** Find branch by merchant ID */
export const findBranchByMerchant = (merchantId: string): Promise<BranchProfileDocument | null> =>
  BranchProfile.findOne({ merchant: merchantId, isDeleted: false })
    .populate('merchant', 'firstName lastName isDeleted')
    .exec();

/** Check if merchant exists and is not deleted */
export const findMerchantById = (merchantId: string) =>
  User.findOne({ 
    _id: merchantId, 
    role: USER_ROLES.MERCHANT,
    isDeleted: false 
  }).exec();

/** Get all merchants for dropdown (only active merchants without branches) */
export const findMerchantsForDropdown = () =>
  User.find({ 
    role: USER_ROLES.MERCHANT,
    isDeleted: false,
    isVerified: true // Only verified merchants
  })
    .select('_id firstName lastName email')
    .sort({ firstName: 1, lastName: 1 })
    .exec();

/** Create new branch */
export const createBranch = (dto: CreateBranchDto): Promise<BranchProfileDocument> => {
  const { merchantId, ...branchData } = dto;
  return new BranchProfile({ 
    ...branchData, 
    merchant: merchantId 
  }).save();
};

/** Update branch */
export const updateBranch = (branchId: string, dto: UpdateBranchDto): Promise<BranchProfileDocument | null> =>
  BranchProfile.findByIdAndUpdate(branchId, dto, { new: true })
    .populate('merchant', 'firstName lastName')
    .exec();

/** Soft delete branch */
export const deleteBranch = (branchId: string): Promise<BranchProfileDocument | null> =>
  BranchProfile.findByIdAndUpdate(branchId, { isDeleted: true }, { new: true }).exec();