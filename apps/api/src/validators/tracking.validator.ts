import { z } from "zod";

export const trackingEventSchema = z.object({
  status: z.enum([
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
  ]),
  location: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    address: z.string().trim().max(250).optional(),
    city: z.string().trim().max(100).optional(),
    region: z.string().trim().max(80).optional(),
    country: z.string().trim().max(80).optional(),
  }).optional(),
  description: z.string().trim().max(500).optional(),
  source: z.enum(["SYSTEM", "STAFF", "DRIVER", "GPS"]).default("SYSTEM"),
  visibility: z.enum(["CUSTOMER", "INTERNAL"]).default("CUSTOMER"),
});
