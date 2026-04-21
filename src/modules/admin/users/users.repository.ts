import { User, UserDocument } from '@models/user.model.js';
import { CreateUserDto, UpdateUserDto } from './users.validation.js';

/**
 * Find users with pagination and search
 */
export const findUsersWithPagination = async (params: {
  q: string;
  page: number;
  limit: number;
  role?: string;
}) => {
  const { q, page, limit, role } = params;
  const skip = (page - 1) * limit;

  // Build search query — always exclude soft-deleted users
  const searchQuery: any = { isDeleted: { $ne: true } };
  if (role) searchQuery.role = role;
  if (q) {
    searchQuery.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    User.countDocuments(searchQuery),
  ]);

  return { users, total };
};

/**
 * Find user by ID
 */
export const findUserById = (id: string): Promise<UserDocument | null> => {
  return User.findById(id).exec();
};

/**
 * Find user by email
 */
export const findUserByEmail = (email: string): Promise<UserDocument | null> => {
  return User.findOne({ email }).exec();
};

/**
 * Create new user
 */
export const createUser = (data: CreateUserDto & { password: string }): Promise<UserDocument> => {
  return new User(data).save();
};

/**
 * Update user
 */
export const updateUser = (id: string, data: UpdateUserDto): Promise<UserDocument | null> => {
  return User.findByIdAndUpdate(id, data, { new: true }).exec();
};

/**
 * Soft delete user
 */
export const softDeleteUser = (id: string): Promise<UserDocument | null> => {
  return User.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  const [totalUsers, totalMerchants, totalClients, verifiedUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'merchant' }),
    User.countDocuments({ role: 'client' }),
    User.countDocuments({ isVerified: true }),
  ]);

  return {
    totalUsers,
    totalMerchants,
    totalClients,
    verifiedUsers,
    unverifiedUsers: totalUsers - verifiedUsers,
  };
};