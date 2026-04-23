import { NotFoundError } from '@core/errors/app-error.js';
import { cloudinary } from '@config/cloudinary.js';
import * as offersRepository from './offers.repository.js';
import { OffersFilterDto, CreateOfferDto, UpdateOfferDto } from './offers.validation.js';

/** Upload file to Cloudinary */
const uploadToCloudinary = (file: Express.Multer.File, folder: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, res) => (err ? reject(err) : resolve((res as any).secure_url)),
    );
    stream.end(file.buffer);
  });

/** Transform offer document to response */
const toOfferResponse = (offer: any) => {
  const merchant = offer.merchant as any;
  return {
    id:                 offer._id.toString(),
    merchantId:         merchant?._id?.toString(),
    merchantName:       merchant ? `${merchant.firstName} ${merchant.lastName}`.trim() : 'Unknown',
    merchantEmail:      merchant?.email,
    title:              offer.title,
    description:        offer.description,
    bannerUrl:          offer.bannerUrl,
    offerType:          offer.offerType,
    categories:         offer.categories ?? [],
    status:             offer.status,
    termsAndConditions: offer.termsAndConditions,
    discountType:       offer.discountType,
    couponCode:         offer.couponCode,
    redemptionLimit:    offer.redemptionLimit,
    startDate:          offer.startDate,
    endDate:            offer.endDate,
    stats: {
      views:       offer.stats?.views ?? 0,
      clicks:      offer.stats?.clicks ?? 0,
      redemptions: offer.stats?.redemptions ?? 0,
    },
    createdAt: offer.createdAt,
    updatedAt: offer.updatedAt,
  };
};

/** Get all offers with pagination, search, status filter */
export const getOffers = async (params: OffersFilterDto) => {
  const { page, limit } = params;
  const { offers, total } = await offersRepository.findOffers(params);

  return {
    items: offers.map(toOfferResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/** Get merchants for dropdown */
export const getMerchantsForDropdown = async () => {
  const merchants = await offersRepository.findMerchantsForDropdown();
  return merchants.map(m => ({
    id:    m._id.toString(),
    name:  `${m.firstName} ${m.lastName}`.trim(),
    email: m.email,
  }));
};

/** Create offer on behalf of a merchant */
export const createOffer = async (dto: CreateOfferDto, bannerFile?: Express.Multer.File) => {
  const bannerUrl = bannerFile
    ? await uploadToCloudinary(bannerFile, 'snag/offers/banners')
    : undefined;

  const offer = await offersRepository.createOffer({
    merchant:           dto.merchantId,
    title:              dto.title,
    description:        dto.description,
    offerType:          dto.offerType,
    categories:         dto.categories ?? [],
    status:             dto.status,
    termsAndConditions: dto.termsAndConditions,
    startDate:          dto.startDate,
    endDate:            dto.endDate,
    discountType:       dto.discountType,
    couponCode:         dto.couponCode,
    redemptionLimit:    dto.redemptionLimit,
    bannerUrl,
  });

  const populated = await offersRepository.findOfferById(offer._id.toString());
  return toOfferResponse(populated);
};

/** Update offer */
export const updateOffer = async (offerId: string, dto: UpdateOfferDto, bannerFile?: Express.Multer.File) => {
  const offer = await offersRepository.findOfferById(offerId);
  if (!offer) throw new NotFoundError('Offer not found');

  const bannerUrl = bannerFile
    ? await uploadToCloudinary(bannerFile, 'snag/offers/banners')
    : undefined;

  const updated = await offersRepository.updateOffer(offerId, {
    ...dto,
    ...(bannerUrl && { bannerUrl }),
  });

  if (!updated) throw new NotFoundError('Offer not found after update');
  return toOfferResponse(updated);
};

/** Delete offer */
export const deleteOffer = async (offerId: string) => {
  const offer = await offersRepository.findOfferById(offerId);
  if (!offer) throw new NotFoundError('Offer not found');

  await offersRepository.softDeleteOffer(offerId);
  return { deleted: true };
};