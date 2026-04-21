import { NotFoundError } from '@core/errors/app-error.js';
import * as offersRepository from './offers.repository.js';
import { OffersFilterDto } from './offers.validation.js';

const toResponse = (o: any) => ({
  id:                 o._id.toString(),
  title:              o.title,
  description:        o.description,
  bannerUrl:          o.bannerUrl,
  offerType:          o.offerType,
  categories:         o.categories,
  status:             o.status,
  termsAndConditions: o.termsAndConditions,
  discountType:       o.discountType,
  couponCode:         o.couponCode,
  redemptionLimit:    o.redemptionLimit,
  locationIds:        o.locationIds,
  startDate:          o.startDate,
  endDate:            o.endDate,
  targetAudience:     o.targetAudience,
  stats:              o.stats,
  createdAt:          o.createdAt,
  updatedAt:          o.updatedAt,
});

export const listOffers = async (_retailerId: string, params: OffersFilterDto) => {
  const { offers, total } = await offersRepository.findAllOffers(params);
  return { items: offers.map(toResponse), total };
};

export const getOffer = async (_retailerId: string, offerId: string) => {
  const offer = await offersRepository.findOfferById(offerId);
  if (!offer) throw new NotFoundError('Offer not found');
  return toResponse(offer);
};
