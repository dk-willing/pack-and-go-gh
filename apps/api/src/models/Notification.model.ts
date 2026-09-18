import { Schema, model } from "mongoose";
import type { DeliveryStatus } from "./DeliveryRequest.model";

export interface NotificationDocument {
  customer: Schema.Types.ObjectId;
  deliveryRequest: Schema.Types.ObjectId;
  type: "DELIVERY_STATUS_CHANGED";
  status: DeliveryStatus;
  title: string;
  message: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    deliveryRequest: { type: Schema.Types.ObjectId, ref: "DeliveryRequest", required: true, index: true },
    type: { type: String, enum: ["DELIVERY_STATUS_CHANGED"], required: true },
    status: { type: String, required: true },
    title: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 500 },
    readAt: { type: Date },
  },
  { timestamps: true, versionKey: false },
);

notificationSchema.index({ customer: 1, createdAt: -1 });
notificationSchema.index({ customer: 1, readAt: 1 });

export const Notification = model<NotificationDocument>("Notification", notificationSchema);