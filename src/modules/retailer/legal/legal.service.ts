import { NotFoundError } from '@core/errors/app-error.js';
import { cloudinary } from '@config/cloudinary.js';
import * as legalRepository from './legal.repository.js';
import { CreateDocDto, UpdateDocDto, DocsFilterDto } from './legal.validation.js';

/** Upload file to Cloudinary */
const uploadToCloudinary = (file: Express.Multer.File): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'snag/legal-docs', resource_type: 'raw' },
      (err, res) => (err ? reject(err) : resolve((res as any).secure_url)),
    );
    stream.end(file.buffer);
  });

const toResponse = (d: any) => ({
  id:        d._id.toString(),
  title:     d.title,
  type:      d.type,
  content:   d.content,
  fileUrl:   d.fileUrl,
  fileName:  d.fileName,
  version:   d.version,
  createdAt: d.createdAt,
  updatedAt: d.updatedAt,
});

/** Get all docs */
export const getDocs = async (retailerId: string, params: DocsFilterDto) => {
  const { page, limit } = params;
  const { docs, total } = await legalRepository.findDocs(retailerId, params);
  return {
    items: docs.map(toResponse),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/** Create doc with optional file upload */
export const createDoc = async (retailerId: string, dto: CreateDocDto, file?: Express.Multer.File) => {
  let fileUrl: string | undefined;
  let fileName: string | undefined;

  if (file) {
    fileUrl  = await uploadToCloudinary(file);
    fileName = file.originalname;
  }

  const doc = await legalRepository.createDoc(retailerId, { ...dto, fileUrl, fileName });
  return toResponse(doc);
};

/** Update doc with optional file upload */
export const updateDoc = async (retailerId: string, docId: string, dto: UpdateDocDto, file?: Express.Multer.File) => {
  const existing = await legalRepository.findDocById(docId, retailerId);
  if (!existing) throw new NotFoundError('Document not found');

  let fileUrl: string | undefined;
  let fileName: string | undefined;

  if (file) {
    fileUrl  = await uploadToCloudinary(file);
    fileName = file.originalname;
  }

  const updated = await legalRepository.updateDoc(docId, {
    ...dto,
    ...(fileUrl  && { fileUrl }),
    ...(fileName && { fileName }),
  });

  if (!updated) throw new NotFoundError('Document not found after update');
  return toResponse(updated);
};

/** Delete doc */
export const deleteDoc = async (retailerId: string, docId: string) => {
  const existing = await legalRepository.findDocById(docId, retailerId);
  if (!existing) throw new NotFoundError('Document not found');

  await legalRepository.deleteDoc(docId);
  return { deleted: true };
};