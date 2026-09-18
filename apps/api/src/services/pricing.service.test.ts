import test from "node:test";
import assert from "node:assert/strict";

import { calculatePrice, getPricingConfiguration, resolvePricingSnapshot, type PricingCalculationInput } from "./pricing.service";

const baseInput: PricingCalculationInput = {
  pickup: { country: "GH", region: "Greater Accra", city: "Accra", address: "Spintex Road" },
  destination: { country: "GH", region: "Ashanti", city: "Kumasi", address: "Adum" },
  cargo: [
    {
      category: "STANDARD",
      description: "Boxes of goods",
      quantity: 3,
      weight: { value: 120, unit: "kg" },
      dimensions: { length: 60, width: 40, height: 40, unit: "cm" },
      declaredValue: { value: 1500, currency: "GHS" },
    },
  ],
  vehicleType: "VAN",
  handlingRequirements: {
    loadingAssistance: true,
    unloadingAssistance: true,
    fragile: false,
    specialEquipmentRequired: false,
  },
  routeInfo: {
    distanceKm: 120,
    durationMinutes: 180,
    route: "Accra -> Kumasi",
  },
};

test("standard delivery calculates successfully", () => {
  const result = calculatePrice(baseInput);

  assert.equal(result.currency, "GHS");
  assert.ok(result.total > 0);
  assert.ok(result.breakdown.some((item) => item.code === "BASE_TRANSPORT"));
  assert.ok(result.breakdown.some((item) => item.code === "DISTANCE"));
});

test("invalid weight is rejected", () => {
  assert.throws(() =>
    calculatePrice({
      ...baseInput,
      cargo: [{
        ...baseInput.cargo[0],
        weight: { value: -5, unit: "kg" },
      }],
    }),
  );
});

test("pricing configuration is centralized and versioned", () => {
  const config = getPricingConfiguration();
  assert.ok(config.version);
  assert.ok(config.rates.baseFare > 0);

  const result = calculatePrice(baseInput);
  assert.equal(result.pricingVersion, config.version);
  assert.ok(result.snapshot.pricingVersion === config.version);
});

test("snapshot uses a stable pricing result", () => {
  const snapshot = resolvePricingSnapshot(baseInput);
  const sameSnapshot = resolvePricingSnapshot(baseInput);

  assert.deepEqual(snapshot, sameSnapshot);
  assert.ok(snapshot.total > 0);
  assert.equal(snapshot.currency, "GHS");
});
