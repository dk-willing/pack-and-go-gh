import { Request } from "express";
import { UserRole } from "@pack-and-go/types";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { cancelCustomerRequest, createDeliveryRequest, createQuote, decideQuote, dispatchRequest, getAdminRequest, getCustomerRequest, getTrackingRequest, listAdminRequests, listCustomerRequests, processRequest, updateCustomerRequest, updateRequestStatus } from "../services/deliveryRequest.service";
import { deliveryRequestSchema, deliveryStatusSchema, dispatchSchema, processSchema, quoteSchema, updateDeliveryRequestSchema } from "../validators/deliveryRequest.validator";

function parse<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } }, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw ApiError.badRequest("Validation failed", result.error.flatten().fieldErrors); return result.data; }
function userId(req: Request) { if (!req.auth) throw ApiError.unauthorized("Authentication required"); return req.auth.id; }
const staff = [UserRole.DISPATCHER, UserRole.OPERATIONS_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN];

export const create = asyncHandler(async (req, res) => sendSuccess(res, 201, "Delivery request created successfully", { request: await createDeliveryRequest(userId(req), parse(deliveryRequestSchema, req.body)) }));
export const listMine = asyncHandler(async (req, res) => { const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20)); sendSuccess(res, 200, "Delivery requests retrieved successfully", await listCustomerRequests(userId(req), page, limit, typeof req.query.status === "string" ? req.query.status as never : undefined)); });
export const getMine = asyncHandler(async (req, res) => sendSuccess(res, 200, "Delivery request retrieved successfully", { request: await getCustomerRequest(userId(req), req.params.id) }));
export const decide = asyncHandler(async (req, res) => { const accepted = req.body.accepted === true; sendSuccess(res, 200, accepted ? "Quote accepted successfully" : "Quote declined successfully", { request: await decideQuote(userId(req), req.params.id, accepted) }); });
export const track = asyncHandler(async (req, res) => sendSuccess(res, 200, "Tracking information retrieved successfully", { request: await getTrackingRequest(userId(req), req.params.trackingNumber) }));
export const patchMine = asyncHandler(async (req, res) => sendSuccess(res, 200, "Delivery request updated successfully", { request: await updateCustomerRequest(userId(req), req.params.id, parse(updateDeliveryRequestSchema, req.body)) }));
export const cancel = asyncHandler(async (req, res) => sendSuccess(res, 200, "Delivery request cancelled successfully", { request: await cancelCustomerRequest(userId(req), req.params.id) }));
export const adminList = asyncHandler(async (req, res) => { const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20)); sendSuccess(res, 200, "Delivery requests retrieved successfully", await listAdminRequests(page, limit, typeof req.query.status === "string" ? req.query.status as never : undefined, typeof req.query.search === "string" ? req.query.search : undefined)); });
export const adminGet = asyncHandler(async (req, res) => sendSuccess(res, 200, "Delivery request retrieved successfully", { request: await getAdminRequest(req.params.id) }));
export const adminQuote = asyncHandler(async (req, res) => sendSuccess(res, 200, "Quote created successfully", { request: await createQuote(req.params.id, parse(quoteSchema, req.body), userId(req)) }));
export const adminProcess = asyncHandler(async (req, res) => { const input = parse(processSchema, req.body); sendSuccess(res, 200, "Shipment processing started successfully", { request: await processRequest(req.params.id, input.estimatedDeliveryDate, input.rider, userId(req)) }); });
export const adminDispatch = asyncHandler(async (req, res) => { const input = parse(dispatchSchema, req.body); sendSuccess(res, 200, "Shipment dispatched successfully", { request: await dispatchRequest(req.params.id, input.trackingNumber, userId(req)) }); });
export const adminStatus = asyncHandler(async (req, res) => { const input = parse(deliveryStatusSchema, req.body); sendSuccess(res, 200, "Delivery request status updated successfully", { request: await updateRequestStatus(req.params.id, input.status, userId(req)) }); });
export { staff };