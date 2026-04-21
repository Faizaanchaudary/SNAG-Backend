import { NotFoundError } from '@core/errors/app-error.js';
import * as importsRepository from './imports.repository.js';
import { ImportOffersDto } from './imports.validation.js';

/**
 * Import offers in bulk
 */
export const importOffers = async (dto: ImportOffersDto, createdById: string) => {
  // Create import job
  const importJob = await importsRepository.createImportJob({
    type: 'offers',
    createdBy: createdById,
    totalItems: dto.offers.length,
    metadata: { merchantId: dto.merchantId },
  });

  // Start processing asynchronously
  processOffersImport(importJob._id.toString(), dto).catch(console.error);

  return {
    importId: importJob._id.toString(),
    status: importJob.status,
    totalItems: importJob.totalItems,
    message: 'Import job started successfully',
  };
};

/**
 * Get import job status
 */
export const getImportStatus = async (importId: string) => {
  const job = await importsRepository.findImportJobById(importId);
  if (!job) {
    throw new NotFoundError('Import job not found');
  }

  const createdBy = job.createdBy as any; // Type assertion for populated field
  return {
    importId: job._id.toString(),
    type: job.type,
    status: job.status,
    totalItems: job.totalItems,
    processedItems: job.processedItems,
    successfulItems: job.successfulItems,
    failedItems: job.failedItems,
    errors: job.importErrors,
    createdBy: createdBy?.firstName && createdBy?.lastName 
      ? `${createdBy.firstName} ${createdBy.lastName}` 
      : 'Unknown',
    startedAt: job.startedAt?.toISOString(),
    completedAt: job.completedAt?.toISOString(),
    createdAt: job.createdAt.toISOString(),
  };
};

/**
 * List import jobs
 */
export const listImportJobs = async (params: {
  createdBy?: string;
  type?: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const { jobs, total } = await importsRepository.findImportJobsWithPagination(params);
  
  const items = jobs.map((job) => {
    const createdBy = job.createdBy as any; // Type assertion for populated field
    return {
      importId: job._id.toString(),
      type: job.type,
      status: job.status,
      totalItems: job.totalItems,
      processedItems: job.processedItems,
      successfulItems: job.successfulItems,
      failedItems: job.failedItems,
      createdBy: createdBy?.firstName && createdBy?.lastName 
        ? `${createdBy.firstName} ${createdBy.lastName}` 
        : 'Unknown',
      startedAt: job.startedAt?.toISOString(),
      completedAt: job.completedAt?.toISOString(),
      createdAt: job.createdAt.toISOString(),
    };
  });

  return { items, total };
};

/**
 * Process offers import (background job)
 */
async function processOffersImport(importId: string, dto: ImportOffersDto) {
  try {
    // Update job status to processing
    await importsRepository.updateImportJob(importId, {
      status: 'processing',
      startedAt: new Date(),
    });

    const offers = dto.offers.map((offer) => ({
      merchant: dto.merchantId,
      title: offer.title,
      description: offer.description,
      offerType: offer.offerType,
      categories: offer.categories,
      status: 'draft', // Imported offers start as draft
      termsAndConditions: offer.termsAndConditions,
      startDate: offer.startDate ? new Date(offer.startDate) : undefined,
      endDate: offer.endDate ? new Date(offer.endDate) : undefined,
      redemptionLimit: offer.redemptionLimit,
      targetAudience: {
        demographics: [],
        interests: [],
        behaviors: [],
      },
      locationIds: [],
      stats: {
        views: 0,
        clicks: 0,
        redemptions: 0,
      },
    }));

    // Bulk insert offers
    const results = await importsRepository.bulkCreateOffers(offers);

    // Update job status to completed
    await importsRepository.updateImportJob(importId, {
      status: 'completed',
      processedItems: dto.offers.length,
      successfulItems: results.length,
      failedItems: dto.offers.length - results.length,
      completedAt: new Date(),
    });

  } catch (error) {
    console.error('Import job failed:', error);
    
    // Update job status to failed
    await importsRepository.updateImportJob(importId, {
      status: 'failed',
      completedAt: new Date(),
      importErrors: [{
        row: 0,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      }],
    });
  }
}