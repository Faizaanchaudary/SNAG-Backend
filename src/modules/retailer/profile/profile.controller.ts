import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import { User } from '@models/user.model.js';
import { NotFoundError } from '@core/errors/app-error.js';
import { UpdateProfileDto } from './profile.validation.js';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.user!.id).lean();
  if (!user) throw new NotFoundError('User not found');

  sendSuccess(res, {
    id:          user._id.toString(),
    firstName:   user.firstName,
    lastName:    user.lastName,
    email:       user.email,
    phoneNumber: user.phoneNumber,
    avatarUrl:   user.avatarUrl,
    role:        user.role,
    createdAt:   user.createdAt,
  }, 'Profile retrieved');
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const dto: UpdateProfileDto = req.body;
  const user = await User.findByIdAndUpdate(req.user!.id, dto, { new: true }).lean();
  if (!user) throw new NotFoundError('User not found');

  sendSuccess(res, {
    id:          user._id.toString(),
    firstName:   user.firstName,
    lastName:    user.lastName,
    email:       user.email,
    phoneNumber: user.phoneNumber,
    avatarUrl:   user.avatarUrl,
    role:        user.role,
  }, 'Profile updated');
};
