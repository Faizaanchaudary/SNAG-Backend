import { AudienceSegment, AudienceSegmentDocument } from '@models/audience-segment.model.js';
import { CreateSegmentDto, UpdateSegmentDto, SegmentsFilterDto } from './audience.validation.js';

interface PaginatedSegments {
  segments: AudienceSegmentDocument[];
  total: number;
}

/** Find all segments for this retailer */
export const findSegments = async (retailerId: string, params: SegmentsFilterDto): Promise<PaginatedSegments> => {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  const query: any = { createdBy: retailerId, isDeleted: false };

  if (search) {
    query.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [segments, total] = await Promise.all([
    AudienceSegment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
    AudienceSegment.countDocuments(query),
  ]);

  return { segments, total };
};

/** Find segment by ID (must belong to retailer) */
export const findSegmentById = (segmentId: string, retailerId: string): Promise<AudienceSegmentDocument | null> =>
  AudienceSegment.findOne({ _id: segmentId, createdBy: retailerId, isDeleted: false }).exec();

/** Create segment */
export const createSegment = (retailerId: string, dto: CreateSegmentDto): Promise<AudienceSegmentDocument> =>
  new AudienceSegment({ ...dto, createdBy: retailerId }).save();

/** Update segment */
export const updateSegment = (segmentId: string, dto: UpdateSegmentDto): Promise<AudienceSegmentDocument | null> =>
  AudienceSegment.findByIdAndUpdate(segmentId, dto, { new: true }).exec();

/** Soft delete segment */
export const deleteSegment = (segmentId: string): Promise<AudienceSegmentDocument | null> =>
  AudienceSegment.findByIdAndUpdate(segmentId, { isDeleted: true }, { new: true }).exec();