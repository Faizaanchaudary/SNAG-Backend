export const USER_ROLES = {
  ADMIN: 'admin',
  MERCHANT: 'merchant',
  CLIENT: 'client',
  RETAILER: 'retailer',
} as const;

export const MERCHANT_ONBOARDING_STEPS = {
  REGISTERED: 1,
  EMAIL_VERIFIED: 2,
  BRANCH_PROFILE: 3,
  LOCATION_ADDED: 4,
  BRANCH_INFO: 5,
  DONE: 6,
} as const;

export const CLIENT_ONBOARDING_STEPS = {
  REGISTERED: 1,
  EMAIL_VERIFIED: 2,
  LOCATION_SAVED: 3,
  INTERESTS_SAVED: 4,
  AVATAR_UPLOADED: 5,
  DONE: 6,
} as const;

// ── Industries ────────────────────────────────────────────────────────────────
// Single source of truth for all industry/interest categories.
// Used by:
//   - Merchant onboarding  → industry field (branch profile)
//   - Client onboarding    → interests selection (discover offers screen)
// Both sides use the same list so matching always works.

export const INDUSTRIES = [
  'Retail',
  'Sports',
  'Beauty',
  'Food & Drinks',
  'Food & Beverages',
  'Health',
  'Services',
  'Technology',
  'Other',
] as const;

export type Industry = (typeof INDUSTRIES)[number];

// Kept as alias so existing client code doesn't break
export const CLIENT_INTERESTS = INDUSTRIES;
export type ClientInterest = Industry;

export const OTP_EXPIRY_MINUTES = 10;
export const OTP_RESEND_COOLDOWN_SECONDS = 30;
export const OTP_LENGTH = 5;

// ── Offer Constants ───────────────────────────────────────────────────────────

export const OFFER_TYPES = {
  IN_STORE: 'in-store',
  ONLINE:   'online',
} as const;

export const OFFER_STATUSES = {
  ACTIVE:    'active',
  EXPIRED:   'expired',
  SCHEDULED: 'scheduled',
  DRAFT:     'draft',
} as const;

export const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  AMOUNT:     'amount',
  BUY_X_GET_Y: 'buy_x_get_y',
} as const;

export type OfferType     = (typeof OFFER_TYPES)[keyof typeof OFFER_TYPES];
export type OfferStatus   = (typeof OFFER_STATUSES)[keyof typeof OFFER_STATUSES];
export type DiscountType  = (typeof DISCOUNT_TYPES)[keyof typeof DISCOUNT_TYPES];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
