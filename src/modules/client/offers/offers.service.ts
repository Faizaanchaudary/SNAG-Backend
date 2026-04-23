import { NotFoundError, ValidationError } from '@core/errors/app-error.js';
import { BranchProfile } from '@models/branch-profile.model.js';
import * as offersRepository from './offers.repository.js';
import type { DiscoverOffersDto } from './offers.validation.js';
import { createNotification } from '@modules/notifications/notifications.service.js';

// ── Haversine distance (km) ───────────────────────────────────────────────────

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Enrich offers with BranchProfile (branchName + logoUrl) + isSaved ────────

async function enrichWithBranchProfile(
  offers: Awaited<ReturnType<typeof offersRepository.findActiveOffers>>,
  clientId?: string,
) {
  // Extract merchant IDs - handle both populated and non-populated merchants
  const merchantIds = [...new Set(offers.map((o) => {
    const merchant = o.merchant as any; // Can be ObjectId or populated object
    // If merchant is populated (object), get its _id, otherwise use the string ID
    return typeof merchant === 'object' && merchant !== null && '_id' in merchant
      ? merchant._id.toString()
      : merchant.toString();
  }))];
  
  const profiles = await BranchProfile.find({ merchant: { $in: merchantIds } })
    .select('merchant branchName logoUrl')
    .lean()
    .exec();

  const profileMap = profiles.reduce<Record<string, { branchName: string; logoUrl?: string }>>(
    (acc, p) => {
      acc[p.merchant.toString()] = { branchName: p.branchName, logoUrl: p.logoUrl };
      return acc;
    },
    {},
  );

  // Check which offers are saved by this client
  let savedOfferIds: Set<string> = new Set();
  let redeemedOfferIds: Set<string> = new Set();
  if (clientId) {
    const savedOffers = await offersRepository.findSavedOfferIds(
      clientId,
      offers.map((o) => o._id.toString()),
    );
    savedOfferIds = new Set(savedOffers.map((s) => s.offer.toString()));
    
    const redeemedOffers = await offersRepository.findRedeemedOfferIds(
      clientId,
      offers.map((o) => o._id.toString()),
    );
    redeemedOfferIds = new Set(redeemedOffers.map((r) => r.offer.toString()));
  }

  return offers.map((offer) => {
    const merchant = offer.merchant as any; // Can be ObjectId or populated object
    const merchantId = typeof merchant === 'object' && merchant !== null && '_id' in merchant
      ? merchant._id.toString()
      : merchant.toString();
    
    const profile = profileMap[merchantId];
    return {
      ...offer.toObject(),
      merchantBrand: profile?.branchName ?? null,
      merchantLogo:  profile?.logoUrl    ?? null,
      isSaved:       savedOfferIds.has(offer._id.toString()),
      hasRedeemed:   redeemedOfferIds.has(offer._id.toString()),
    };
  });
}

// ── Discover ──────────────────────────────────────────────────────────────────

export const discoverOffers = async (clientId: string, query: DiscoverOffersDto) => {
  const { lat, lng, radiusKm = 10, brand, ...filters } = query;

  // Resolve brand → merchantIds first
  let merchantIds: import('mongoose').Types.ObjectId[] | undefined;
  if (brand) {
    const profiles = await BranchProfile.find({
      branchName: { $regex: brand, $options: 'i' },
    })
      .select('merchant')
      .lean()
      .exec();
    merchantIds = profiles.map((p) => p.merchant as import('mongoose').Types.ObjectId);
    if (merchantIds.length === 0) return []; // no matching brands → empty result
  }

  const offers = await offersRepository.findActiveOffers({ ...filters, merchantIds });

  // Geo filter
  const geoFiltered =
    lat !== undefined && lng !== undefined
      ? offers.filter((offer) => {
          const locations = (offer.locationIds as unknown as Array<{ coordinates: { lat: number; lng: number } }>);
          if (!locations?.length) return true; // online offers — always visible
          return locations.some(
            (loc) => distanceKm(lat, lng, loc.coordinates.lat, loc.coordinates.lng) <= radiusKm,
          );
        })
      : offers;

  return enrichWithBranchProfile(geoFiltered, clientId);
};

export const getOfferById = async (clientId: string, offerId: string) => {
  const offer = await offersRepository.findOfferById(offerId);
  if (!offer) throw new NotFoundError('Offer not found');

  // Increment both view and click count when offer is opened/viewed
  await Promise.all([
    offersRepository.incrementOfferViews(offerId),
    offersRepository.incrementOfferClicks(offerId)
  ]);

  const profile = await BranchProfile.findOne({ merchant: offer.merchant.toString() })
    .select('branchName logoUrl')
    .lean()
    .exec();

  // Check if saved by this client
  const isSaved = await offersRepository.isOfferSaved(clientId, offerId);
  const hasRedeemed = await offersRepository.hasClientRedeemedOffer(clientId, offerId);

  return {
    ...offer.toObject(),
    merchantBrand: profile?.branchName ?? null,
    merchantLogo:  profile?.logoUrl    ?? null,
    isSaved,
    hasRedeemed,
  };
};

// ── Save / Unsave ─────────────────────────────────────────────────────────────

export const saveOffer = async (clientId: string, offerId: string) => {
  const offer = await offersRepository.findOfferById(offerId);
  if (!offer) throw new NotFoundError('Offer not found');
  
  await offersRepository.saveOffer(clientId, offerId);
  return { saved: true };
};

export const unsaveOffer = async (clientId: string, offerId: string) => {
  await offersRepository.unsaveOffer(clientId, offerId);
  return { saved: false };
};

// ── Snag ──────────────────────────────────────────────────────────────────────

export const snagOffer = async (clientId: string, offerId: string) => {
  const offer = await offersRepository.findOfferById(offerId);
  if (!offer) throw new NotFoundError('Offer not found');

  // Check if client already redeemed this offer
  const alreadyRedeemed = await offersRepository.hasClientRedeemedOffer(clientId, offerId);
  if (alreadyRedeemed) {
    throw new ValidationError('You have already snagged this offer');
  }

  // Check redemption limit
  if (offer.redemptionLimit) {
    const redeemed = await offersRepository.countRedemptionsForOffer(offerId);
    if (redeemed >= offer.redemptionLimit) {
      throw new ValidationError('This offer has reached its redemption limit');
    }
  }

  // Extract merchant ID - handle both populated and non-populated
  const merchant = offer.merchant as any;
  const merchantId = typeof merchant === 'object' && merchant !== null && '_id' in merchant
    ? merchant._id.toString()
    : merchant.toString();

  const redemption = await offersRepository.createRedemption(
    clientId,
    offerId,
    merchantId,
    {
      couponCode: offer.couponCode,
      qrCodeUrl:  offer.qrCodeUrl,
      barCodeUrl: offer.barCodeUrl,
    },
  );

  await offersRepository.incrementOfferRedemptions(offerId);

  // Send notifications
  try {
    // Notify client about successful redemption
    await createNotification({
      userId: clientId,
      userType: 'client',
      type: 'redemption',
      title: 'Offer Snagged Successfully! 🎉',
      message: `You've successfully snagged "${offer.title}". Show this to the merchant to redeem.`,
      metadata: {
        offerId: offer._id,
        redemptionId: redemption._id,
        actionUrl: `/offers/${offer._id}/redeemed`,
      },
    });

    // Notify merchant about new redemption
    await createNotification({
      userId: merchantId,
      userType: 'merchant',
      type: 'redemption',
      title: 'New Offer Redemption 🎯',
      message: `A customer has snagged your offer "${offer.title}".`,
      metadata: {
        offerId: offer._id,
        redemptionId: redemption._id,
        clientId,
        actionUrl: `/merchant/redemptions/${redemption._id}`,
      },
    });
  } catch (notifError) {
    // Log error but don't fail the snag operation
    console.error('❌ Failed to send notifications:', notifError);
  }

  return {
    redemptionId: redemption.id,
    offerId:      offer.id,
    title:        offer.title,
    couponCode:   offer.couponCode,
    qrCodeUrl:    offer.qrCodeUrl,
    barCodeUrl:   offer.barCodeUrl,
    redeemedAt:   redemption.redeemedAt,
  };
};

// ── Click Tracking ────────────────────────────────────────────────────────────

export const clickOffer = async (clientId: string, offerId: string) => {
  const offer = await offersRepository.findOfferById(offerId);
  if (!offer) throw new NotFoundError('Offer not found');

  // Increment click count
  await offersRepository.incrementOfferClicks(offerId);

  return { clicked: true, offerId };
};

// ── My Offers (redemption history) ───────────────────────────────────────────

export const getMyOffers = async (
  clientId: string,
  filters?: {
    keyword?:   string;
    offerType?: string;
    status?:    string;
    category?:  string;
    startDate?: string;
    endDate?:   string;
  },
) => {
  const redemptions = await offersRepository.findClientRedemptions(clientId, filters);
  // Remove entries where offer was deleted (populate match returns null)
  return redemptions.filter((r) => r.offer != null);
};

// ── Saved Offers ──────────────────────────────────────────────────────────────

export const getSavedOffers = async (
  clientId: string,
  filters?: {
    keyword?:   string;
    offerType?: string;
    category?:  string;
    brand?:     string;
  },
) => {
  // If brand filter is provided, resolve it to merchantIds first
  let merchantIds: import('mongoose').Types.ObjectId[] | undefined;
  if (filters?.brand) {
    const profiles = await BranchProfile.find({
      branchName: { $regex: filters.brand, $options: 'i' },
    })
      .select('merchant')
      .lean()
      .exec();
    merchantIds = profiles.map((p) => p.merchant as import('mongoose').Types.ObjectId);
    if (merchantIds.length === 0) return []; // no matching brands → empty result
  }

  const saved = await offersRepository.findSavedOffers(clientId, {
    ...filters,
    merchantIds,
  });

  // Filter out any that had their offer deleted (populate returns null for match:false)
  const validSaved = saved.filter((s) => s.offer != null);

  // Enrich with branch profile data (isSaved is always true for saved offers list)
  return enrichWithBranchProfile(validSaved.map((s) => s.offer) as any, clientId);
};
