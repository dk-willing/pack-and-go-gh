import { Router } from "express";
import { UserRole } from "@pack-and-go/types";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { createTrackingEvent, getPublicTrackingByNumber, getShipmentTrackingTimeline } from "../services/tracking.service";
import { trackingEventSchema } from "../validators/tracking.validator";
import { ApiError } from "../utils/ApiError";

const router = Router();
const staffRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.DISPATCHER, UserRole.OPERATIONS_MANAGER];

function parse<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } }, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw ApiError.badRequest("Validation failed", result.error.flatten().fieldErrors);
  return result.data;
}

router.get("/track/:trackingNumber", asyncHandler(async (req, res) => {
  const payload = await getPublicTrackingByNumber(req.params.trackingNumber);
  sendSuccess(res, 200, "Shipment tracking retrieved successfully", payload);
}));

router.get("/:shipmentId/tracking", requireAuth, asyncHandler(async (req, res) => {
  const role = req.auth?.role;
  const events = await getShipmentTrackingTimeline(req.params.shipmentId, role);
  sendSuccess(res, 200, "Shipment timeline retrieved successfully", { events });
}));

router.post("/:shipmentId/tracking-events", requireAuth, requireRole(...staffRoles), asyncHandler(async (req, res) => {
  const payload = parse(trackingEventSchema, req.body);
  const event = await createTrackingEvent({
    shipmentId: req.params.shipmentId,
    status: payload.status,
    location: payload.location,
    description: payload.description,
    source: payload.source,
    visibility: payload.visibility,
    actor: req.auth?.id,
  });
  sendSuccess(res, 201, "Tracking event created successfully", { event });
}));

export default router;
