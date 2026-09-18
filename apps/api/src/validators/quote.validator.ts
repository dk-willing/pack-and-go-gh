import { z } from "zod";
import { QUOTE_STATUSES } from "../utils/quoteStatus";

export const createQuoteSchema = z.object({
  deliveryRequestId: z.string().trim().min(1),
  title: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  customerNotes: z.string().trim().max(2000).optional(),
  internalNotes: z.string().trim().max(2000).optional(),
});

export const quoteDecisionSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const quoteStatusSchema = z.object({
  status: z.enum(QUOTE_STATUSES),
});
