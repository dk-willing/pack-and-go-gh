import { Request } from "express";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { createLocation, deleteLocation, getCustomerProfile, listCustomers, listLocations, updateCustomerProfile, updateLocation } from "../services/customer.service";
import { locationSchema, profileSchema } from "../validators/customer.validator";

function parse<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } }, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw ApiError.badRequest("Validation failed", result.error.flatten().fieldErrors); return result.data; }
function userId(req: Request) { if (!req.auth) throw ApiError.unauthorized("Authentication required"); return req.auth.id; }

export const getMe = asyncHandler(async (req, res) => sendSuccess(res, 200, "Customer profile retrieved successfully", await getCustomerProfile(userId(req))));
export const updateMe = asyncHandler(async (req, res) => sendSuccess(res, 200, "Customer profile updated successfully", await updateCustomerProfile(userId(req), parse(profileSchema, req.body))));
export const getLocations = asyncHandler(async (req, res) => sendSuccess(res, 200, "Saved locations retrieved successfully", { locations: await listLocations(userId(req)) }));
export const postLocation = asyncHandler(async (req, res) => sendSuccess(res, 201, "Saved location created successfully", { location: await createLocation(userId(req), parse(locationSchema, req.body)) }));
export const patchLocation = asyncHandler(async (req, res) => sendSuccess(res, 200, "Saved location updated successfully", { location: await updateLocation(userId(req), req.params.locationId, parse(locationSchema.partial(), req.body)) }));
export const removeLocation = asyncHandler(async (req, res) => { await deleteLocation(userId(req), req.params.locationId); sendSuccess(res, 200, "Saved location deleted successfully", {}); });
export const adminList = asyncHandler(async (req, res) => { const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20)); sendSuccess(res, 200, "Customers retrieved successfully", await listCustomers(page, limit, typeof req.query.search === "string" ? req.query.search : undefined)); });