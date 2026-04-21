import { ImportJob, ImportJobDocument, IImportJob } from '@models/import-job.model.js';
import { Offer } from '@models/offer.model.js';

/**
 * Create import job
 */
export const createImportJob = async (data: {
  type: 'offers' | 'users' | 'retailers';
  createdBy: string;
  totalItems: number;
  metadata?: Record<string, any>;
}): Promise<ImportJobDocument> => {
  return new ImportJob(data).save();
};

/**
 * Update import job
 */
export const updateImportJob = (
  id: string, 
  data: Partial<IImportJob>
): Promise<ImportJobDocument | null> => {
  return ImportJob.findByIdAndUpdate(id, data, { new: true }).exec();
};

/**
 * Find import job by ID
 */
export const findImportJobById = (id: string): Promise<ImportJobDocument | null> => {
  return ImportJob.findById(id).populate('createdBy', 'firstName lastName email').exec();
};

/**
 * Find import jobs with pagination
 */
export const findImportJobsWithPagination = async (params: {
  createdBy?: string;
  type?: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const { createdBy, type, status, page, limit } = params;
  const skip = (page - 1) * limit;

  const searchQuery: any = {};
  if (createdBy) searchQuery.createdBy = createdBy;
  if (type) searchQuery.type = type;
  if (status) searchQuery.status = status;

  const [jobs, total] = await Promise.all([
    ImportJob.find(searchQuery)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    ImportJob.countDocuments(searchQuery),
  ]);

  return { jobs, total };
};

/**
 * Bulk create offers
 */
export const bulkCreateOffers = async (offers: any[]): Promise<any[]> => {
  return await Offer.insertMany(offers, { ordered: false });
};