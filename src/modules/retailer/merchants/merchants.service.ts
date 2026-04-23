import { NotFoundError, ConflictError } from '@core/errors/app-error.js';
import { hashPassword } from '@core/auth/password.js';
import { USER_ROLES } from '@common/constants.js';
import * as merchantsRepository from './merchants.repository.js';
import { CreateMerchantDto, UpdateMerchantDto, MerchantsFilterDto } from './merchants.validation.js';

interface MerchantResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isVerified: boolean;
  status: 'active' | 'inactive';
  onboardingStep: number;
  branchName?: string;
  industry?: string;
  createdAt: Date;
}

/** Transform merchant document to response format */
const toMerchantResponse = (merchant: any, branchMap: Record<string, any> = {}): MerchantResponse => {
  const branch = branchMap[merchant._id.toString()];
  return {
    id: merchant._id.toString(),
    firstName: merchant.firstName,
    lastName: merchant.lastName,
    email: merchant.email,
    phoneNumber: merchant.phoneNumber,
    isVerified: merchant.isVerified,
    status: merchant.isVerified ? 'active' : 'inactive',
    onboardingStep: merchant.onboardingStep,
    branchName: branch?.branchName,
    industry: branch?.industry,
    createdAt: merchant.createdAt,
  };
};

/** Get all merchants with pagination and filtering */
export const getMerchants = async (params: MerchantsFilterDto) => {
  const { page, limit } = params;
  const { merchants, total } = await merchantsRepository.findMerchants(params);

  // Get branch profiles for merchants
  const merchantIds = merchants.map(m => m._id.toString());
  const branchProfiles = await merchantsRepository.findBranchProfilesByMerchants(merchantIds);

  const branchMap = branchProfiles.reduce((acc, branch) => {
    acc[branch.merchant.toString()] = branch;
    return acc;
  }, {} as Record<string, any>);

  const items = merchants.map(merchant => toMerchantResponse(merchant, branchMap));

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/** Create new merchant */
export const createMerchant = async (dto: CreateMerchantDto) => {
  // Check if email already exists
  const existingUser = await merchantsRepository.findMerchantByEmail(dto.email);
  if (existingUser) {
    throw new ConflictError('Email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(dto.password);

  // Create merchant user
  const merchantData = {
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    password: hashedPassword,
    phoneNumber: dto.phoneNumber,
    role: USER_ROLES.MERCHANT,
    isVerified: true,
    onboardingStep: 2,
  };

  const newMerchant = await merchantsRepository.createMerchant(merchantData);
  return toMerchantResponse(newMerchant);
};

/** Update merchant */
export const updateMerchant = async (merchantId: string, dto: UpdateMerchantDto) => {
  const merchant = await merchantsRepository.findMerchantById(merchantId);
  if (!merchant) {
    throw new NotFoundError('Merchant not found');
  }

  const updatedMerchant = await merchantsRepository.updateMerchant(merchantId, dto);
  if (!updatedMerchant) {
    throw new NotFoundError('Merchant not found after update');
  }

  // Get branch profile
  const branchProfiles = await merchantsRepository.findBranchProfilesByMerchants([merchantId]);
  const branchMap = branchProfiles.reduce((acc, branch) => {
    acc[branch.merchant.toString()] = branch;
    return acc;
  }, {} as Record<string, any>);

  return toMerchantResponse(updatedMerchant, branchMap);
};

/** Deactivate merchant (set isVerified to false) */
export const deactivateMerchant = async (merchantId: string) => {
  const merchant = await merchantsRepository.findMerchantById(merchantId);
  if (!merchant) throw new NotFoundError('Merchant not found');

  const updated = await merchantsRepository.deactivateMerchant(merchantId);
  if (!updated) throw new NotFoundError('Merchant not found after deactivation');

  const branchProfiles = await merchantsRepository.findBranchProfilesByMerchants([merchantId]);
  const branchMap = branchProfiles.reduce((acc, branch) => {
    acc[branch.merchant.toString()] = branch;
    return acc;
  }, {} as Record<string, any>);

  return toMerchantResponse(updated, branchMap);
};

/** Activate merchant (set isVerified to true) */
export const activateMerchant = async (merchantId: string) => {
  const merchant = await merchantsRepository.findMerchantById(merchantId);
  if (!merchant) throw new NotFoundError('Merchant not found');

  const updated = await merchantsRepository.activateMerchant(merchantId);
  if (!updated) throw new NotFoundError('Merchant not found after activation');

  const branchProfiles = await merchantsRepository.findBranchProfilesByMerchants([merchantId]);
  const branchMap = branchProfiles.reduce((acc, branch) => {
    acc[branch.merchant.toString()] = branch;
    return acc;
  }, {} as Record<string, any>);

  return toMerchantResponse(updated, branchMap);
};