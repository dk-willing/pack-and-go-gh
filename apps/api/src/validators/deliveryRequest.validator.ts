import { z } from "zod";
import { CARGO_CATEGORIES } from "../models/DeliveryRequest.model";
import { DELIVERY_STATUSES } from "../models/DeliveryRequest.model";

const location = z.object({ country: z.string().trim().min(2).max(80), region: z.string().trim().min(2).max(80), city: z.string().trim().min(2).max(100), address: z.string().trim().min(3).max(250), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(), locationNotes: z.string().trim().max(500).optional() });
const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().email().max(254).optional(),
);
const contact = z.object({ name: z.string().trim().min(2).max(100), phone: z.string().trim().min(7).max(30), email: optionalEmail });
const cargo = z.object({ category: z.enum(CARGO_CATEGORIES), description: z.string().trim().min(2).max(500), quantity: z.number().int().min(1).max(100000), weight: z.object({ value: z.number().positive(), unit: z.enum(["kg", "g", "ton"]) }).optional(), dimensions: z.object({ length: z.number().positive(), width: z.number().positive(), height: z.number().positive(), unit: z.enum(["cm", "m", "ft"]) }).optional(), declaredValue: z.object({ value: z.number().nonnegative(), currency: z.string().length(3).default("GHS") }).optional() });
const deliveryRequestFields = { pickup: location, destination: location, pickupContact: contact, destinationContact: contact, cargo: z.array(cargo).min(1).max(100), preferredPickupDate: z.coerce.date(), handlingRequirements: z.object({ loadingAssistance: z.boolean().optional(), unloadingAssistance: z.boolean().optional(), fragile: z.boolean().optional(), specialEquipmentRequired: z.boolean().optional(), specialInstructions: z.string().trim().max(1000).optional() }).optional(), notes: z.string().trim().max(2000).optional(), attachments: z.array(z.object({ name: z.string().max(200), storageKey: z.string().max(500), contentType: z.string().max(100), size: z.number().max(10 * 1024 * 1024) })).max(5).optional() };
const deliveryRequestRules = (value: z.infer<z.ZodObject<typeof deliveryRequestFields>>, ctx: z.RefinementCtx) => {
  if (value.preferredPickupDate <= new Date()) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["preferredPickupDate"], message: "Preferred pickup date must be in the future" });
  value.cargo.forEach((item, index) => {
    if (["HEAVY", "OVERSIZED"].includes(item.category) && !item.weight) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cargo", index, "weight"], message: "Weight is required for heavy or oversized cargo" });
    if (item.category === "OVERSIZED" && !item.dimensions) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cargo", index, "dimensions"], message: "Dimensions are required for oversized cargo" });
    if (item.category === "SPECIAL_HANDLING" && !value.handlingRequirements?.specialInstructions) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["handlingRequirements", "specialInstructions"], message: "Special handling instructions are required" });
  });
};
export const deliveryRequestSchema = z.object(deliveryRequestFields).superRefine(deliveryRequestRules);
export const updateDeliveryRequestSchema = z.object(deliveryRequestFields).partial();
export const deliveryStatusSchema = z.object({ status: z.enum(DELIVERY_STATUSES) });
export const quoteSchema = z.object({ amount: z.number().nonnegative(), currency: z.string().length(3).default("GHS"), notes: z.string().trim().max(1000).optional() });
export const processSchema = z.object({ estimatedDeliveryDate: z.coerce.date(), rider: z.object({ name: z.string().trim().min(2).max(100), phone: z.string().trim().min(7).max(30), vehicle: z.string().trim().min(2).max(100), registrationNumber: z.string().trim().min(2).max(30) }) }).refine((value) => value.estimatedDeliveryDate > new Date(), { path: ["estimatedDeliveryDate"], message: "Estimated delivery date must be in the future" });
export const dispatchSchema = z.object({ trackingNumber: z.string().trim().min(4).max(40).regex(/^[A-Za-z0-9-]+$/).optional() });