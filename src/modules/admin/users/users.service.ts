import { ConflictError, NotFoundError } from '@core/errors/app-error.js';
import { hashPassword } from '@core/auth/password.js';
import * as usersRepository from './users.repository.js';
import { Offer } from '@models/offer.model.js';
import { CreateUserDto, UpdateUserDto } from './users.validation.js';
import { generateRandomPassword } from '@common/utils/password.js';
import { USER_ROLES } from '@common/constants.js';

/**
 * List users with pagination and search
 */
export const listUsers = async (params: {
  q: string;
  page: number;
  limit: number;
  role?: string;
}) => {
  const { users, total } = await usersRepository.findUsersWithPagination(params);

  const items = await Promise.all(users.map(async (user) => {
    const base = {
      id: user._id.toString(),
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role,
      status: user.isVerified ? 'active' : 'pending',
      lastActive: user.updatedAt,
      onboardingStep: user.onboardingStep,
      createdAt: user.createdAt,
    };

    // For merchants, attach offer count
    if (user.role === USER_ROLES.MERCHANT) {
      const offerCount = await Offer.countDocuments({ merchant: user._id });
      return { ...base, offers: offerCount };
    }

    return base;
  }));

  return { items, total };
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string) => {
  const user = await usersRepository.findUserById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    onboardingStep: user.onboardingStep,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    interests: user.interests,
    location: user.location,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Create new user
 */
export const createUser = async (dto: CreateUserDto) => {
  // Check if email already exists
  const existingUser = await usersRepository.findUserByEmail(dto.email);
  if (existingUser) {
    throw new ConflictError('Email already in use');
  }

  // Generate password if not provided
  const password = dto.password || generateRandomPassword();
  const hashedPassword = await hashPassword(password);

  const userData = {
    ...dto,
    password: hashedPassword,
    isVerified: true, // Admin-created users are auto-verified
    onboardingStep: 1,
  };

  const user = await usersRepository.createUser(userData);

  // TODO: Send welcome email with password if generated

  return {
    id: user._id.toString(),
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: user.role,
    status: 'active',
    lastActive: user.updatedAt,
    onboardingStep: user.onboardingStep,
    createdAt: user.createdAt,
    generatedPassword: dto.password ? undefined : password, // Return generated password
  };
};

/**
 * Update user
 */
export const updateUser = async (id: string, dto: UpdateUserDto) => {
  const user = await usersRepository.findUserById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check email uniqueness if email is being updated
  if (dto.email && dto.email !== user.email) {
    const existingUser = await usersRepository.findUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }
  }

  const updatedUser = await usersRepository.updateUser(id, dto);
  if (!updatedUser) {
    throw new NotFoundError('User not found after update');
  }

  return {
    id: updatedUser._id.toString(),
    name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
    email: updatedUser.email,
    role: updatedUser.role,
    status: updatedUser.isVerified ? 'active' : 'pending',
    lastActive: updatedUser.updatedAt,
    onboardingStep: updatedUser.onboardingStep,
    createdAt: updatedUser.createdAt,
  };
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (id: string) => {
  const user = await usersRepository.findUserById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  await usersRepository.softDeleteUser(id);
};

/**
 * Suspend user
 */
export const suspendUser = async (id: string) => {
  const user = await usersRepository.findUserById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updatedUser = await usersRepository.updateUser(id, { isVerified: false });
  if (!updatedUser) {
    throw new NotFoundError('User not found after update');
  }

  return {
    id: updatedUser._id.toString(),
    name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
    email: updatedUser.email,
    role: updatedUser.role,
    status: 'suspended',
    lastActive: updatedUser.updatedAt,
    onboardingStep: updatedUser.onboardingStep,
    createdAt: updatedUser.createdAt,
  };
};

/**
 * Activate user
 */
export const activateUser = async (id: string) => {
  const user = await usersRepository.findUserById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updatedUser = await usersRepository.updateUser(id, { isVerified: true });
  if (!updatedUser) {
    throw new NotFoundError('User not found after update');
  }

  return {
    id: updatedUser._id.toString(),
    name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
    email: updatedUser.email,
    role: updatedUser.role,
    status: 'active',
    lastActive: updatedUser.updatedAt,
    onboardingStep: updatedUser.onboardingStep,
    createdAt: updatedUser.createdAt,
  };
};