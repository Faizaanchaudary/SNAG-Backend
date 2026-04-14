import { User, UserDocument } from '@models/user.model.js';

export const saveLocation = (
  clientId: string,
  lat: number,
  lng: number,
  step: number,
): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(
    clientId,
    { location: { lat, lng }, onboardingStep: step },
    { new: true },
  ).exec();

export const saveInterests = (
  clientId: string,
  interests: string[],
  step: number,
): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(
    clientId,
    { interests, onboardingStep: step },
    { new: true },
  ).exec();

export const saveAvatar = (
  clientId: string,
  avatarUrl: string,
  step: number,
): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(
    clientId,
    { avatarUrl, onboardingStep: step },
    { new: true },
  ).exec();

export const updateOnboardingStep = (
  clientId: string,
  step: number,
): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(clientId, { onboardingStep: step }, { new: true }).exec();
