import { User, UserDocument } from '@models/user.model.js';
import { BranchProfile } from '@models/branch-profile.model.js';
import { Location } from '@models/location.model.js';
import { Offer } from '@models/offer.model.js';
import { USER_ROLES } from '@common/constants.js';
import { UpdateRetailerDto, CreateRetailerDto } from './retailers.validation.js';
import { hashPassword } from '@core/auth/password.js';
import { generateRandomPassword } from '@common/utils/password.js';

/**
 * Find retailers with pagination and search
 */
export const findRetailersWithPagination = async (params: {
  q: string;
  page: number;
  limit: number;
}) => {
  const { q, page, limit } = params;
  const skip = (page - 1) * limit;

  // Build search query for merchants only
  const searchQuery: any = { role: USER_ROLES.RETAILER };
  if (q) {
    searchQuery.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ];
  }

  const [retailers, total] = await Promise.all([
    User.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    User.countDocuments(searchQuery),
  ]);

  return { retailers, total };
};

/**
 * Find retailer by email
 */
export const findRetailerByEmail = (email: string): Promise<UserDocument | null> => {
  return User.findOne({ email, role: USER_ROLES.RETAILER }).exec();
};

/**
 * Create new retailer
 */
export const createRetailer = async (data: CreateRetailerDto): Promise<UserDocument> => {
  // Generate password if not provided
  const password = data.password || generateRandomPassword();
  const hashedPassword = await hashPassword(password);

  const retailerData = {
    ...data,
    password: hashedPassword,
    role: USER_ROLES.RETAILER,
    isVerified: false, // Admin-created retailers start unverified
    onboardingStep: 1,
  };

  return new User(retailerData).save();
};

/**
 * Find retailer by ID
 */
export const findRetailerById = (id: string): Promise<UserDocument | null> => {
  return User.findOne({ _id: id, role: USER_ROLES.RETAILER }).exec();
};

/**
 * Update retailer
 */
export const updateRetailer = (id: string, data: UpdateRetailerDto): Promise<UserDocument | null> => {
  return User.findByIdAndUpdate(id, data, { new: true }).exec();
};

/**
 * Soft delete retailer
 */
export const softDeleteRetailer = (id: string): Promise<UserDocument | null> => {
  return User.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
};

/**
 * Get retailer's branch profile
 */
export const getRetailerBranchProfile = async (merchantId: string) => {
  return await BranchProfile.findOne({ merchant: merchantId }).exec();
};

/**
 * Get retailer's locations
 */
export const getRetailerLocations = async (merchantId: string) => {
  return await Location.find({ merchant: merchantId }).exec();
};

/**
 * Get retailer's location count
 */
export const getRetailerLocationCount = async (merchantId: string): Promise<number> => {
  return await Location.countDocuments({ merchant: merchantId });
};

/**
 * Get retailer's offers
 */
export const getRetailerOffers = async (merchantId: string) => {
  return await Offer.find({ merchant: merchantId }).exec();
};

/**
 * Get retailer statistics
 */
export const getRetailerStats = async () => {
  const [totalRetailers, verifiedRetailers, pendingRetailers] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.RETAILER }),
    User.countDocuments({ role: USER_ROLES.RETAILER, isVerified: true }),
    User.countDocuments({ role: USER_ROLES.RETAILER, isVerified: false }),
  ]);

  return {
    totalRetailers,
    verifiedRetailers,
    pendingRetailers,
  };
};