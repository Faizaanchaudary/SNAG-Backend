import { Offer, OfferDocument } from '@models/offer.model.js';
import { OffersFilterDto } from './offers.validation.js';

/** Retailer sees all platform offers (read-only view) */
export const findAllOffers = async (params: OffersFilterDto) => {
  const { status, search, page, limit } = params;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [offers, total] = await Promise.all([
    Offer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Offer.countDocuments(query),
  ]);

  return { offers, total };
};

export const findOfferById = (offerId: string): Promise<OfferDocument | null> =>
  Offer.findById(offerId).exec();
