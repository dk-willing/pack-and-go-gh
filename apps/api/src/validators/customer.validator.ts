import { z } from "zod";

const phone = z.string().trim().min(7).max(30);
export const profileSchema = z.object({ phone: phone.optional(), alternatePhone: phone.optional(), companyName: z.string().trim().max(150).optional() });
export const locationSchema = z.object({
  label: z.string().trim().min(1).max(50), country: z.string().trim().min(2).max(80), region: z.string().trim().min(2).max(80), city: z.string().trim().min(2).max(100), address: z.string().trim().min(3).max(250),
  latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional(), instructions: z.string().trim().max(500).optional(), contactName: z.string().trim().max(100).optional(), contactPhone: phone.optional(),
});