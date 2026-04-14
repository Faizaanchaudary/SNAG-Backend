import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();

const schema = z.object({
  nodeEnv:             z.enum(['development', 'production', 'test']).default('development'),
  port:                z.coerce.number().default(3000),
  databaseUrl:         z.string().min(1),
  jwtSecret:           z.string().min(32),
  jwtRefreshSecret:    z.string().min(32),
  jwtAccessExpiry:     z.string().default('15m'),
  jwtRefreshExpiry:    z.string().default('7d'),
  cloudinaryCloudName: z.string().min(1),
  cloudinaryApiKey:    z.string().min(1),
  cloudinaryApiSecret: z.string().min(1),
  smtpHost:            z.string().min(1),
  smtpPort:            z.coerce.number().default(587),
  smtpUser:            z.string().min(1),
  smtpPass:            z.string().min(1),
});

export const config = schema.parse({
  nodeEnv:             process.env.NODE_ENV,
  port:                process.env.PORT,
  databaseUrl:         process.env.DATABASE_URL,
  jwtSecret:           process.env.JWT_SECRET,
  jwtRefreshSecret:    process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiry:     process.env.JWT_ACCESS_EXPIRY,
  jwtRefreshExpiry:    process.env.JWT_REFRESH_EXPIRY,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey:    process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  smtpHost:            process.env.SMTP_HOST,
  smtpPort:            process.env.SMTP_PORT,
  smtpUser:            process.env.SMTP_USER,
  smtpPass:            process.env.SMTP_PASS,
});

export type Config = typeof config;
