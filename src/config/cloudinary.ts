import { v2 as cloudinary } from 'cloudinary';
import { config } from './index.js';
import { logger } from './logger.js';

export const connectCloudinary = (): void => {
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
  });

  logger.info('Cloudinary configured');
};

export { cloudinary };
