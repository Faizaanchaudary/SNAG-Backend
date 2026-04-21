import { NotFoundError, ConflictError } from '@core/errors/app-error.js';
import * as retailersRepository from './retailers.repository.js';
import { UpdateRetailerDto, CreateRetailerDto } from './retailers.validation.js';

/**
 * Create new retailer
 */
export const createRetailer = async (dto: CreateRetailerDto) => {
  // Check if email already exists
  const existingUser = await retailersRepository.findRetailerByEmail(dto.email);
  if (existingUser) {
    throw new ConflictError('Email already in use');
  }

  const retailer = await retailersRepository.createRetailer(dto);
  const locationCount = await retailersRepository.getRetailerLocationCount(retailer._id.toString());

  return {
    id: retailer._id.toString(),
    name: `${retailer.firstName} ${retailer.lastName}`.trim(),
    contact: retailer.email,
    locations: locationCount,
    status: retailer.isVerified ? 'approved' : 'pending',
    onboardingStep: retailer.onboardingStep,
    createdAt: retailer.createdAt,
  };
};

/**
 * List retailers with pagination and search
 */
export const listRetailers = async (params: {
  q: string;
  page: number;
  limit: number;
}) => {
  const { retailers, total } = await retailersRepository.findRetailersWithPagination(params);
  
  // Map retailers to admin-friendly format
  const items = await Promise.all(
    retailers.map(async (retailer) => {
      const locationCount = await retailersRepository.getRetailerLocationCount(retailer._id.toString());
      
      return {
        id: retailer._id.toString(),
        name: `${retailer.firstName} ${retailer.lastName}`.trim(),
        contact: retailer.email,
        locations: locationCount,
        status: retailer.isVerified ? 'approved' : 'pending',
        onboardingStep: retailer.onboardingStep,
        createdAt: retailer.createdAt,
      };
    })
  );

  return { items, total };
};

/**
 * Get retailer by ID with detailed information
 */
export const getRetailerById = async (id: string) => {
  const retailer = await retailersRepository.findRetailerById(id);
  if (!retailer) {
    throw new NotFoundError('Retailer not found');
  }

  const [branchProfile, locations, offers] = await Promise.all([
    retailersRepository.getRetailerBranchProfile(id),
    retailersRepository.getRetailerLocations(id),
    retailersRepository.getRetailerOffers(id),
  ]);

  return {
    id: retailer._id.toString(),
    firstName: retailer.firstName,
    lastName: retailer.lastName,
    email: retailer.email,
    phoneNumber: retailer.phoneNumber,
    isVerified: retailer.isVerified,
    onboardingStep: retailer.onboardingStep,
    createdAt: retailer.createdAt,
    updatedAt: retailer.updatedAt,
    branchProfile,
    locations: locations.length,
    locationsList: locations,
    offers: offers.length,
    offersList: offers,
  };
};

/**
 * Update retailer
 */
export const updateRetailer = async (id: string, dto: UpdateRetailerDto) => {
  const retailer = await retailersRepository.findRetailerById(id);
  if (!retailer) {
    throw new NotFoundError('Retailer not found');
  }

  const updatedRetailer = await retailersRepository.updateRetailer(id, dto);
  if (!updatedRetailer) {
    throw new NotFoundError('Retailer not found after update');
  }
  
  const locationCount = await retailersRepository.getRetailerLocationCount(id);

  return {
    id: updatedRetailer._id.toString(),
    name: `${updatedRetailer.firstName} ${updatedRetailer.lastName}`.trim(),
    contact: updatedRetailer.email,
    locations: locationCount,
    status: updatedRetailer.isVerified ? 'approved' : 'pending',
    onboardingStep: updatedRetailer.onboardingStep,
    createdAt: updatedRetailer.createdAt,
  };
};

/**
 * Delete retailer (soft delete)
 */
export const deleteRetailer = async (id: string) => {
  const retailer = await retailersRepository.findRetailerById(id);
  if (!retailer) {
    throw new NotFoundError('Retailer not found');
  }

  await retailersRepository.softDeleteRetailer(id);
};

/**
 * Approve retailer
 */
export const approveRetailer = async (id: string) => {
  const retailer = await retailersRepository.findRetailerById(id);
  if (!retailer) {
    throw new NotFoundError('Retailer not found');
  }

  const updatedRetailer = await retailersRepository.updateRetailer(id, { isVerified: true });
  if (!updatedRetailer) {
    throw new NotFoundError('Retailer not found after update');
  }
  
  const locationCount = await retailersRepository.getRetailerLocationCount(id);

  return {
    id: updatedRetailer._id.toString(),
    name: `${updatedRetailer.firstName} ${updatedRetailer.lastName}`.trim(),
    contact: updatedRetailer.email,
    locations: locationCount,
    status: 'approved',
    onboardingStep: updatedRetailer.onboardingStep,
    createdAt: updatedRetailer.createdAt,
  };
};

/**
 * Reject retailer
 */
export const rejectRetailer = async (id: string) => {
  const retailer = await retailersRepository.findRetailerById(id);
  if (!retailer) {
    throw new NotFoundError('Retailer not found');
  }

  const updatedRetailer = await retailersRepository.updateRetailer(id, { isVerified: false });
  if (!updatedRetailer) {
    throw new NotFoundError('Retailer not found after update');
  }
  
  const locationCount = await retailersRepository.getRetailerLocationCount(id);

  return {
    id: updatedRetailer._id.toString(),
    name: `${updatedRetailer.firstName} ${updatedRetailer.lastName}`.trim(),
    contact: updatedRetailer.email,
    locations: locationCount,
    status: 'pending',
    onboardingStep: updatedRetailer.onboardingStep,
    createdAt: updatedRetailer.createdAt,
  };
};