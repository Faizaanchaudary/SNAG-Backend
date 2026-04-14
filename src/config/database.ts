import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from './logger.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.databaseUrl);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error({ error }, 'MongoDB connection failed');
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
};
