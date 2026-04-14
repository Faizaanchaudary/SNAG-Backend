import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { ValidationError } from '@core/errors/app-error.js';

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new ValidationError('Only image files are allowed'));
    }
    cb(null, true);
  },
});

export const uploadCsv = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
      return cb(new ValidationError('Only CSV files are allowed'));
    }
    cb(null, true);
  },
});
