import { UserDocument } from '@models/user.model.js';

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  onboardingStep: number;
  createdAt: Date;
  // Client-specific fields (optional)
  userName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export const toUserResponse = (user: UserDocument): UserResponse => ({
  id:             user.id as string,
  firstName:      user.firstName,
  lastName:       user.lastName,
  email:          user.email,
  role:           user.role,
  isVerified:     user.isVerified,
  onboardingStep: user.onboardingStep,
  createdAt:      user.createdAt,
  // Include client fields if they exist
  ...(user.userName && { userName: user.userName }),
  ...(user.phoneNumber && { phoneNumber: user.phoneNumber }),
  ...(user.avatarUrl && { avatarUrl: user.avatarUrl }),
});
