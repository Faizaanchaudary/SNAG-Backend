import { User, UserDocument } from '@models/user.model.js';
import { BranchProfile, BranchProfileDocument } from '@models/branch-profile.model.js';
import { USER_ROLES } from '@common/constants.js';
import { CreateMerchantDto, UpdateMerchantDto, MerchantsFilterDto } from './merchants.validation.js';

interface PaginatedMerchants {
  merchants: UserDocument[];
  total: number;
}

/** Find merchants with pagination and filtering */
export const findMerchants = async (params: MerchantsFilterDto): Promise<PaginatedMerchants> => {
  const { page, limit, search, status } = params;
  const skip = (page - 1) * limit;

  // Build query
  const query: any = { 
    role: USER_ROLES.MERCHANT,
    isDeleted: false 
  };

  // Add search filter
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Add status filter
  if (status === 'active') {
    query.isVerified = true;
  } else if (status === 'inactive') {
    query.isVerified = false;
  }

  const [merchants, total] = await Promise.all([
    User.find(query)
      .select('firstName lastName email phoneNumber isVerified onboardingStep createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    User.countDocuments(query),
  ]);

  return { merchants, total };
};

/** Find merchant by ID */
export const findMerchantById = (merchantId: string): Promise<UserDocument | null> =>
  User.findOne({ 
    _id: merchantId, 
    role: USER_ROLES.MERCHANT,
    isDeleted: false 
  }).exec();

/** Find merchant by email */
export const findMerchantByEmail = (email: string): Promise<UserDocument | null> =>
  User.findOne({ 
    email: email.toLowerCase(),
    isDeleted: false 
  }).exec();

/** Find branch profiles for merchants */
export const findBranchProfilesByMerchants = (merchantIds: string[]): Promise<BranchProfileDocument[]> =>
  BranchProfile.find({ 
    merchant: { $in: merchantIds },
    isDeleted: false 
  })
    .select('merchant branchName industry')
    .exec();

/** Create new merchant */
export const createMerchant = (merchantData: any): Promise<UserDocument> =>
  new User(merchantData).save();

/** Update merchant */
export const updateMerchant = (merchantId: string, dto: UpdateMerchantDto): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(
    merchantId,
    dto,
    { new: true, select: 'firstName lastName email phoneNumber isVerified onboardingStep createdAt' }
  ).exec();

/** Deactivate merchant (set isVerified to false) */
export const deactivateMerchant = (merchantId: string): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(
    merchantId,
    { isVerified: false },
    { new: true, select: 'firstName lastName email phoneNumber isVerified onboardingStep createdAt' }
  ).exec();

/** Activate merchant (set isVerified to true) */
export const activateMerchant = (merchantId: string): Promise<UserDocument | null> =>
  User.findByIdAndUpdate(
    merchantId,
    { isVerified: true },
    { new: true, select: 'firstName lastName email phoneNumber isVerified onboardingStep createdAt' }
  ).exec();