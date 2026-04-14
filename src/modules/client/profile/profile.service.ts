import { cloudinary } from '@config/cloudinary.js';
import { NotFoundError } from '@core/errors/app-error.js';
import * as profileRepository from './profile.repository.js';
import type { UpdateInterestsDto } from './profile.validation.js';

const toProfileResponse = (user: NonNullable<Awaited<ReturnType<typeof profileRepository.findClientById>>>) => ({
  id:          user.id as string,
  firstName:   user.firstName,
  lastName:    user.lastName,
  email:       user.email,
  userName:    user.userName,
  phoneNumber: user.phoneNumber,
  interests:   user.interests ?? [],
  avatarUrl:   user.avatarUrl,
  location:    user.location,
  createdAt:   user.createdAt,
});

export const getProfile = async (clientId: string) => {
  const user = await profileRepository.findClientById(clientId);
  if (!user) throw new NotFoundError('User not found');
  return toProfileResponse(user);
};

export const updateInterests = async (clientId: string, dto: UpdateInterestsDto) => {
  const updated = await profileRepository.updateInterests(clientId, dto.interests);
  if (!updated) throw new NotFoundError('User not found');
  return toProfileResponse(updated);
};

export const updateAvatar = async (clientId: string, file: Express.Multer.File) => {
  const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'snag/avatars', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result as { secure_url: string })),
    );
    stream.end(file.buffer);
  });

  const updated = await profileRepository.updateAvatar(clientId, uploaded.secure_url);
  if (!updated) throw new NotFoundError('User not found');
  return toProfileResponse(updated);
};
