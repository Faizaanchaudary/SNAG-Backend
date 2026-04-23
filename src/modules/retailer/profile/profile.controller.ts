import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import { User } from '@models/user.model.js';
import { cloudinary } from '@config/cloudinary.js';
import { NotFoundError } from '@core/errors/app-error.js';
import { UpdateProfileDto } from './profile.validation.js';

const toProfileResponse = (user: any) => ({
  id:          user._id?.toString() ?? user.id,
  firstName:   user.firstName,
  lastName:    user.lastName,
  email:       user.email,
  phoneNumber: user.phoneNumber,
  avatarUrl:   user.avatarUrl,
  role:        user.role,
  createdAt:   user.createdAt,
});

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id).lean();
  if (!user) throw new NotFoundError('User not found');
  sendSuccess(res, toProfileResponse(user), 'Profile retrieved');
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const dto: UpdateProfileDto = req.body;
  // email is NOT allowed to be updated — strip it just in case
  const { ...safeDto } = dto as any;
  delete safeDto.email;

  const user = await User.findByIdAndUpdate(req.user!.id, safeDto, { new: true }).lean();
  if (!user) throw new NotFoundError('User not found');
  sendSuccess(res, toProfileResponse(user), 'Profile updated');
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Image file is required' } });
    return;
  }

  const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'snag/retailer-avatars', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result as { secure_url: string })),
    );
    stream.end(req.file!.buffer);
  });

  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { avatarUrl: uploaded.secure_url },
    { new: true },
  ).lean();
  if (!user) throw new NotFoundError('User not found');

  sendSuccess(res, toProfileResponse(user), 'Avatar updated');
};
