import { LocationDocument } from '@models/location.model.js';

export interface LocationResponse {
  id: string;
  address: string;
  state: string;
  country: string;
  branchAddress: string;
  locationType: string;
  coordinates: { lat: number; lng: number };
  branchInfo?: {
    phoneNumber: string;
    email: string;
    contactName: string;
  };
  bannerUrl?: string;
  createdAt: Date;
}

export const toLocationResponse = (loc: LocationDocument): LocationResponse => ({
  id:            loc.id as string,
  address:       loc.address,
  state:         loc.state,
  country:       loc.country,
  branchAddress: loc.branchAddress,
  locationType:  loc.locationType,
  coordinates:   loc.coordinates,
  branchInfo:    loc.branchInfo,
  bannerUrl:     loc.bannerUrl,
  createdAt:     loc.createdAt,
});

export const toLocationList = (locs: LocationDocument[]): LocationResponse[] =>
  locs.map(toLocationResponse);
