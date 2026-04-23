import { NotFoundError } from '@core/errors/app-error.js';
import * as brandAssetsRepository from './brand-assets.repository.js';
import { BrandAssetsFilterDto } from './brand-assets.validation.js';

interface BrandAssetResponse {
  id: string;
  branchName: string;
  logoUrl?: string;
  industry: string;
  merchantId: string;
  merchantName: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Transform brand asset document to response format */
const toBrandAssetResponse = (asset: any): BrandAssetResponse => {
  const merchant = asset.merchant as any;
  return {
    id: asset._id.toString(),
    branchName: asset.branchName,
    logoUrl: asset.logoUrl,
    industry: asset.industry,
    merchantId: merchant._id.toString(),
    merchantName: `${merchant.firstName} ${merchant.lastName}`.trim(),
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
};

/** Get all brand assets with pagination and filtering */
export const getBrandAssets = async (params: BrandAssetsFilterDto) => {
  const { page, limit } = params;
  const { brandAssets, total } = await brandAssetsRepository.findBrandAssets(params);

  const items = brandAssets.map(toBrandAssetResponse);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/** Upload/Update brand asset logo */
export const uploadBrandAssetLogo = async (assetId: string, logoUrl: string) => {
  // Check if brand asset exists
  const asset = await brandAssetsRepository.findBrandAssetById(assetId);
  if (!asset || !asset.merchant || (asset.merchant as any).isDeleted) {
    throw new NotFoundError('Brand asset not found');
  }

  // Update logo URL
  const updatedAsset = await brandAssetsRepository.updateBrandAssetLogo(assetId, logoUrl);
  if (!updatedAsset) {
    throw new NotFoundError('Brand asset not found after update');
  }

  return toBrandAssetResponse(updatedAsset);
};

/** Remove brand asset logo (clear logoUrl only, don't delete branch) */
export const removeBrandAssetLogo = async (assetId: string) => {
  const asset = await brandAssetsRepository.findBrandAssetById(assetId);
  if (!asset || !asset.merchant || (asset.merchant as any).isDeleted) {
    throw new NotFoundError('Brand asset not found');
  }

  const updated = await brandAssetsRepository.clearBrandAssetLogo(assetId);
  if (!updated) throw new NotFoundError('Brand asset not found after update');

  return toBrandAssetResponse(updated);
};

/** Delete brand asset */
export const deleteBrandAsset = async (assetId: string) => {
  const asset = await brandAssetsRepository.findBrandAssetById(assetId);
  if (!asset || !asset.merchant || (asset.merchant as any).isDeleted) {
    throw new NotFoundError('Brand asset not found');
  }

  await brandAssetsRepository.deleteBrandAsset(assetId);
  return { deleted: true };
};