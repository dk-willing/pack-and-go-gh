import { DeliveryRequest, type DeliveryStatus } from "../models/DeliveryRequest.model";
import { TrackingEvent, type TrackingEventStatus } from "../models/TrackingEvent.model";
import { emitTrackingNotification } from "./notification.service";
import { ApiError } from "../utils/ApiError";

export const TRACKING_STATUS_SEQUENCE: Record<string, string[]> = {
  CREATED: ["PICKUP_SCHEDULED", "READY_FOR_PICKUP", "PICKED_UP", "DELAYED", "ON_HOLD", "CANCELLED"],
  PICKUP_SCHEDULED: ["READY_FOR_PICKUP", "PICKED_UP", "DELAYED", "ON_HOLD", "CANCELLED"],
  READY_FOR_PICKUP: ["PICKED_UP", "DELAYED", "ON_HOLD", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "DELAYED", "ON_HOLD", "CANCELLED"],
  IN_TRANSIT: ["ARRIVING_SOON", "DELAYED", "ON_HOLD", "FAILED_DELIVERY", "CANCELLED"],
  ARRIVING_SOON: ["DELIVERED", "DELAYED", "ON_HOLD", "CANCELLED"],
  DELIVERED: [],
  DELAYED: ["IN_TRANSIT", "ON_HOLD", "CANCELLED"],
  ON_HOLD: ["PICKUP_SCHEDULED", "READY_FOR_PICKUP", "PICKED_UP", "IN_TRANSIT", "ARRIVING_SOON", "DELAYED"],
  FAILED_DELIVERY: ["IN_TRANSIT", "PICKUP_SCHEDULED", "READY_FOR_PICKUP", "PICKED_UP"],
  CANCELLED: [],
};

const TRACKING_TO_SHIPMENT_STATUS: Record<string, DeliveryStatus> = {
  CREATED: "SUBMITTED",
  PICKUP_SCHEDULED: "PROCESSING",
  READY_FOR_PICKUP: "PROCESSING",
  PICKED_UP: "PROCESSING",
  IN_TRANSIT: "DISPATCHED",
  ARRIVING_SOON: "ARRIVED",
  DELIVERED: "RECEIVED",
  DELAYED: "DISPATCHED",
  ON_HOLD: "PROCESSING",
  FAILED_DELIVERY: "REJECTED",
  CANCELLED: "CANCELLED",
};

const SHIPMENT_LIFECYCLE: Record<DeliveryStatus, DeliveryStatus[]> = {
  SUBMITTED: ["PROCESSING"],
  UNDER_REVIEW: ["PROCESSING"],
  QUOTE_PENDING: ["PROCESSING"],
  QUOTED: ["PROCESSING"],
  ACCEPTED: ["PROCESSING"],
  PROCESSING: ["DISPATCHED"],
  DISPATCHED: ["ARRIVED", "RECEIVED"],
  ARRIVED: ["RECEIVED"],
  RECEIVED: [],
  DECLINED: [],
  REJECTED: [],
  CANCELLED: [],
};

export function normalizeTrackingStatus(status: string): DeliveryStatus {
  const normalizedStatus = String(status).trim().toUpperCase();
  return TRACKING_TO_SHIPMENT_STATUS[normalizedStatus] ?? (normalizedStatus as DeliveryStatus);
}

export function canTransitionTrackingStatus(fromStatus: string, toStatus: string): boolean {
  const previousKey = normalizeTrackingStatus(fromStatus);
  const nextKey = normalizeTrackingStatus(toStatus);
  const nextStatuses = SHIPMENT_LIFECYCLE[previousKey] ?? [];
  return nextStatuses.includes(nextKey);
}

export function buildPublicTrackingPayload(input: {
  trackingNumber: string;
  status: DeliveryStatus;
  currentLocation?: { latitude?: number; longitude?: number; address?: string; city?: string; region?: string; country?: string } | null;
  estimatedDeliveryDate?: Date | string | null;
  pickup?: { city?: string; region?: string; country?: string; address?: string } | null;
  destination?: { city?: string; region?: string; country?: string; address?: string } | null;
  timeline: Array<{
    status?: string;
    description?: string;
    createdAt?: Date | string;
    location?: { city?: string; region?: string; country?: string; address?: string } | null;
  }>;
}) {
  return {
    trackingNumber: input.trackingNumber,
    status: input.status,
    pickup: input.pickup ?? null,
    destination: input.destination ?? null,
    estimatedDelivery: input.estimatedDeliveryDate ? new Date(input.estimatedDeliveryDate).toISOString() : null,
    lastUpdated: input.timeline.at(-1)?.createdAt ? new Date(input.timeline.at(-1)!.createdAt!).toISOString() : null,
    currentLocation: input.currentLocation ?? null,
    timeline: input.timeline.map((event) => ({
      status: event.status ?? "UPDATE",
      description: event.description ?? "Shipment update",
      createdAt: event.createdAt ? new Date(event.createdAt).toISOString() : null,
      location: event.location ?? null,
    })),
  };
}

export async function getShipmentTrackingTimeline(shipmentId: string, viewerRole?: string) {
  const query = { shipment: shipmentId };
  const events = await TrackingEvent.find(
    viewerRole && viewerRole !== "CUSTOMER" ? query : { ...query, visibility: "CUSTOMER" },
  ).sort({ createdAt: 1 }).lean();
  return events;
}

export async function createTrackingEvent(input: {
  shipmentId: string;
  status: TrackingEventStatus | string;
  location?: { latitude?: number; longitude?: number; address?: string; city?: string; region?: string; country?: string };
  description?: string;
  source?: "SYSTEM" | "STAFF" | "DRIVER" | "GPS";
  visibility?: "CUSTOMER" | "INTERNAL";
  actor?: string;
}) {
  const shipment = await DeliveryRequest.findById(input.shipmentId);
  if (!shipment) throw ApiError.notFound("Shipment not found");

  const requestedStatus = String(input.status).trim().toUpperCase();
  const normalizedStatus = normalizeTrackingStatus(requestedStatus);

  if (!canTransitionTrackingStatus(shipment.status, normalizedStatus)) {
    throw ApiError.conflict(`Cannot move shipment from ${shipment.status} to ${normalizedStatus}`);
  }

  if (input.location) {
    if (
      input.location.latitude !== undefined &&
      (Number(input.location.latitude) < -90 || Number(input.location.latitude) > 90)
    ) {
      throw ApiError.badRequest("Latitude must be between -90 and 90 degrees");
    }

    if (
      input.location.longitude !== undefined &&
      (Number(input.location.longitude) < -180 || Number(input.location.longitude) > 180)
    ) {
      throw ApiError.badRequest("Longitude must be between -180 and 180 degrees");
    }

    const currentLocation = {
      ...input.location,
      updatedAt: new Date(),
    } as any;
    shipment.set("currentLocation", currentLocation);
  }

  shipment.status = normalizedStatus;
  shipment.set("lastTrackingAt", new Date());
  shipment.statusHistory.push({ status: normalizedStatus, changedAt: new Date(), changedBy: input.actor } as never);

  const event = await TrackingEvent.create({
    shipment: shipment._id,
    status: requestedStatus,
    location: input.location,
    description: input.description,
    source: input.source ?? "SYSTEM",
    visibility: input.visibility ?? "CUSTOMER",
    createdBy: input.actor,
    createdAt: new Date(),
  });

  await shipment.save();
  await emitTrackingNotification({
    customer: (shipment as any).customer,
    _id: shipment._id,
    requestNumber: shipment.requestNumber ?? null,
    trackingNumber: shipment.trackingNumber ?? null,
  }, normalizedStatus, input.description ?? "Shipment status updated");

  return event;
}

export async function getPublicTrackingByNumber(trackingNumber: string) {
  const normalizedNumber = trackingNumber.trim();
  const shipment = await DeliveryRequest.findOne({ trackingNumber: normalizedNumber }).lean();
  if (!shipment) throw ApiError.notFound("Tracking number not found");

  const events = await TrackingEvent.find({ shipment: shipment._id }).sort({ createdAt: 1 }).lean();
  return buildPublicTrackingPayload({
    trackingNumber: shipment.trackingNumber ?? normalizedNumber,
    status: shipment.status,
    currentLocation: shipment.currentLocation as any,
    estimatedDeliveryDate: shipment.estimatedDeliveryDate,
    pickup: shipment.pickup as any,
    destination: shipment.destination as any,
    timeline: events.map((event) => ({
      status: event.status,
      description: event.description ?? undefined,
      createdAt: event.createdAt,
      location: event.location as any,
    })),
  });
}
