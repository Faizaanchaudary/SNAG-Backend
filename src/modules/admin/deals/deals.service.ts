import { NotFoundError } from '@core/errors/app-error.js';
import * as dealsRepository from './deals.repository.js';
import { UpdateDealDto, CreateDealDto, ADMIN_DEAL_STATUSES } from './deals.validation.js';

/**
 * Create new deal
 */
export const createDeal = async (dto: CreateDealDto) => {
  const dealData = {
    merchant: dto.merchantId,
    title: dto.title,
    description: dto.description,
    offerType: dto.offerType,
    categories: dto.categories,
    status: 'draft', // Admin-created deals start as draft
    termsAndConditions: dto.termsAndConditions,
    startDate: dto.startDate ? new Date(dto.startDate) : undefined,
    endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    redemptionLimit: dto.redemptionLimit,
    targetAudience: dto.targetAudience || {
      demographics: [],
      interests: [],
      behaviors: [],
    },
    locationIds: [], // Will be set later
    stats: {
      views: 0,
      clicks: 0,
      redemptions: 0,
    },
  };

  const deal = await dealsRepository.createDeal(dealData);
  
  return {
    id: deal._id.toString(),
    title: deal.title,
    brand: 'Admin Created',
    category: deal.categories[0] || 'Uncategorized',
    status: mapOfferStatusToAdminStatus(deal.status),
    redemptions: deal.stats.redemptions,
    radius: deal.targetAudience.radiusKm ? deal.targetAudience.radiusKm * 1000 : 500,
    image: deal.bannerUrl,
    expiresAt: deal.endDate?.toISOString(),
    createdAt: deal.createdAt.toISOString(),
  };
};

/**
 * List deals with filtering and search
 */
export const listDeals = async (params: {
  q: string;
  status?: string;
  category?: string;
  maxRadius?: number;
  page: number;
  limit: number;
}) => {
  const { deals, total } = await dealsRepository.findDealsWithFilters(params);
  
  // Map deals to admin-friendly format
  const items = deals.map((deal: any) => {
    const merchant = deal.merchant as any; // Type assertion for populated field
    return {
      id: deal._id.toString(),
      title: deal.title,
      brand: merchant?.firstName && merchant?.lastName 
        ? `${merchant.firstName} ${merchant.lastName}` 
        : 'Unknown',
      category: deal.categories[0] || 'Uncategorized',
      status: mapOfferStatusToAdminStatus(deal.status),
      redemptions: deal.stats.redemptions,
      radius: deal.targetAudience.radiusKm ? deal.targetAudience.radiusKm * 1000 : 500, // Convert km to meters
      image: deal.bannerUrl || `https://picsum.photos/seed/deal${deal._id}/640/360`,
      expiresAt: deal.endDate?.toISOString(),
      createdAt: deal.createdAt.toISOString(),
    };
  });

  return { items, total };
};

/**
 * Get deal by ID with full details
 */
export const getDealById = async (id: string) => {
  const deal = await dealsRepository.findDealById(id);
  if (!deal) {
    throw new NotFoundError('Deal not found');
  }

  const merchant = deal.merchant as any; // Type assertion for populated field
  return {
    id: deal._id.toString(),
    title: deal.title,
    description: deal.description,
    brand: merchant?.firstName && merchant?.lastName 
      ? `${merchant.firstName} ${merchant.lastName}` 
      : 'Unknown',
    merchantId: merchant?._id?.toString(),
    category: deal.categories[0] || 'Uncategorized',
    categories: deal.categories,
    status: mapOfferStatusToAdminStatus(deal.status),
    redemptions: deal.stats.redemptions,
    views: deal.stats.views,
    clicks: deal.stats.clicks,
    radius: deal.targetAudience.radiusKm ? deal.targetAudience.radiusKm * 1000 : 500,
    image: deal.bannerUrl,
    startDate: deal.startDate?.toISOString(),
    expiresAt: deal.endDate?.toISOString(),
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
    termsAndConditions: deal.termsAndConditions,
    redemptionLimit: deal.redemptionLimit,
    offerType: deal.offerType,
    targetAudience: deal.targetAudience,
    locations: deal.locationIds,
  };
};

/**
 * Update deal
 */
export const updateDeal = async (id: string, dto: UpdateDealDto) => {
  const deal = await dealsRepository.findDealById(id);
  if (!deal) {
    throw new NotFoundError('Deal not found');
  }

  // Convert admin status back to offer status if needed
  const updateData: any = { ...dto };
  if (dto.status) {
    updateData.status = mapAdminStatusToOfferStatus(dto.status);
  }

  const updatedDeal = await dealsRepository.updateDeal(id, updateData);
  if (!updatedDeal) {
    throw new NotFoundError('Deal not found after update');
  }

  const merchant = updatedDeal.merchant as any; // Type assertion for populated field
  return {
    id: updatedDeal._id.toString(),
    title: updatedDeal.title,
    brand: merchant?.firstName && merchant?.lastName 
      ? `${merchant.firstName} ${merchant.lastName}` 
      : 'Unknown',
    category: updatedDeal.categories[0] || 'Uncategorized',
    status: mapOfferStatusToAdminStatus(updatedDeal.status),
    redemptions: updatedDeal.stats.redemptions,
    radius: updatedDeal.targetAudience.radiusKm ? updatedDeal.targetAudience.radiusKm * 1000 : 500,
    image: updatedDeal.bannerUrl,
    expiresAt: updatedDeal.endDate?.toISOString(),
    createdAt: updatedDeal.createdAt.toISOString(),
  };
};

/**
 * Approve deal
 */
export const approveDeal = async (id: string) => {
  return await updateDeal(id, { status: ADMIN_DEAL_STATUSES.LIVE });
};

/**
 * Reject deal
 */
export const rejectDeal = async (id: string, reason?: string) => {
  // TODO: Store rejection reason in metadata or separate collection
  return await updateDeal(id, { status: ADMIN_DEAL_STATUSES.DRAFT });
};

/**
 * Flag deal for review
 */
export const flagDeal = async (id: string, reason?: string) => {
  // TODO: Store flag reason in metadata or separate collection
  return await updateDeal(id, { status: ADMIN_DEAL_STATUSES.FLAGGED });
};

/**
 * Archive deal
 */
export const archiveDeal = async (id: string) => {
  return await updateDeal(id, { status: ADMIN_DEAL_STATUSES.ARCHIVED });
};

/**
 * Delete deal (soft delete)
 */
export const deleteDeal = async (id: string) => {
  const deal = await dealsRepository.findDealById(id);
  if (!deal) {
    throw new NotFoundError('Deal not found');
  }

  await dealsRepository.softDeleteDeal(id);
};

/**
 * Map offer status to admin-friendly status
 */
function mapOfferStatusToAdminStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'live';
    case 'draft':
      return 'draft';
    case 'expired':
      return 'archived';
    case 'scheduled':
      return 'published';
    default:
      return status;
  }
}

/**
 * Map admin status back to offer status
 */
function mapAdminStatusToOfferStatus(status: string): string {
  switch (status) {
    case 'live':
    case 'published':
      return 'active';
    case 'needs-approval':
    case 'flagged':
      return 'draft';
    case 'archived':
      return 'expired';
    default:
      return status;
  }
}