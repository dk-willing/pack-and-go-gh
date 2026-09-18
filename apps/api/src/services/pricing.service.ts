export type CurrencyCode = "GHS";
export type VehicleType = "MOTORBIKE" | "CAR" | "VAN" | "PICKUP" | "LIGHT_TRUCK" | "MEDIUM_TRUCK" | "HEAVY_TRUCK" | "FLATBED" | "SPECIALIZED";
export type CargoCategory = "STANDARD" | "BULK" | "HEAVY" | "OVERSIZED" | "SPECIAL_HANDLING";

export interface LocationInput {
  country?: string;
  region?: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  locationNotes?: string;
}

export interface CargoItemInput {
  category: CargoCategory;
  description: string;
  quantity: number;
  weight?: { value: number; unit: "kg" | "g" | "ton" };
  dimensions?: { length: number; width: number; height: number; unit: "cm" | "m" | "ft" };
  declaredValue?: { value: number; currency?: string };
}

export interface HandlingRequirementsInput {
  loadingAssistance?: boolean;
  unloadingAssistance?: boolean;
  fragile?: boolean;
  specialEquipmentRequired?: boolean;
  specialInstructions?: string;
}

export interface RouteInfoInput {
  distanceKm: number;
  durationMinutes?: number;
  route?: string;
  source?: "TRUSTED_INTERNAL" | "CLIENT_PROVIDED";
}

export interface PricingCalculationInput {
  pickup: LocationInput;
  destination: LocationInput;
  cargo: CargoItemInput[];
  vehicleType: VehicleType;
  handlingRequirements?: HandlingRequirementsInput;
  routeInfo?: RouteInfoInput;
}

export interface PriceBreakdownItem {
  code: string;
  name: string;
  amount: number;
}

export interface PricingSnapshot {
  pricingVersion: string;
  currency: CurrencyCode;
  distanceKm: number;
  estimatedDurationMinutes: number;
  vehicleType: VehicleType;
  ratesUsed: Record<string, number>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  breakdown: PriceBreakdownItem[];
}

export interface PricingResult {
  currency: CurrencyCode;
  subtotal: number;
  discount: number;
  tax: number;
  additionalCharges: number;
  total: number;
  breakdown: PriceBreakdownItem[];
  distanceKm: number;
  estimatedDurationMinutes: number;
  vehicleType: VehicleType;
  pricingVersion: string;
  metadata: {
    estimateOnly: boolean;
    source: "backend";
    routeSource: "TRUSTED_INTERNAL" | "ESTIMATED_FALLBACK";
    notes: string[];
  };
  snapshot: PricingSnapshot;
}

export interface PricingConfiguration {
  version: string;
  currency: CurrencyCode;
  rates: {
    baseFare: number;
    distanceRate: number;
    weightRate: number;
    loadingFee: number;
    unloadingFee: number;
    specialHandlingFee: number;
    heavyCargoCharge: number;
    oversizedCargoCharge: number;
    additionalChargeRate: number;
    vehicleRates: Record<VehicleType, { baseFee: number; maxWeightKg: number; maxVolumeM3: number }>;
    cargoCategoryModifiers: Record<CargoCategory, number>;
  };
}

const DEFAULT_PRICING_CONFIG: PricingConfiguration = {
  version: "2026.1",
  currency: "GHS",
  rates: {
    baseFare: 50000,
    distanceRate: 250,
    weightRate: 120,
    loadingFee: 20000,
    unloadingFee: 20000,
    specialHandlingFee: 30000,
    heavyCargoCharge: 45000,
    oversizedCargoCharge: 70000,
    additionalChargeRate: 150,
    vehicleRates: {
      MOTORBIKE: { baseFee: 15000, maxWeightKg: 80, maxVolumeM3: 0.5 },
      CAR: { baseFee: 20000, maxWeightKg: 250, maxVolumeM3: 1.5 },
      VAN: { baseFee: 35000, maxWeightKg: 900, maxVolumeM3: 3.5 },
      PICKUP: { baseFee: 45000, maxWeightKg: 1200, maxVolumeM3: 5 },
      LIGHT_TRUCK: { baseFee: 65000, maxWeightKg: 2500, maxVolumeM3: 10 },
      MEDIUM_TRUCK: { baseFee: 90000, maxWeightKg: 5000, maxVolumeM3: 18 },
      HEAVY_TRUCK: { baseFee: 120000, maxWeightKg: 10000, maxVolumeM3: 30 },
      FLATBED: { baseFee: 110000, maxWeightKg: 8000, maxVolumeM3: 22 },
      SPECIALIZED: { baseFee: 160000, maxWeightKg: 15000, maxVolumeM3: 40 },
    },
    cargoCategoryModifiers: {
      STANDARD: 0,
      BULK: 500,
      HEAVY: 1200,
      OVERSIZED: 1800,
      SPECIAL_HANDLING: 1000,
    },
  },
};

function cloneConfig(): PricingConfiguration {
  return JSON.parse(JSON.stringify(DEFAULT_PRICING_CONFIG)) as PricingConfiguration;
}

function asMinorUnit(value: number, label: string) {
  if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
  if (value < 0) throw new Error(`${label} cannot be negative`);
  return Math.round(value);
}

function convertWeightToKg(value: number, unit: "kg" | "g" | "ton") {
  if (!Number.isFinite(value) || value <= 0) return 0;
  switch (unit) {
    case "g":
      return value / 1000;
    case "ton":
      return value * 1000;
    default:
      return value;
  }
}

function convertDimensionsToM3(dimensions: CargoItemInput["dimensions"]): number {
  if (!dimensions) return 0;
  const lengthM = dimensions.unit === "cm" ? dimensions.length / 100 : dimensions.unit === "ft" ? dimensions.length * 0.3048 : dimensions.length;
  const widthM = dimensions.unit === "cm" ? dimensions.width / 100 : dimensions.unit === "ft" ? dimensions.width * 0.3048 : dimensions.width;
  const heightM = dimensions.unit === "cm" ? dimensions.height / 100 : dimensions.unit === "ft" ? dimensions.height * 0.3048 : dimensions.height;
  return Math.max(0, lengthM * widthM * heightM);
}

function getTotalWeightKg(cargo: CargoItemInput[]) {
  return cargo.reduce((total, item) => {
    if (!item.weight) return total;
    const quantityFactor = Number(item.quantity) || 1;
    return total + convertWeightToKg(item.weight.value, item.weight.unit) * quantityFactor;
  }, 0);
}

function getTotalVolumeM3(cargo: CargoItemInput[]) {
  return cargo.reduce((total, item) => {
    if (!item.dimensions) return total;
    const quantityFactor = Number(item.quantity) || 1;
    return total + convertDimensionsToM3(item.dimensions) * quantityFactor;
  }, 0);
}

function estimateDistanceKm(pickup: LocationInput, destination: LocationInput) {
  const pickupLat = pickup.latitude;
  const pickupLng = pickup.longitude;
  const destLat = destination.latitude;
  const destLng = destination.longitude;

  if (typeof pickupLat === "number" && typeof pickupLng === "number" && typeof destLat === "number" && typeof destLng === "number") {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRadians(destLat - pickupLat);
    const dLng = toRadians(destLng - pickupLng);
    const lat1 = toRadians(pickupLat);
    const lat2 = toRadians(destLat);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const distance = 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(1, Math.round(distance));
  }

  const cityKey = `${pickup.city ?? "unknown"}-${destination.city ?? "unknown"}`;
  let hash = 0;
  for (let index = 0; index < cityKey.length; index += 1) {
    hash = (hash * 31 + cityKey.charCodeAt(index)) >>> 0;
  }
  return 35 + (hash % 520);
}

export function getPricingConfiguration(): PricingConfiguration {
  return cloneConfig();
}

function assertVehicleCanHandle(vehicleType: VehicleType, cargo: CargoItemInput[], config: PricingConfiguration) {
  const vehicleSpec = config.rates.vehicleRates[vehicleType];
  if (!vehicleSpec) throw new Error(`Unsupported vehicle type: ${vehicleType}`);

  const totalWeightKg = getTotalWeightKg(cargo);
  const totalVolumeM3 = getTotalVolumeM3(cargo);

  if (totalWeightKg > vehicleSpec.maxWeightKg) {
    throw new Error(`Cargo exceeds the selected vehicle capacity: ${vehicleSpec.maxWeightKg} kg maximum`);
  }

  if (totalVolumeM3 > vehicleSpec.maxVolumeM3) {
    throw new Error(`Cargo exceeds the selected vehicle volume capacity: ${vehicleSpec.maxVolumeM3} m³ maximum`);
  }
}

function validateInput(input: PricingCalculationInput) {
  if (!input?.pickup || !input?.destination) throw new Error("Pickup and destination are required");
  if (!Array.isArray(input.cargo) || input.cargo.length === 0) throw new Error("At least one cargo item is required");

  for (const item of input.cargo) {
    if (!item || typeof item.quantity !== "number" || item.quantity <= 0) throw new Error("Cargo quantity must be a positive number");
    if (item.category === "HEAVY" || item.category === "OVERSIZED") {
      if (!item.weight || !item.weight.value || item.weight.value <= 0) throw new Error("Weight is required for heavy or oversized cargo");
    }
    if (item.category === "OVERSIZED" && (!item.dimensions || item.dimensions.length <= 0 || item.dimensions.width <= 0 || item.dimensions.height <= 0)) {
      throw new Error("Dimensions are required for oversized cargo");
    }
    if (item.weight && item.weight.value <= 0) throw new Error("Cargo weight must be positive");
    if (item.dimensions && (item.dimensions.length <= 0 || item.dimensions.width <= 0 || item.dimensions.height <= 0)) {
      throw new Error("Cargo dimensions must be positive");
    }
  }

  if (input.routeInfo && input.routeInfo.distanceKm !== undefined && input.routeInfo.distanceKm <= 0) {
    throw new Error("Distance must be greater than zero");
  }
  if (input.routeInfo && input.routeInfo.source === "CLIENT_PROVIDED") {
    throw new Error("Client-provided route distance is not trusted for pricing");
  }
}

export function calculatePrice(input: PricingCalculationInput): PricingResult {
  validateInput(input);

  const config = getPricingConfiguration();
  const routeSource = input.routeInfo?.source === "TRUSTED_INTERNAL" ? "TRUSTED_INTERNAL" : "ESTIMATED_FALLBACK";
  const distanceKm = input.routeInfo && input.routeInfo.distanceKm > 0 ? input.routeInfo.distanceKm : estimateDistanceKm(input.pickup, input.destination);
  const estimatedDurationMinutes = input.routeInfo?.durationMinutes && input.routeInfo.durationMinutes > 0 ? input.routeInfo.durationMinutes : Math.max(30, Math.round(distanceKm * 1.5));

  assertVehicleCanHandle(input.vehicleType, input.cargo, config);

  const totalWeightKg = getTotalWeightKg(input.cargo);
  const totalVolumeM3 = getTotalVolumeM3(input.cargo);
  const hasHeavyCargo = input.cargo.some((item) => item.category === "HEAVY" || (item.weight && convertWeightToKg(item.weight.value, item.weight.unit) > 500));
  const hasOversizedCargo = input.cargo.some((item) => item.category === "OVERSIZED" || totalVolumeM3 > 8);
  const billableWeight = Math.max(totalWeightKg, totalVolumeM3 * 200);

  const breakdown: PriceBreakdownItem[] = [];
  const baseTransport = asMinorUnit(config.rates.baseFare + distanceKm * config.rates.distanceRate, "Base transport");
  breakdown.push({ code: "BASE_TRANSPORT", name: "Base transport", amount: baseTransport });
  breakdown.push({ code: "DISTANCE", name: "Distance charge", amount: asMinorUnit(distanceKm * config.rates.distanceRate, "Distance charge") });

  const categoryCharge = input.cargo.reduce((total, item) => {
    const modifierBasisPoints = config.rates.cargoCategoryModifiers[item.category] ?? 0;
    return total + Math.round(baseTransport * (modifierBasisPoints / 10000));
  }, 0);
  if (categoryCharge > 0) {
    breakdown.push({ code: "CARGO_CATEGORY", name: "Cargo category adjustment", amount: categoryCharge });
  }

  const vehicleSpec = config.rates.vehicleRates[input.vehicleType];
  const vehicleCharge = asMinorUnit(vehicleSpec.baseFee, "Vehicle charge");
  breakdown.push({ code: "VEHICLE", name: `${input.vehicleType.replace(/_/g, " ").toLowerCase()} vehicle charge`, amount: vehicleCharge });

  let weightCharge = 0;
  if (totalWeightKg > 0) {
    weightCharge = asMinorUnit(billableWeight * config.rates.weightRate, "Weight charge");
    breakdown.push({ code: "WEIGHT", name: "Weight charge", amount: weightCharge });
  }

  let loadingCharge = 0;
  if (input.handlingRequirements?.loadingAssistance) {
    loadingCharge = asMinorUnit(config.rates.loadingFee, "Loading charge");
    breakdown.push({ code: "LOADING", name: "Loading assistance", amount: loadingCharge });
  }

  let unloadingCharge = 0;
  if (input.handlingRequirements?.unloadingAssistance) {
    unloadingCharge = asMinorUnit(config.rates.unloadingFee, "Unloading charge");
    breakdown.push({ code: "UNLOADING", name: "Unloading assistance", amount: unloadingCharge });
  }

  let specialHandlingCharge = 0;
  if (input.handlingRequirements?.fragile || input.handlingRequirements?.specialEquipmentRequired || input.cargo.some((item) => item.category === "SPECIAL_HANDLING")) {
    specialHandlingCharge = asMinorUnit(config.rates.specialHandlingFee, "Special handling");
    breakdown.push({ code: "SPECIAL_HANDLING", name: "Special handling", amount: specialHandlingCharge });
  }

  let heavyCargoCharge = 0;
  if (hasHeavyCargo) {
    heavyCargoCharge = asMinorUnit(config.rates.heavyCargoCharge, "Heavy cargo");
    breakdown.push({ code: "HEAVY_CARGO", name: "Heavy cargo surcharge", amount: heavyCargoCharge });
  }

  let oversizedCargoCharge = 0;
  if (hasOversizedCargo) {
    oversizedCargoCharge = asMinorUnit(config.rates.oversizedCargoCharge, "Oversized cargo");
    breakdown.push({ code: "OVERSIZED_CARGO", name: "Oversized cargo surcharge", amount: oversizedCargoCharge });
  }

  const additionalChargeAmount = asMinorUnit((input.cargo.reduce((total, item) => total + (item.declaredValue?.value ?? 0), 0) / 1000) * config.rates.additionalChargeRate, "Additional charge");
  const additionalCharges = additionalChargeAmount > 0 ? [{ code: "DECLARED_VALUE", name: "Declared value surcharge", amount: additionalChargeAmount }] : [];
  if (additionalCharges.length > 0) breakdown.push(...additionalCharges);

  const subtotal = breakdown.reduce((sum, item) => sum + item.amount, 0);
  const discount = 0;
  const tax = 0;
  const total = subtotal - discount + tax;

  const snapshot: PricingSnapshot = {
    pricingVersion: config.version,
    currency: config.currency,
    distanceKm,
    estimatedDurationMinutes,
    vehicleType: input.vehicleType,
    ratesUsed: {
      baseFare: config.rates.baseFare,
      distanceRate: config.rates.distanceRate,
      weightRate: config.rates.weightRate,
      loadingFee: config.rates.loadingFee,
      unloadingFee: config.rates.unloadingFee,
      specialHandlingFee: config.rates.specialHandlingFee,
      heavyCargoCharge: config.rates.heavyCargoCharge,
      oversizedCargoCharge: config.rates.oversizedCargoCharge,
    },
    subtotal,
    discount,
    tax,
    total,
    breakdown,
  };

  return {
    currency: config.currency,
    subtotal,
    discount,
    tax,
    total,
    additionalCharges: additionalChargeAmount,
    breakdown,
    distanceKm,
    estimatedDurationMinutes,
    vehicleType: input.vehicleType,
    pricingVersion: config.version,
    metadata: {
      estimateOnly: true,
      source: "backend",
      routeSource,
      notes: [
        "Development pricing values are configurable defaults and not final commercial rates.",
        "All amounts are expressed in pesewas to avoid floating-point errors.",
      ],
    },
    snapshot,
  };
}

export function calculateFromDeliveryRequest(request: PricingCalculationInput | (PricingCalculationInput & { vehicleType?: VehicleType })) {
  return calculatePrice({
    ...request,
    vehicleType: request.vehicleType ?? "VAN",
  });
}

export function resolvePricingSnapshot(input: PricingCalculationInput): PricingSnapshot {
  return calculatePrice(input).snapshot;
}
