import { OfferTemplate, OfferTemplateDocument } from '@models/offer-template.model.js';
import { CreateTemplateDto, UpdateTemplateDto, TemplatesFilterDto } from './templates.validation.js';

interface PaginatedTemplates {
  templates: OfferTemplateDocument[];
  total: number;
}

/** Find all templates with pagination and filtering */
export const findTemplates = async (retailerId: string, params: TemplatesFilterDto): Promise<PaginatedTemplates> => {
  const { page, limit, search, type } = params;
  const skip = (page - 1) * limit;

  const query: any = { createdBy: retailerId, isDeleted: false };

  if (type) query.type = type;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const [templates, total] = await Promise.all([
    OfferTemplate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
    OfferTemplate.countDocuments(query),
  ]);

  return { templates, total };
};

/** Find template by ID (must belong to retailer) */
export const findTemplateById = (templateId: string, retailerId: string): Promise<OfferTemplateDocument | null> =>
  OfferTemplate.findOne({ _id: templateId, createdBy: retailerId, isDeleted: false }).exec();

/** Create template */
export const createTemplate = (retailerId: string, dto: CreateTemplateDto): Promise<OfferTemplateDocument> =>
  new OfferTemplate({ ...dto, createdBy: retailerId }).save();

/** Update template */
export const updateTemplate = (templateId: string, dto: UpdateTemplateDto): Promise<OfferTemplateDocument | null> =>
  OfferTemplate.findByIdAndUpdate(templateId, dto, { new: true }).exec();

/** Soft delete template */
export const deleteTemplate = (templateId: string): Promise<OfferTemplateDocument | null> =>
  OfferTemplate.findByIdAndUpdate(templateId, { isDeleted: true }, { new: true }).exec();