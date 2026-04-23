import { LegalDocument, LegalDocumentDocument } from '@models/legal-document.model.js';
import { CreateDocDto, UpdateDocDto, DocsFilterDto } from './legal.validation.js';

interface PaginatedDocs {
  docs: LegalDocumentDocument[];
  total: number;
}

/** Find all docs for this retailer */
export const findDocs = async (retailerId: string, params: DocsFilterDto): Promise<PaginatedDocs> => {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  const query = { createdBy: retailerId, isDeleted: false };

  const [docs, total] = await Promise.all([
    LegalDocument.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
    LegalDocument.countDocuments(query),
  ]);

  return { docs, total };
};

/** Find doc by ID */
export const findDocById = (docId: string, retailerId: string): Promise<LegalDocumentDocument | null> =>
  LegalDocument.findOne({ _id: docId, createdBy: retailerId, isDeleted: false }).exec();

/** Create doc */
export const createDoc = (retailerId: string, dto: CreateDocDto & { fileUrl?: string; fileName?: string }): Promise<LegalDocumentDocument> =>
  new LegalDocument({ ...dto, createdBy: retailerId }).save();

/** Update doc */
export const updateDoc = (docId: string, data: any): Promise<LegalDocumentDocument | null> =>
  LegalDocument.findByIdAndUpdate(docId, data, { new: true }).exec();

/** Soft delete doc */
export const deleteDoc = (docId: string): Promise<LegalDocumentDocument | null> =>
  LegalDocument.findByIdAndUpdate(docId, { isDeleted: true }, { new: true }).exec();