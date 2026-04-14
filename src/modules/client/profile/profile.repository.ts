import { User, UserDocument } from '@models/user.model.js';

export const findClientById = (clientId: string): Promise<UserDocument | null> =>
  User.findById(clientId).exec();

export const updateInterests = (clientId: string, interests: string[]): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(clientId, { interests }, { new: true }).exec();

export const updateAvatar = (clientId: string, avatarUrl: string): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(clientId, { avatarUrl }, { new: true }).exec();
