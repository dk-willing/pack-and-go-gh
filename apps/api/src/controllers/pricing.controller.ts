import type { Request } from "express";
import { UserRole } from "@pack-and-go/types";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { calculateFromDeliveryRequest, calculatePrice, getPricingConfiguration } from "../services/pricing.service";
import { pricingInputSchema } from "../validators/pricing.validator";

function parse<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } }, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw ApiError.badRequest("Validation failed", result.error.flatten().fieldErrors);
  return result.data;
}

function userId(req: Request) {
  if (!req.auth) throw ApiError.unauthorized("Authentication required");
  return req.auth.id;
}

export const pricingRoles = [UserRole.CUSTOMER, UserRole.BUSINESS_CUSTOMER, UserRole.DISPATCHER, UserRole.OPERATIONS_MANAGER, UserRole.FINANCE, UserRole.ADMIN, UserRole.SUPER_ADMIN];

export const calculate = asyncHandler(async (req, res) => {
  const input = parse(pricingInputSchema, req.body);
  const result = calculatePrice(input);

  sendSuccess(res, 200, "Price calculated successfully", { pricing: result, estimate: true, calculatedBy: userId(req) });
});

export const calculateFromRequest = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  const input = parse(pricingInputSchema, req.body);
  const request = {
    ...input,
    vehicleType: input.vehicleType,
  };

  const result = calculateFromDeliveryRequest(request);
  sendSuccess(res, 200, "Price calculated successfully", { pricing: result, estimate: true, deliveryRequestId: requestId, calculatedBy: userId(req) });
});

export const configuration = asyncHandler(async (_req, res) => {
  sendSuccess(res, 200, "Pricing configuration retrieved successfully", { config: getPricingConfiguration() });
});
