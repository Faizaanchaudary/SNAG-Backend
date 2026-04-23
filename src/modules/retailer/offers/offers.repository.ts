import { Offer, OfferDocument } from '@models/offer.model.js';
import { User, UserDocument } from '@models/user.model.js';
import { USER_ROLES } from '@common/constants.js';
import { OffersFilterDto, CreateOfferDto, UpdateOfferDto } from './offers.validation.js';

interface PaginatedOffers {
  offers: OfferDocument[];
  total: number;
}

/** Find all offers with pagination, search, status filter */
export const findOffers = async (params: OffersFilterDto): Promise<PaginatedOffers> => {
  const { page, limit, search, status, merchantId } = params;
  const skip = (page - 1) * limit;

  const query: any = {};

  if (status) query.status = status;
  if (merchantId) query.merchant = merchantId;

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [offers, total] = await Promise.all([
    Offer.find(query)
      .populate('merchant', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Offer.countDocuments(query),
  ]);

  return { offers, total };
};

/** Find offer by ID */
export const findOfferById = (offerId: string): Promise<OfferDocument | null> =>
  Offer.findById(offerId)
    .populate('merchant', 'firstName lastName email')
    .exec();

/** Create offer on behalf of a merchant */
export const createOffer = (data: any): Promise<OfferDocument> =>
  new Offer(data).save();

/** Update offer */
export const updateOffer = (offerId: string, data: UpdateOfferDto): Promise<OfferDocument | null> =>
  Offer.findByIdAndUpdate(offerId, data, { new: true })
    .populate('merchant', 'firstName lastName email')
    .exec();

/** Soft delete offer */
export const softDeleteOffer = (offerId: string): Promise<OfferDocument | null> =>
  Offer.findByIdAndUpdate(offerId, { isDeleted: true }, { new: true }).exec();

/** Get all merchants for dropdown */
export const findMerchantsForDropdown = (): Promise<UserDocument[]> =>
  User.find({ role: USER_ROLES.MERCHANT, isDeleted: false, isVerified: true })
    .select('_id firstName lastName email')
    .sort({ firstName: 1 })
    .exec();