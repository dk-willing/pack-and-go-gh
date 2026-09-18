import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { DeliveryRequest } from "../models/DeliveryRequest.model";

export const getPlatformStats = asyncHandler(async (_req, res) => {
  const [pickupRegions, destinationRegions, completedShipments] =
    await Promise.all([
      DeliveryRequest.distinct("pickup.region", {
        status: { $nin: ["CANCELLED", "REJECTED"] },
      }),
      DeliveryRequest.distinct("destination.region", {
        status: { $nin: ["CANCELLED", "REJECTED"] },
      }),
      DeliveryRequest.find({ status: "RECEIVED" })
        .select("estimatedDeliveryDate statusHistory")
        .lean(),
    ]);

  const coveredRegions = new Set(
    [...pickupRegions, ...destinationRegions].filter(
      (region): region is string => typeof region === "string" && region.length > 0,
    ),
  );
  const onTimeShipments = completedShipments.filter((shipment) => {
    if (!shipment.estimatedDeliveryDate) return false;
    const receivedEvent = [...(shipment.statusHistory ?? [])]
      .reverse()
      .find((event) => event.status === "RECEIVED");
    return Boolean(
      receivedEvent?.changedAt &&
        new Date(receivedEvent.changedAt) <=
          new Date(shipment.estimatedDeliveryDate),
    );
  }).length;

  sendSuccess(res, 200, "Platform statistics retrieved successfully", {
    regionsCovered: coveredRegions.size,
    shipmentsCompleted: completedShipments.length,
    onTimeDeliveryRate:
      completedShipments.length > 0
        ? Math.round((onTimeShipments / completedShipments.length) * 1000) / 10
        : null,
    trackingAvailable: true,
  });
});
