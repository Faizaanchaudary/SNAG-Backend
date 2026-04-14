import * as onboardingRepository from './onboarding.repository.js';
import { cloudinary } from '@config/cloudinary.js';
import { CLIENT_ONBOARDING_STEPS } from '@common/constants.js';
import { toUserResponse } from '@common/mappers/user.mapper.js';
import { ValidationError } from '@core/errors/app-error.js';
import type { SaveLocationDto, SaveInterestsDto } from './onboarding.validation.js';

export const saveLocation = async (clientId: string, dto: SaveLocationDto) => {
  const updated = await onboardingRepository.saveLocation(
    clientId,
    dto.lat,
    dto.lng,
    CLIENT_ONBOARDING_STEPS.LOCATION_SAVED,
  );
  return toUserResponse(updated!);
};

export const saveInterests = async (clientId: string, dto: SaveInterestsDto) => {
  const updated = await onboardingRepository.saveInterests(
    clientId,
    dto.interests,
    CLIENT_ONBOARDING_STEPS.INTERESTS_SAVED,
  );
  return toUserResponse(updated!);
};

export const uploadAvatar = async (clientId: string, file: Express.Multer.File) => {
  const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'snag/avatars', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result as { secure_url: string })),
    );
    stream.end(file.buffer);
  });

  const updated = await onboardingRepository.saveAvatar(
    clientId,
    uploaded.secure_url,
    CLIENT_ONBOARDING_STEPS.AVATAR_UPLOADED,
  );
  return toUserResponse(updated!);
};

export const completeOnboarding = async (clientId: string) => {
  const updated = await onboardingRepository.updateOnboardingStep(
    clientId,
    CLIENT_ONBOARDING_STEPS.DONE,
  );
  if (!updated) throw new ValidationError('Client not found');
  return { message: "You're all set" };
};
