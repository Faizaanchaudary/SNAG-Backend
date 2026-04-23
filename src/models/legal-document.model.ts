import mongoose, { Document, Schema } from 'mongoose';

export interface ILegalDocument {
  title:       string;
  type:        string; // 'terms' | 'privacy' | 'dpa' | 'other'
  content?:    string; // text content (for T&C)
  fileUrl?:    string; // uploaded document URL
  fileName?:   string; // original file name
  version:     string;
  createdBy:   mongoose.Types.ObjectId;
  isDeleted:   boolean;
  createdAt:   Date;
  updatedAt:   Date;
}

export interface LegalDocumentDocument extends ILegalDocument, Document {}

const legalDocumentSchema = new Schema<LegalDocumentDocument>(
  {
    title:     { type: String, required: true, trim: true },
    type:      { type: String, required: true, enum: ['terms', 'privacy', 'dpa', 'other'], default: 'other' },
    content:   { type: String },
    fileUrl:   { type: String },
    fileName:  { type: String },
    version:   { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const LegalDocument = mongoose.model<LegalDocumentDocument>('LegalDocument', legalDocumentSchema);