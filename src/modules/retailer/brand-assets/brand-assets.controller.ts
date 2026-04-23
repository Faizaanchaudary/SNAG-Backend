import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import { cloudinary } from '@config/cloudinary.js';
import * as brandAssetsService from './brand-assets.service.js';
import { BrandAssetsFilterDto } from './brand-assets.validation.js';

/** Upload file to Cloudinary */
const uploadToCloudinary = (file: Express.Multer.File): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'snag/branch-logos', resource_type: 'image' },
      (err, res) => (err ? reject(err) : resolve((res as any).secure_url)),
    );
    stream.end(file.buffer);
  });

/** GET /retailer/brand-assets - Get all brand assets with pagination */
export const getBrandAssets = async (req: Request, res: Response): Promise<void> => {
  const params = req.query as unknown as BrandAssetsFilterDto;
  const data = await brandAssetsService.getBrandAssets(params);
  sendSuccess(res, data, 'Brand assets retrieved');
};

/** POST /retailer/brand-assets/:id/upload-logo - Upload/Update brand asset logo */
export const uploadLogo = async (req: Request, res: Response): Promise<void> => {
  const assetId = req.params['id'] as string;

  if (!req.file) {
    res.status(400).json({
      success: false,
      error: { code: 'FILE_REQUIRED', message: 'Logo file is required' }
    });
    return;
  }

  // Upload to Cloudinary and get secure URL
  const logoUrl = await uploadToCloudinary(req.file);

  const data = await brandAssetsService.uploadBrandAssetLogo(assetId, logoUrl);
  sendSuccess(res, data, 'Logo uploaded successfully');
};

/** DELETE /retailer/brand-assets/:id/logo - Remove logo (clear logoUrl only) */
export const removeLogo = async (req: Request, res: Response): Promise<void> => {
  const assetId = req.params['id'] as string;
  const data = await brandAssetsService.removeBrandAssetLogo(assetId);
  sendSuccess(res, data, 'Logo removed');
};

/** DELETE /retailer/brand-assets/:id - Delete brand asset (soft delete branch) */
export const deleteBrandAsset = async (req: Request, res: Response): Promise<void> => {
  const assetId = req.params['id'] as string;
  await brandAssetsService.deleteBrandAsset(assetId);
  sendSuccess(res, { deleted: true }, 'Brand asset deleted');
};