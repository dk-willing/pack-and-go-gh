import { Request } from "express";
import { UserRole } from "@pack-and-go/types";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { createQuote, getQuoteForViewer, listQuotesForViewer, recalculateQuote, sendQuote, acceptQuote, rejectQuote, cancelQuote, getCustomerRecordForUser } from "../services/quote.service";
import { createQuoteSchema, quoteDecisionSchema } from "../validators/quote.validator";

function parse<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } }, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw ApiError.badRequest("Validation failed", result.error.flatten().fieldErrors); return result.data; }
function userId(req: Request) { if (!req.auth) throw ApiError.unauthorized("Authentication required"); return req.auth.id; }
function viewerCustomerId(req: Request) {
  if (!req.auth) return null;
  return req.auth.role === UserRole.CUSTOMER || req.auth.role === UserRole.BUSINESS_CUSTOMER ? req.auth.id : null;
}
const staff = [UserRole.DISPATCHER, UserRole.OPERATIONS_MANAGER, UserRole.FINANCE, UserRole.ADMIN, UserRole.SUPER_ADMIN];

export const create = asyncHandler(async (req, res) => {
  const payload = parse(createQuoteSchema, req.body);
  sendSuccess(res, 201, "Quote created successfully", { quote: await createQuote(userId(req), payload) });
});

export const list = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const status = typeof req.query.status === "string" ? req.query.status as never : undefined;
  const customerId = typeof req.query.customerId === "string" ? req.query.customerId : undefined;
  const deliveryRequestId = typeof req.query.deliveryRequestId === "string" ? req.query.deliveryRequestId : undefined;
  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const role = req.auth?.role ?? UserRole.CUSTOMER;
  const customer = req.auth && (req.auth.role === UserRole.CUSTOMER || req.auth.role === UserRole.BUSINESS_CUSTOMER) ? await getCustomerRecordForUser(req.auth.id) : null;
  sendSuccess(res, 200, "Quotes retrieved successfully", await listQuotesForViewer(role, customer ? customer._id.toString() : null, { page, limit, status, customerId, deliveryRequestId, search }));
});

export const getById = asyncHandler(async (req, res) => {
  const role = req.auth?.role ?? UserRole.CUSTOMER;
  const customer = req.auth && (req.auth.role === UserRole.CUSTOMER || req.auth.role === UserRole.BUSINESS_CUSTOMER) ? await getCustomerRecordForUser(req.auth.id) : null;
  sendSuccess(res, 200, "Quote retrieved successfully", { quote: await getQuoteForViewer(role, customer ? customer._id.toString() : null, req.params.quoteId) });
});

export const recalculate = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Quote recalculated successfully", { quote: await recalculateQuote(userId(req), req.params.quoteId) });
});

export const send = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Quote sent successfully", { quote: await sendQuote(req.params.quoteId) });
});

export const accept = asyncHandler(async (req, res) => {
  const payload = parse(quoteDecisionSchema, req.body);
  sendSuccess(res, 200, "Quote accepted successfully", { quote: await acceptQuote(userId(req), req.params.quoteId, payload.reason) });
});

export const reject = asyncHandler(async (req, res) => {
  const payload = parse(quoteDecisionSchema, req.body);
  sendSuccess(res, 200, "Quote rejected successfully", { quote: await rejectQuote(userId(req), req.params.quoteId, payload.reason) });
});

export const cancel = asyncHandler(async (req, res) => {
  const payload = parse(quoteDecisionSchema, req.body);
  sendSuccess(res, 200, "Quote cancelled successfully", { quote: await cancelQuote(userId(req), req.params.quoteId, payload.reason) });
});

export const myQuotes = asyncHandler(async (req, res) => {
  const customer = await getCustomerRecordForUser(userId(req));
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  sendSuccess(res, 200, "Your quotes retrieved successfully", await listQuotesForViewer(UserRole.CUSTOMER, customer._id.toString(), { page, limit }));
});
