import { BranchProfile, BranchProfileDocument } from '@models/branch-profile.model.js';
import { Location, LocationDocument } from '@models/location.model.js';
import { User } from '@models/user.model.js';
import { BranchProfileDto, AddLocationDto, CsvLocationRow } from './onboarding.validation.js';

// ── Branch Profile ────────────────────────────────────────────────────────────

export const upsertBranchProfile = (
  merchantId: string,
  data: BranchProfileDto & { logoUrl?: string },
): Promise<BranchProfileDocument> =>
  BranchProfile.findOneAndUpdate(
    { merchant: merchantId },
    { ...data, merchant: merchantId },
    { upsert: true, new: true },
  ).exec() as Promise<BranchProfileDocument>;

export const findBranchProfile = (merchantId: string): Promise<BranchProfileDocument | null> =>
  BranchProfile.findOne({ merchant: merchantId }).exec();

// ── Locations ─────────────────────────────────────────────────────────────────

export const createLocation = (
  merchantId: string,
  data: AddLocationDto & { bannerUrl?: string },
): Promise<LocationDocument> => {
  return new Location({
    merchant: merchantId,
    address: data.address,
    state: data.state,
    country: data.country,
    branchAddress: data.branchAddress,
    locationType: data.locationType,
    coordinates: data.coordinates,
    branchInfo: data.branchInfo,
    ...(data.bannerUrl && { bannerUrl: data.bannerUrl }),
  }).save();
};

export const addBranchInfo = (
  locationId: string,
  merchantId: string,
  branchInfo: { phoneNumber: string; email: string; contactName: string },
): Promise<LocationDocument | null> =>
  Location.findOneAndUpdate(
    { _id: locationId, merchant: merchantId, isDeleted: false },
    { branchInfo },
    { new: true },
  ).exec();

export const bulkCreateLocations = async (
  merchantId: string,
  rows: CsvLocationRow[],
): Promise<LocationDocument[]> => {
  const docs = await Location.insertMany(
    rows.map((r) => ({
      merchant:      merchantId,
      address:       r.address,
      state:         r.state,
      country:       r.country,
      branchAddress: r.branchAddress,
      locationType:  r.locationType,
      coordinates:   { lat: r.lat, lng: r.lng },
      branchInfo: {
        phoneNumber: r.phoneNumber,
        email:       r.email,
        contactName: r.contactName,
      },
    })),
  );
  return docs as unknown as LocationDocument[];
};

export const findMerchantLocations = (merchantId: string): Promise<LocationDocument[]> =>
  Location.find({ merchant: merchantId, isDeleted: false }).sort({ createdAt: -1 }).exec();

export const findLocationById = (
  locationId: string,
  merchantId: string,
): Promise<LocationDocument | null> =>
  Location.findOne({ _id: locationId, merchant: merchantId, isDeleted: false }).exec();

export const updateLocation = (
  locationId: string,
  merchantId: string,
  data: Partial<{
    address: string; state: string; country: string;
    branchAddress: string; locationType: string;
    coordinates: { lat: number; lng: number };
    branchInfo: { phoneNumber?: string; email?: string };
    bannerUrl: string;
  }>,
): Promise<LocationDocument | null> => {
  const updateData: any = {};
  
  // Handle regular fields
  if (data.address) updateData.address = data.address;
  if (data.state) updateData.state = data.state;
  if (data.country) updateData.country = data.country;
  if (data.branchAddress) updateData.branchAddress = data.branchAddress;
  if (data.locationType) updateData.locationType = data.locationType;
  if (data.coordinates) updateData.coordinates = data.coordinates;
  if (data.bannerUrl) updateData.bannerUrl = data.bannerUrl;
  
  // Handle branchInfo fields
  if (data.branchInfo) {
    if (data.branchInfo.phoneNumber) updateData['branchInfo.phoneNumber'] = data.branchInfo.phoneNumber;
    if (data.branchInfo.email) updateData['branchInfo.email'] = data.branchInfo.email;
  }
  
  return Location.findOneAndUpdate(
    { _id: locationId, merchant: merchantId, isDeleted: false },
    { $set: updateData },
    { new: true },
  ).exec();
};

export const deleteLocation = (
  locationId: string,
  merchantId: string,
): Promise<LocationDocument | null> =>
  Location.findOneAndUpdate(
    { _id: locationId, merchant: merchantId, isDeleted: false },
    { isDeleted: true },
    { new: true },
  ).exec();

// ── Onboarding step ───────────────────────────────────────────────────────────

export const updateOnboardingStep = (merchantId: string, step: number) =>
  User.findByIdAndUpdate(merchantId, { onboardingStep: step }, { new: true }).exec();

export const saveMerchantLocation = (
  merchantId: string,
  lat: number,
  lng: number,
) => User.findByIdAndUpdate(
  merchantId,
  { location: { lat, lng } },
  { new: true },
).exec();
