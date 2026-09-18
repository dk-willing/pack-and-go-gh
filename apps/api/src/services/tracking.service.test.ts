import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canTransitionTrackingStatus,
  normalizeTrackingStatus,
  buildPublicTrackingPayload,
} from "./tracking.service";

describe("tracking.service", () => {
  it("accepts valid sequential transitions", () => {
    assert.equal(canTransitionTrackingStatus("SUBMITTED", "PROCESSING"), true);
    assert.equal(canTransitionTrackingStatus("PROCESSING", "DISPATCHED"), true);
    assert.equal(canTransitionTrackingStatus("DISPATCHED", "DELIVERED"), true);
  });

  it("rejects invalid status jumps", () => {
    assert.equal(canTransitionTrackingStatus("SUBMITTED", "DELIVERED"), false);
    assert.equal(canTransitionTrackingStatus("DISPATCHED", "UNDER_REVIEW"), false);
  });

  it("normalizes tracking statuses to the shipment status model", () => {
    assert.equal(normalizeTrackingStatus("CREATED"), "SUBMITTED");
    assert.equal(normalizeTrackingStatus("PICKED_UP"), "PROCESSING");
    assert.equal(normalizeTrackingStatus("IN_TRANSIT"), "DISPATCHED");
    assert.equal(normalizeTrackingStatus("ARRIVING_SOON"), "ARRIVED");
  });

  it("builds a safe public payload without internal details", () => {
    const payload = buildPublicTrackingPayload({
      trackingNumber: "PGG-TRK-2026-000001",
      status: "DISPATCHED",
      currentLocation: { city: "Kumasi", region: "Ashanti", country: "Ghana" },
      estimatedDeliveryDate: "2026-09-20T12:00:00.000Z",
      pickup: { city: "Kumasi", region: "Ashanti", country: "Ghana" },
      destination: { city: "Accra", region: "Greater Accra", country: "Ghana" },
      timeline: [
        { status: "PROCESSING", createdAt: "2026-09-18T08:00:00.000Z", description: "Request accepted", location: { city: "Kumasi" } },
        { status: "DISPATCHED", createdAt: "2026-09-18T10:00:00.000Z", description: "Shipment dispatched", location: { city: "Kumasi" } },
      ],
    });

    assert.equal(payload.trackingNumber, "PGG-TRK-2026-000001");
    assert.equal(payload.status, "DISPATCHED");
    assert.equal(payload.timeline.length, 2);
    assert.equal("customer" in payload.timeline[0], false);
    assert.equal(payload.currentLocation?.city, "Kumasi");
  });
});
