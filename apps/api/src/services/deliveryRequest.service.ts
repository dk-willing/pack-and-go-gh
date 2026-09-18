import { Sequence } from "../models/Sequence.model";
import { Customer } from "../models/Customer.model";
import { DeliveryRequest, type DeliveryStatus } from "../models/DeliveryRequest.model";
import { ApiError } from "../utils/ApiError";
import { notifyDeliveryStatus } from "./notification.service";

async function notifyStatus(request: { customer: unknown; _id: unknown; requestNumber: string }, status: DeliveryStatus) {
  await notifyDeliveryStatus(request.customer, request._id, status, request.requestNumber);
}

const editableStatuses: DeliveryStatus[] = ["SUBMITTED", "UNDER_REVIEW"];
const transitions: Record<DeliveryStatus, DeliveryStatus[]> = {
  SUBMITTED: ["UNDER_REVIEW", "CANCELLED", "REJECTED"], UNDER_REVIEW: ["QUOTE_PENDING", "REJECTED", "CANCELLED"], QUOTE_PENDING: ["QUOTED", "REJECTED"], QUOTED: ["ACCEPTED", "DECLINED", "REJECTED"], ACCEPTED: ["PROCESSING", "CANCELLED"], PROCESSING: ["DISPATCHED"], DISPATCHED: ["ARRIVED"], ARRIVED: ["RECEIVED"], RECEIVED: [], DECLINED: [], REJECTED: [], CANCELLED: [],
};

async function nextRequestNumber() {
  const sequence = await Sequence.findOneAndUpdate({ _id: "delivery-request" }, { $inc: { value: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  return `PGG-REQ-${new Date().getFullYear()}-${String(sequence.value).padStart(6, "0")}`;
}

async function nextTrackingNumber() {
  const sequence = await Sequence.findOneAndUpdate({ _id: "tracking-number" }, { $inc: { value: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  return `PGG-TRK-${new Date().getFullYear()}-${String(sequence.value).padStart(6, "0")}`;
}

async function customerIdForUser(userId: string) {
  const customer = await Customer.findOne({ user: userId });
  if (!customer) throw ApiError.forbidden("A customer profile is required for this action");
  return customer._id;
}

export async function createDeliveryRequest(userId: string, input: Record<string, unknown>) {
  const customerId = await customerIdForUser(userId);
  const request = await DeliveryRequest.create({ ...input, customer: customerId, requestNumber: await nextRequestNumber(), status: "SUBMITTED", statusHistory: [{ status: "SUBMITTED" }] });
  await notifyStatus(request, "SUBMITTED");
  return request;
}

export async function listCustomerRequests(userId: string, page: number, limit: number, status?: DeliveryStatus) {
  const customer = await customerIdForUser(userId);
  const filter = { customer, ...(status ? { status } : {}) };
  const [requests, total] = await Promise.all([DeliveryRequest.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), DeliveryRequest.countDocuments(filter)]);
  return { requests, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getCustomerRequest(userId: string, id: string) {
  const customer = await customerIdForUser(userId);
  const request = await DeliveryRequest.findOne({ _id: id, customer });
  if (!request) throw ApiError.notFound("Delivery request not found");
  return request;
}

export async function updateCustomerRequest(userId: string, id: string, input: Record<string, unknown>) {
  const request = await getCustomerRequest(userId, id);
  if (!editableStatuses.includes(request.status)) throw ApiError.conflict("This delivery request can no longer be edited");
  const allowed = ["pickup", "destination", "pickupContact", "destinationContact", "cargo", "preferredPickupDate", "handlingRequirements", "notes", "attachments"];
  for (const key of Object.keys(input)) if (!allowed.includes(key)) throw ApiError.badRequest(`Field cannot be changed: ${key}`);
  Object.assign(request, input);
  await request.save();
  return request;
}

export async function cancelCustomerRequest(userId: string, id: string) {
  const request = await getCustomerRequest(userId, id);
  if (!editableStatuses.includes(request.status)) throw ApiError.conflict("This delivery request cannot be cancelled at its current stage");
  request.status = "CANCELLED";
  request.statusHistory.push({ status: "CANCELLED" } as never);
  await request.save();
  await notifyStatus(request, "CANCELLED");
  return request;
}

export async function listAdminRequests(page: number, limit: number, status?: DeliveryStatus, search?: string) {
  const filter = { ...(status ? { status } : {}), ...(search ? { requestNumber: { $regex: search, $options: "i" } } : {}) };
  const [requests, total] = await Promise.all([DeliveryRequest.find(filter).populate("customer").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), DeliveryRequest.countDocuments(filter)]);
  return { requests, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function updateRequestStatus(id: string, status: DeliveryStatus, userId: string) {
  const request = await DeliveryRequest.findById(id);
  if (!request) throw ApiError.notFound("Delivery request not found");
  if (!transitions[request.status].includes(status)) throw ApiError.conflict(`Cannot move request from ${request.status} to ${status}`);
  request.status = status;
  request.statusHistory.push({ status, changedBy: userId } as never);
  await request.save();
  await notifyStatus(request, status);
  return request;
}

export async function getAdminRequest(id: string) {
  const request = await DeliveryRequest.findById(id).populate("customer");
  if (!request) throw ApiError.notFound("Delivery request not found");
  return request;
}

export async function decideQuote(userId: string, id: string, accepted: boolean) {
  const request = await getCustomerRequest(userId, id);
  if (request.status !== "QUOTED" || !request.quote) throw ApiError.conflict("This request does not have an active quote");
  request.quote.decisionAt = new Date();
  request.status = accepted ? "ACCEPTED" : "DECLINED";
  request.statusHistory.push({ status: request.status } as never);
  await request.save();
  await notifyStatus(request, request.status);
  return request;
}

export async function createQuote(id: string, input: { amount: number; currency: string; notes?: string }, userId: string) {
  const request = await DeliveryRequest.findById(id);
  if (!request) throw ApiError.notFound("Delivery request not found");
  if (!["SUBMITTED", "UNDER_REVIEW", "QUOTE_PENDING"].includes(request.status)) throw ApiError.conflict("This request is not ready for a quote");
  request.quote = { ...input, quotedAt: new Date(), quotedBy: userId } as never;
  request.status = "QUOTED";
  request.statusHistory.push({ status: "QUOTED", changedBy: userId } as never);
  await request.save();
  await notifyStatus(request, "QUOTED");
  return request;
}

export async function processRequest(id: string, estimatedDeliveryDate: Date, rider: { name: string; phone: string; vehicle: string; registrationNumber: string }, userId: string) {
  const request = await DeliveryRequest.findById(id);
  if (!request) throw ApiError.notFound("Delivery request not found");
  if (request.status !== "ACCEPTED") throw ApiError.conflict("Customer must accept the quote before processing");
  request.estimatedDeliveryDate = estimatedDeliveryDate;
  request.rider = rider as never;
  request.status = "PROCESSING";
  request.statusHistory.push({ status: "PROCESSING", changedBy: userId } as never);
  await request.save();
  await notifyStatus(request, "PROCESSING");
  return request;
}

export async function dispatchRequest(id: string, trackingNumber: string | undefined, userId: string) {
  const request = await DeliveryRequest.findById(id);
  if (!request) throw ApiError.notFound("Delivery request not found");
  if (request.status !== "PROCESSING" || !request.estimatedDeliveryDate || !request.rider) throw ApiError.conflict("Request must be processed with delivery details first");
  request.trackingNumber = trackingNumber || await nextTrackingNumber();
  request.dispatchedAt = new Date();
  request.status = "DISPATCHED";
  request.statusHistory.push({ status: "DISPATCHED", changedBy: userId } as never);
  await request.save();
  await notifyStatus(request, "DISPATCHED");
  return request;
}

export async function getTrackingRequest(userId: string, trackingNumber: string) {
  const customer = await customerIdForUser(userId);
  const identifier = trackingNumber.trim();
  const request = await DeliveryRequest.findOne({
    customer,
    $or: [{ trackingNumber: identifier }, { requestNumber: identifier }],
  });
  if (!request) throw ApiError.notFound("Tracking number not found");
  return request;
}