import { NotFoundError } from '@core/errors/app-error.js';
import * as audienceRepository from './audience.repository.js';
import { CreateSegmentDto, UpdateSegmentDto, SegmentsFilterDto } from './audience.validation.js';

const toResponse = (s: any) => ({
  id:            s._id.toString(),
  name:          s.name,
  description:   s.description,
  filters:       s.filters ?? {},
  estimatedSize: s.estimatedSize ?? 0,
  createdAt:     s.createdAt,
  updatedAt:     s.updatedAt,
});

/** Get all segments for this retailer */
export const getSegments = async (retailerId: string, params: SegmentsFilterDto) => {
  const { page, limit } = params;
  const { segments, total } = await audienceRepository.findSegments(retailerId, params);

  return {
    items: segments.map(toResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/** Create segment */
export const createSegment = async (retailerId: string, dto: CreateSegmentDto) => {
  const segment = await audienceRepository.createSegment(retailerId, dto);
  return toResponse(segment);
};

/** Update segment */
export const updateSegment = async (retailerId: string, segmentId: string, dto: UpdateSegmentDto) => {
  const existing = await audienceRepository.findSegmentById(segmentId, retailerId);
  if (!existing) throw new NotFoundError('Segment not found');

  const updated = await audienceRepository.updateSegment(segmentId, dto);
  if (!updated) throw new NotFoundError('Segment not found after update');

  return toResponse(updated);
};

/** Delete segment */
export const deleteSegment = async (retailerId: string, segmentId: string) => {
  const existing = await audienceRepository.findSegmentById(segmentId, retailerId);
  if (!existing) throw new NotFoundError('Segment not found');

  await audienceRepository.deleteSegment(segmentId);
  return { deleted: true };
};