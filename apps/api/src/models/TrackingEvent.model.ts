import { Schema, model } from "mongoose";

export const TRACKING_EVENT_STATUSES = [
  "CREATED",
  "PICKUP_SCHEDULED",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVING_SOON",
  "DELIVERED",
  "DELAYED",
  "ON_HOLD",
  "FAILED_DELIVERY",
  "CANCELLED",
] as const;

export type TrackingEventStatus = (typeof TRACKING_EVENT_STATUSES)[number];

const locationSchema = new Schema(
  {
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    address: { type: String, trim: true, maxlength: 250 },
    city: { type: String, trim: true, maxlength: 100 },
    region: { type: String, trim: true, maxlength: 80 },
    country: { type: String, trim: true, maxlength: 80 },
  },
  { _id: false },
);

const trackingEventSchema = new Schema(
  {
    shipment: { type: Schema.Types.ObjectId, ref: "DeliveryRequest", required: true, index: true },
    status: { type: String, enum: TRACKING_EVENT_STATUSES, required: true, index: true },
    location: { type: locationSchema },
    description: { type: String, trim: true, maxlength: 500 },
    source: { type: String, enum: ["SYSTEM", "STAFF", "DRIVER", "GPS"], default: "SYSTEM" },
    visibility: { type: String, enum: ["CUSTOMER", "INTERNAL"], default: "CUSTOMER" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

trackingEventSchema.index({ shipment: 1, createdAt: -1 });

export const TrackingEvent = model("TrackingEvent", trackingEventSchema);
