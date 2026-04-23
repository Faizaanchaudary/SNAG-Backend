import { BranchProfile, BranchProfileDocument } from '@models/branch-profile.model.js';
import { BrandAssetsFilterDto } from './brand-assets.validation.js';

interface PaginatedBrandAssets {
  brandAssets: BranchProfileDocument[];
  total: number;
}

/** Find brand assets (branches with logos) with pagination and filtering */
export const findBrandAssets = async (params: BrandAssetsFilterDto): Promise<PaginatedBrandAssets> => {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  // Build query - only non-deleted branches
  const query: any = { isDeleted: false };

  // Add search filter
  if (search) {
    query.$or = [
      { branchName: { $regex: search, $options: 'i' } },
      { industry: { $regex: search, $options: 'i' } },
    ];
  }

  const [brandAssets, total] = await Promise.all([
    BranchProfile.find(query)
      .populate({
        path: 'merchant',
        select: 'firstName lastName isDeleted',
        match: { isDeleted: false } // Only include non-deleted merchants
      })
      .select('branchName logoUrl industry merchant createdAt updatedAt')
      .sort({ branchName: 1 }) // Sort by branch name alphabetically
      .skip(skip)
      .limit(limit)
      .exec(),
    BranchProfile.countDocuments(query),
  ]);

  // Filter out branches whose merchants are deleted (populate returns null)
  const validBrandAssets = brandAssets.filter(asset => asset.merchant !== null);

  return {
    brandAssets: validBrandAssets,
    total: validBrandAssets.length,
  };
};

/** Find brand asset by ID */
export const findBrandAssetById = (assetId: string): Promise<BranchProfileDocument | null> =>
  BranchProfile.findOne({ _id: assetId, isDeleted: false })
    .populate('merchant', 'firstName lastName isDeleted')
    .select('branchName logoUrl industry merchant createdAt updatedAt')
    .exec();

/** Update brand asset logo */
export const updateBrandAssetLogo = (assetId: string, logoUrl: string): Promise<BranchProfileDocument | null> =>
  BranchProfile.findByIdAndUpdate(
    assetId, 
    { logoUrl }, 
    { new: true }
  )
    .populate('merchant', 'firstName lastName')
    .select('branchName logoUrl industry merchant createdAt updatedAt')
    .exec();

/** Clear brand asset logo (set logoUrl to undefined) */
export const clearBrandAssetLogo = (assetId: string): Promise<BranchProfileDocument | null> =>
  BranchProfile.findByIdAndUpdate(
    assetId,
    { $unset: { logoUrl: '' } },
    { new: true }
  )
    .populate('merchant', 'firstName lastName')
    .select('branchName logoUrl industry merchant createdAt updatedAt')
    .exec();

/** Delete brand asset (soft delete) */
export const deleteBrandAsset = (assetId: string): Promise<BranchProfileDocument | null> =>
  BranchProfile.findByIdAndUpdate(assetId, { isDeleted: true }, { new: true }).exec();