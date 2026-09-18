import { Schema, model, type HydratedDocument } from "mongoose";
import { QUOTE_STATUSES, type QuoteStatus } from "../utils/quoteStatus";

export interface QuotePricingSnapshot {
  pricingVersion: string;
  calculatedAt: Date;
  route: Record<string, unknown>;
  cargo: Record<string, unknown>[];
  vehicle: Record<string, unknown>;
  services: Record<string, unknown>;
  breakdown: Record<string, number>;
  subtotal: number;
  discounts: number;
  taxes: number;
  additionalCharges: number;
  total: number;
}

export interface QuoteDocument {
  quoteNumber: string;
  deliveryRequest: Schema.Types.ObjectId;
  customer: Schema.Types.ObjectId;
  currency: string;
  pricingSnapshot: QuotePricingSnapshot;
  title?: string;
  description?: string;
  internalNotes?: string;
  customerNotes?: string;
  status: QuoteStatus;
  validUntil: Date;
  sentAt?: Date;
  viewedAt?: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  rejectionReason?: string;
  cancellationReason?: string;
  createdBy: Schema.Types.ObjectId;
  approvedBy?: Schema.Types.ObjectId;
  acceptedBy?: Schema.Types.ObjectId;
  rejectedBy?: Schema.Types.ObjectId;
  cancelledBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const pricingSnapshotSchema = new Schema<QuotePricingSnapshot>(
  {
    pricingVersion: { type: String, required: true },
    calculatedAt: { type: Date, required: true },
    route: { type: Schema.Types.Mixed, required: true },
    cargo: { type: [Object], required: true },
    vehicle: { type: Schema.Types.Mixed, required: true },
    services: { type: Schema.Types.Mixed, required: true },
    breakdown: { type: Schema.Types.Mixed, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discounts: { type: Number, required: true, min: 0 },
    taxes: { type: Number, required: true, min: 0 },
    additionalCharges: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const quoteSchema = new Schema<QuoteDocument>(
  {
    quoteNumber: { type: String, required: true, unique: true, index: true },
    deliveryRequest: { type: Schema.Types.ObjectId, ref: "DeliveryRequest", required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    currency: { type: String, required: true, default: "GHS", uppercase: true, length: 3 },
    pricingSnapshot: { type: pricingSnapshotSchema, required: true },
    title: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000 },
    internalNotes: { type: String, trim: true, maxlength: 2000 },
    customerNotes: { type: String, trim: true, maxlength: 2000 },
    status: { type: String, enum: QUOTE_STATUSES, default: "DRAFT", required: true, index: true },
    validUntil: { type: Date, required: true, index: true },
    sentAt: Date,
    viewedAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
    cancelledAt: Date,
    rejectionReason: { type: String, trim: true, maxlength: 500 },
    cancellationReason: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "Customer" },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "Customer" },
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false },
);

quoteSchema.index({ customer: 1, createdAt: -1 });
quoteSchema.index({ status: 1, validUntil: 1 });
quoteSchema.index({ deliveryRequest: 1, status: 1 });

export type QuoteDocumentHydrated = HydratedDocument<QuoteDocument>;
export const Quote = model<QuoteDocument>("Quote", quoteSchema);
