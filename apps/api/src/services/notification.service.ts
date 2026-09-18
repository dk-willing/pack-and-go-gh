import type { DeliveryStatus } from "../models/DeliveryRequest.model";
import { Notification } from "../models/Notification.model";

const statusLabels: Record<DeliveryStatus, string> = {
  SUBMITTED: "Request submitted",
  UNDER_REVIEW: "Request under review",
  QUOTE_PENDING: "Quote pending",
  QUOTED: "Quote available",
  ACCEPTED: "Quote accepted",
  PROCESSING: "Shipment processing",
  DISPATCHED: "Shipment dispatched",
  ARRIVED: "Shipment arrived",
  RECEIVED: "Shipment received",
  DECLINED: "Quote declined",
  REJECTED: "Request rejected",
  CANCELLED: "Request cancelled",
};

export async function notifyDeliveryStatus(
  customerId: unknown,
  requestId: unknown,
  status: DeliveryStatus,
  requestNumber: string,
) {
  const title = statusLabels[status];
  return Notification.create({
    customer: customerId,
    deliveryRequest: requestId,
    type: "DELIVERY_STATUS_CHANGED",
    status,
    title,
    message: `${title} for delivery request ${requestNumber}.`,
  });
}

export async function emitTrackingNotification(
  shipment: { customer?: unknown; _id?: unknown; requestNumber?: string | null; trackingNumber?: string | null },
  status: DeliveryStatus,
  description: string,
) {
  if (!shipment.customer || !shipment._id) return null;
  return Notification.create({
    customer: shipment.customer,
    deliveryRequest: shipment._id,
    type: "DELIVERY_STATUS_CHANGED",
    status,
    title: statusLabels[status] ?? "Shipment update",
    message: description || `${statusLabels[status] ?? "Shipment update"} for ${shipment.trackingNumber || shipment.requestNumber || "your shipment"}.`,
  });
}

export async function listCustomerNotifications(customerId: unknown, limit: number) {
  return Notification.find({ customer: customerId }).sort({ createdAt: -1 }).limit(limit).lean();
}

export async function unreadNotificationCount(customerId: unknown) {
  return Notification.countDocuments({ customer: customerId, readAt: { $exists: false } });
}

export async function markNotificationRead(customerId: unknown, notificationId: string) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, customer: customerId },
    { $set: { readAt: new Date() } },
    { new: true },
  );
}

export async function deleteNotification(customerId: unknown, notificationId: string) {
  return Notification.findOneAndDelete({ _id: notificationId, customer: customerId });
}