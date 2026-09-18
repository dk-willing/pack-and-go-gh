import { Schema, model } from "mongoose";
import { UserRole } from "@pack-and-go/types";

export const DELIVERY_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "QUOTE_PENDING", "QUOTED", "ACCEPTED", "PROCESSING", "DISPATCHED", "ARRIVED", "RECEIVED", "DECLINED", "REJECTED", "CANCELLED"] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];
export const CARGO_CATEGORIES = ["STANDARD", "BULK", "HEAVY", "OVERSIZED", "SPECIAL_HANDLING"] as const;
export type CargoCategory = (typeof CARGO_CATEGORIES)[number];

const locationSchema = new Schema({
  country: { type: String, required: true, trim: true, maxlength: 80 },
  region: { type: String, required: true, trim: true, maxlength: 80 },
  city: { type: String, required: true, trim: true, maxlength: 100 },
  address: { type: String, required: true, trim: true, maxlength: 250 },
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  locationNotes: { type: String, trim: true, maxlength: 500 },
}, { _id: false });

const contactSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  email: { type: String, trim: true, maxlength: 254 },
}, { _id: false });

const cargoSchema = new Schema({
  category: { type: String, enum: CARGO_CATEGORIES, required: true },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  quantity: { type: Number, required: true, min: 1, max: 100000 },
  weight: { value: { type: Number, min: 0 }, unit: { type: String, enum: ["kg", "g", "ton"], default: "kg" } },
  dimensions: { length: Number, width: Number, height: Number, unit: { type: String, enum: ["cm", "m", "ft"] } },
  declaredValue: { value: Number, currency: { type: String, default: "GHS" } },
}, { _id: false });

const quoteSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: "GHS", uppercase: true, length: 3 },
  notes: { type: String, trim: true, maxlength: 1000 },
  quotedAt: { type: Date, required: true },
  quotedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  decisionAt: { type: Date },
}, { _id: false });

const riderSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  vehicle: { type: String, required: true, trim: true, maxlength: 100 },
  registrationNumber: { type: String, required: true, trim: true, maxlength: 30 },
}, { _id: false });

const deliveryRequestSchema = new Schema({
  requestNumber: { type: String, required: true, unique: true, index: true },
  customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
  pickup: { type: locationSchema, required: true },
  destination: { type: locationSchema, required: true },
  pickupContact: { type: contactSchema, required: true },
  destinationContact: { type: contactSchema, required: true },
  cargo: { type: [cargoSchema], required: true, validate: (items: unknown[]) => items.length > 0 },
  preferredPickupDate: { type: Date, required: true },
  handlingRequirements: { loadingAssistance: Boolean, unloadingAssistance: Boolean, fragile: Boolean, specialEquipmentRequired: Boolean, specialInstructions: { type: String, trim: true, maxlength: 1000 } },
  notes: { type: String, trim: true, maxlength: 2000 },
  attachments: [{ name: String, storageKey: String, contentType: String, size: Number }],
  status: { type: String, enum: DELIVERY_STATUSES, default: "SUBMITTED", required: true, index: true },
  quote: { type: quoteSchema },
  estimatedDeliveryDate: { type: Date },
  rider: { type: riderSchema },
  trackingNumber: { type: String, unique: true, sparse: true, index: true },
  dispatchedAt: { type: Date },
  statusHistory: [{ status: { type: String, enum: DELIVERY_STATUSES }, changedBy: { type: Schema.Types.ObjectId, ref: "User" }, changedAt: { type: Date, default: Date.now } }],
}, { timestamps: true, versionKey: false });

deliveryRequestSchema.index({ customer: 1, createdAt: -1 });
deliveryRequestSchema.index({ status: 1, createdAt: -1 });
export const DeliveryRequest = model("DeliveryRequest", deliveryRequestSchema);