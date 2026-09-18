import { z } from "zod";

const vehicleTypes = ["MOTORBIKE", "CAR", "VAN", "PICKUP", "LIGHT_TRUCK", "MEDIUM_TRUCK", "HEAVY_TRUCK", "FLATBED", "SPECIALIZED"] as const;

const locationSchema = z.object({
  country: z.string().trim().min(2).max(80).optional(),
  region: z.string().trim().min(2).max(80).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  address: z.string().trim().min(2).max(250).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  locationNotes: z.string().trim().max(500).optional(),
});

const cargoSchema = z.object({
  category: z.enum(["STANDARD", "BULK", "HEAVY", "OVERSIZED", "SPECIAL_HANDLING"]),
  description: z.string().trim().min(2).max(500),
  quantity: z.number().int().min(1).max(100000),
  weight: z.object({ value: z.number().positive(), unit: z.enum(["kg", "g", "ton"]) }).optional(),
  dimensions: z.object({ length: z.number().positive(), width: z.number().positive(), height: z.number().positive(), unit: z.enum(["cm", "m", "ft"]) }).optional(),
  declaredValue: z.object({ value: z.number().nonnegative(), currency: z.string().length(3).default("GHS") }).optional(),
});

const routeInfoSchema = z.object({
  distanceKm: z.number().positive().max(25000),
  durationMinutes: z.number().positive().max(100000).optional(),
  route: z.string().trim().max(200).optional(),
  source: z.enum(["TRUSTED_INTERNAL", "CLIENT_PROVIDED"]).optional(),
});

export const pricingInputSchema = z.object({
  pickup: locationSchema,
  destination: locationSchema,
  cargo: z.array(cargoSchema).min(1).max(100),
  vehicleType: z.enum(vehicleTypes),
  handlingRequirements: z.object({
    loadingAssistance: z.boolean().optional(),
    unloadingAssistance: z.boolean().optional(),
    fragile: z.boolean().optional(),
    specialEquipmentRequired: z.boolean().optional(),
    specialInstructions: z.string().trim().max(1000).optional(),
  }).optional(),
  routeInfo: routeInfoSchema.optional(),
}).strict();
