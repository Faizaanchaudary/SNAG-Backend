import * as onboardingRepository from './onboarding.repository.js';
import { cloudinary } from '@config/cloudinary.js';
import { MERCHANT_ONBOARDING_STEPS } from '@common/constants.js';
import { NotFoundError, ValidationError } from '@core/errors/app-error.js';
import { csvLocationRowSchema } from './onboarding.validation.js';
import type { BranchProfileDto, AddLocationDto, BranchInfoDto, SaveMerchantLocationDto, EditLocationDto } from './onboarding.validation.js';
import { toLocationResponse, toLocationList } from '@common/mappers/location.mapper.js';
import { parse } from 'csv-parse/sync';

// ── Helpers ───────────────────────────────────────────────────────────────────

const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
): Promise<string> => {
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, res) => (err ? reject(err) : resolve(res as { secure_url: string })),
    );
    stream.end(file.buffer);
  });
  return result.secure_url;
};

// ── Branch Profile ────────────────────────────────────────────────────────────

export const saveBranchProfile = async (
  merchantId: string,
  dto: BranchProfileDto,
  logoFile?: Express.Multer.File,
) => {
  const logoUrl = logoFile
    ? await uploadToCloudinary(logoFile, 'snag/logos')
    : undefined;

  const profile = await onboardingRepository.upsertBranchProfile(merchantId, { ...dto, logoUrl });

  await onboardingRepository.updateOnboardingStep(
    merchantId,
    MERCHANT_ONBOARDING_STEPS.BRANCH_PROFILE,
  );

  return profile;
};

// ── Add Location ──────────────────────────────────────────────────────────────

export const addLocation = async (
  merchantId: string,
  dto: AddLocationDto,
  bannerFile?: Express.Multer.File,
) => {
  console.log('🔵 [SERVICE] addLocation called');
  console.log('🔵 bannerFile:', bannerFile ? bannerFile.filename : 'No banner file');
  
  const bannerUrl = bannerFile
    ? await uploadToCloudinary(bannerFile, 'snag/location-banners')
    : undefined;

  console.log('🔵 bannerUrl after upload:', bannerUrl);

  const location = await onboardingRepository.createLocation(merchantId, {
    ...dto,
    ...(bannerUrl && { bannerUrl }),
  });

  console.log('✅ Location created with bannerUrl:', location.bannerUrl);

  await onboardingRepository.updateOnboardingStep(
    merchantId,
    MERCHANT_ONBOARDING_STEPS.LOCATION_ADDED,
  );

  return toLocationResponse(location);
};

// ── Branch Info ───────────────────────────────────────────────────────────────

export const saveBranchInfo = async (merchantId: string, dto: BranchInfoDto) => {
  const updated = await onboardingRepository.addBranchInfo(dto.locationId, merchantId, {
    phoneNumber: dto.phoneNumber,
    email:       dto.email,
    contactName: dto.contactName,
  });

  if (!updated) throw new NotFoundError('Location not found');

  await onboardingRepository.updateOnboardingStep(
    merchantId,
    MERCHANT_ONBOARDING_STEPS.BRANCH_INFO,
  );

  return toLocationResponse(updated);
};

// ── Bulk Upload ───────────────────────────────────────────────────────────────

export const bulkUploadLocations = async (
  merchantId: string,
  csvFile: Express.Multer.File,
  notes?: string,
) => {
  const rows = parse(csvFile.buffer.toString('utf-8'), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  if (rows.length === 0) throw new ValidationError('CSV file is empty');

  const valid: ReturnType<typeof csvLocationRowSchema.parse>[] = [];
  const errors: { row: number; error: string }[] = [];

  rows.forEach((row, index) => {
    const result = csvLocationRowSchema.safeParse(row);
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({
        row: index + 2, // +2 = 1-indexed + header row
        error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      });
    }
  });

  let inserted = 0;
  if (valid.length > 0) {
    const created = await onboardingRepository.bulkCreateLocations(merchantId, valid);
    inserted = created.length;

    await onboardingRepository.updateOnboardingStep(
      merchantId,
      MERCHANT_ONBOARDING_STEPS.LOCATION_ADDED,
    );
  }

  return { inserted, failed: errors.length, errors, notes };
};

// ── Get Locations ─────────────────────────────────────────────────────────────

export const getLocations = async (merchantId: string) => {
  const locations = await onboardingRepository.findMerchantLocations(merchantId);
  return toLocationList(locations);
};

// ── Complete Onboarding ───────────────────────────────────────────────────────

export const completeOnboarding = async (merchantId: string) => {
  const locations = await onboardingRepository.findMerchantLocations(merchantId);
  if (locations.length === 0) throw new ValidationError('Add at least one location before completing onboarding');

  await onboardingRepository.updateOnboardingStep(merchantId, MERCHANT_ONBOARDING_STEPS.DONE);

  return { message: "You're all set" };
};

// ── Merchant Current Location ─────────────────────────────────────────────────

export const saveMerchantLocation = async (
  merchantId: string,
  dto: SaveMerchantLocationDto,
) => {
  await onboardingRepository.saveMerchantLocation(merchantId, dto.lat, dto.lng);
  return { message: 'Location saved' };
};

// ── Location CRUD (Settings → Locations) ─────────────────────────────────────

export const getLocationById = async (merchantId: string, locationId: string) => {
  const location = await onboardingRepository.findLocationById(locationId, merchantId);
  if (!location) throw new NotFoundError('Location not found');
  return toLocationResponse(location);
};

export const editLocation = async (
  merchantId: string,
  locationId: string,
  dto: EditLocationDto,
  bannerFile?: Express.Multer.File,
) => {
  const bannerUrl = bannerFile
    ? await uploadToCloudinary(bannerFile, 'snag/location-banners')
    : undefined;

  const updated = await onboardingRepository.updateLocation(locationId, merchantId, {
    ...dto,
    ...(bannerUrl && { bannerUrl }),
  });
  
  if (!updated) throw new NotFoundError('Location not found');
  return toLocationResponse(updated);
};

export const deleteLocation = async (merchantId: string, locationId: string) => {
  const deleted = await onboardingRepository.deleteLocation(locationId, merchantId);
  if (!deleted) throw new NotFoundError('Location not found');
  return { message: 'Location deleted' };
};
