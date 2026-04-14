import { z } from 'zod';

export const analyticsFiltersSchema = z.object({
  // Core filters
  offerType: z.enum(['in-store', 'online', 'all']).optional(),
  ageGroup: z.enum(['18-24', '25-34', '35-44', '45+', 'all']).optional(),
  timeFilter: z.enum(['month', 'day-of-week', 'time']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  
  // Location filters
  locationId: z.string().optional(),  // Specific location/branch ID
  locationType: z.enum(['urban', 'suburban', 'rural', 'all']).optional(),  // Location type filter
  
  // Offers Analytics tab filters
  userType: z.enum(['new', 'returning', 'all']).optional(),  // New vs Returning users
  industry: z.string().optional(),  // Industry filter (from branch profile)
  month: z.coerce.number().min(1).max(12).optional(),  // Specific month (1-12)
  
  // Performance by segment filter
  offerId: z.string().optional(),  // For filtering specific offer performance
});

export type AnalyticsFiltersDto = z.infer<typeof analyticsFiltersSchema>;

