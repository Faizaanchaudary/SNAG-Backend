import { NotFoundError } from '@core/errors/app-error.js';
import * as redemptionsRepository from './redemptions.repository.js';
import { RedemptionsFilterDto } from './redemptions.validation.js';

/**
 * List redemptions with pagination and filters
 */
export const listRedemptions = async (params: RedemptionsFilterDto) => {
  const { redemptions, total } = await redemptionsRepository.findRedemptionsWithFilters(params);
  
  // Map redemptions to admin-friendly format
  const items = redemptions.map((redemption) => {
    const client = redemption.client as any; // Type assertion for populated field
    const offer = redemption.offer as any; // Type assertion for populated field
    const merchant = redemption.merchant as any; // Type assertion for populated field
    
    return {
      id: redemption._id.toString(),
      customer: client?.firstName && client?.lastName 
        ? `${client.firstName} ${client.lastName}` 
        : 'Unknown Customer',
      customerEmail: client?.email,
      offer: offer?.title || 'Unknown Offer',
      offerCategories: offer?.categories || [],
      merchant: merchant?.firstName && merchant?.lastName 
        ? `${merchant.firstName} ${merchant.lastName}` 
        : 'Unknown Merchant',
      merchantEmail: merchant?.email,
      redeemedAt: redemption.redeemedAt.toISOString(),
      location: redemption.location,
      metadata: redemption.metadata,
    };
  });

  return { items, total };
};

/**
 * Get redemption by ID
 */
export const getRedemptionById = async (id: string) => {
  const redemption = await redemptionsRepository.findRedemptionById(id);
  if (!redemption) {
    throw new NotFoundError('Redemption not found');
  }

  const client = redemption.client as any; // Type assertion for populated field
  const offer = redemption.offer as any; // Type assertion for populated field
  const merchant = redemption.merchant as any; // Type assertion for populated field

  return {
    id: redemption._id.toString(),
    customer: {
      name: client?.firstName && client?.lastName 
        ? `${client.firstName} ${client.lastName}` 
        : 'Unknown Customer',
      email: client?.email,
      phone: client?.phoneNumber,
    },
    offer: {
      title: offer?.title || 'Unknown Offer',
      description: offer?.description,
      categories: offer?.categories || [],
      image: offer?.bannerUrl,
    },
    merchant: {
      name: merchant?.firstName && merchant?.lastName 
        ? `${merchant.firstName} ${merchant.lastName}` 
        : 'Unknown Merchant',
      email: merchant?.email,
    },
    redeemedAt: redemption.redeemedAt.toISOString(),
    location: redemption.location,
    metadata: redemption.metadata,
    createdAt: redemption.createdAt.toISOString(),
    updatedAt: redemption.updatedAt.toISOString(),
  };
};

/**
 * Get redemption statistics
 */
export const getRedemptionStats = async () => {
  return await redemptionsRepository.getRedemptionStats();
};