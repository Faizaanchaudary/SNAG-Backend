import { NotFoundError } from '@core/errors/app-error.js';
import * as templatesRepository from './templates.repository.js';
import { CreateTemplateDto, UpdateTemplateDto, TemplatesFilterDto } from './templates.validation.js';

const toResponse = (t: any) => ({
  id:          t._id.toString(),
  name:        t.name,
  description: t.description,
  type:        t.type,
  createdAt:   t.createdAt,
  updatedAt:   t.updatedAt,
});

/** Get all templates for this retailer */
export const getTemplates = async (retailerId: string, params: TemplatesFilterDto) => {
  const { page, limit } = params;
  const { templates, total } = await templatesRepository.findTemplates(retailerId, params);

  return {
    items: templates.map(toResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/** Create template */
export const createTemplate = async (retailerId: string, dto: CreateTemplateDto) => {
  const template = await templatesRepository.createTemplate(retailerId, dto);
  return toResponse(template);
};

/** Update template */
export const updateTemplate = async (retailerId: string, templateId: string, dto: UpdateTemplateDto) => {
  const existing = await templatesRepository.findTemplateById(templateId, retailerId);
  if (!existing) throw new NotFoundError('Template not found');

  const updated = await templatesRepository.updateTemplate(templateId, dto);
  if (!updated) throw new NotFoundError('Template not found after update');

  return toResponse(updated);
};

/** Delete template */
export const deleteTemplate = async (retailerId: string, templateId: string) => {
  const existing = await templatesRepository.findTemplateById(templateId, retailerId);
  if (!existing) throw new NotFoundError('Template not found');

  await templatesRepository.deleteTemplate(templateId);
  return { deleted: true };
};