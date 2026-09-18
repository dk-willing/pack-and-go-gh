import { Types } from "mongoose";
import { Customer } from "../models/Customer.model";
import { DeliveryRequest } from "../models/DeliveryRequest.model";
import { Notification } from "../models/Notification.model";
import { Quote, type QuoteDocument } from "../models/Quote.model";
import { Sequence } from "../models/Sequence.model";
import { ApiError } from "../utils/ApiError";
import { QUOTE_STATUSES, type QuoteStatus, canTransitionQuoteStatus, isQuoteEditable } from "../utils/quoteStatus";

const CUSTOMERS = ["CUSTOMER", "BUSINESS_CUSTOMER"] as const;

function isCustomerRole(role: string) {
  return (CUSTOMERS as readonly string[]).includes(role);
}

async function nextQuoteNumber() {
  const sequence = await Sequence.findOneAndUpdate(
    { _id: "quote" },
    { $inc: { value: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return `PGG-QUO-${new Date().getFullYear()}-${String(sequence.value).padStart(6, "0")}`;
}

function calculateLineItemCost(request: { cargo: Array<{ quantity?: number; category?: string; weight?: { value?: number; unit?: string }; declaredValue?: { value?: number } }> }) {
  return request.cargo.reduce((total, item) => {
    const quantity = Number(item.quantity ?? 1);
    const weightValue = Number(item.weight?.value ?? 0);
    const declaredValue = Number(item.declaredValue?.value ?? 0);
    const categoryFactor = item.category === "HEAVY" ? 2.5 : item.category === "OVERSIZED" ? 3 : item.category === "SPECIAL_HANDLING" ? 2 : 1;
    return total + quantity * (50 + weightValue * 0.35 + declaredValue * 0.01) * categoryFactor;
  }, 0);
}

function calculateQuoteSnapshot(request: any) {
  const subtotal = calculateLineItemCost(request);
  const routeFactor = Math.max(1, Math.abs((Number(request.pickup?.latitude ?? 0) - Number(request.destination?.latitude ?? 0)) * 120));
  const serviceFee = 50 + (request.handlingRequirements?.specialEquipmentRequired ? 120 : 0) + (request.handlingRequirements?.fragile ? 85 : 0);
  const base = subtotal + serviceFee + routeFactor;
  const discounts = Math.min(base * 0.08, 1200);
  const taxes = base * 0.05;
  const additionalCharges = request.handlingRequirements?.loadingAssistance || request.handlingRequirements?.unloadingAssistance ? 90 : 0;
  const total = Math.max(0, base - discounts + taxes + additionalCharges);

  return {
    pricingVersion: "v1",
    calculatedAt: new Date(),
    route: {
      pickup: request.pickup,
      destination: request.destination,
      preferredPickupDate: request.preferredPickupDate,
    },
    cargo: request.cargo,
    vehicle: {
      category: request.cargo?.[0]?.category ?? "STANDARD",
      requirements: request.handlingRequirements ?? {},
    },
    services: {
      loadingAssistance: !!request.handlingRequirements?.loadingAssistance,
      unloadingAssistance: !!request.handlingRequirements?.unloadingAssistance,
      fragile: !!request.handlingRequirements?.fragile,
      specialEquipmentRequired: !!request.handlingRequirements?.specialEquipmentRequired,
    },
    breakdown: {
      subtotal: Number(base.toFixed(2)),
      discounts: Number(discounts.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      additionalCharges: Number(additionalCharges.toFixed(2)),
      total: Number(total.toFixed(2)),
    },
    subtotal: Number(base.toFixed(2)),
    discounts: Number(discounts.toFixed(2)),
    taxes: Number(taxes.toFixed(2)),
    additionalCharges: Number(additionalCharges.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

export async function getCustomerRecordForUser(userId: string) {
  const customer = await Customer.findOne({ user: userId });
  if (!customer) throw ApiError.forbidden("A customer profile is required for this action");
  return customer;
}

export async function listQuotesForViewer(viewerRole: string, viewerCustomerId: string | null, params: { page?: number; limit?: number; status?: QuoteStatus; customerId?: string; deliveryRequestId?: string; search?: string; }) {
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(params.limit ?? 20)));
  const filter: Record<string, unknown> = {};

  if (params.status) filter.status = params.status;
  if (params.customerId) filter.customer = params.customerId;
  if (params.deliveryRequestId) filter.deliveryRequest = params.deliveryRequestId;
  if (params.search) {
    filter.$or = [
      { quoteNumber: { $regex: params.search, $options: "i" } },
      { title: { $regex: params.search, $options: "i" } },
    ];
  }

  if (isCustomerRole(viewerRole) && viewerCustomerId) {
    filter.customer = viewerCustomerId;
  }

  const [quotes, total] = await Promise.all([
    Quote.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Quote.countDocuments(filter),
  ]);

  return {
    quotes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function createQuote(userId: string, input: { deliveryRequestId: string; title?: string; description?: string; customerNotes?: string; internalNotes?: string }) {
  const request = await DeliveryRequest.findById(input.deliveryRequestId);
  if (!request) throw ApiError.notFound("Delivery request not found");

  if (request.status === "ACCEPTED" || request.status === "PROCESSING" || request.status === "DISPATCHED" || request.status === "ARRIVED" || request.status === "RECEIVED") {
    throw ApiError.conflict("This delivery request is not eligible for a new quotation");
  }

  const existingQuote = await Quote.findOne({ deliveryRequest: request._id, status: { $in: ["DRAFT", "PENDING_APPROVAL", "SENT", "VIEWED", "REJECTED"] } }).lean();
  if (existingQuote) {
    throw ApiError.conflict("A quotation already exists for this delivery request");
  }

  const customer = await Customer.findById(request.customer);
  if (!customer) throw ApiError.notFound("Customer record not found");

  const quote = await Quote.create({
    quoteNumber: await nextQuoteNumber(),
    deliveryRequest: request._id,
    customer: customer._id,
    currency: "GHS",
    pricingSnapshot: calculateQuoteSnapshot(request.toObject()),
    title: input.title ?? `Quote for ${request.requestNumber}`,
    description: input.description,
    customerNotes: input.customerNotes,
    internalNotes: input.internalNotes,
    status: "DRAFT",
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: new Types.ObjectId(userId),
  });

  request.status = request.status === "SUBMITTED" || request.status === "UNDER_REVIEW" ? "QUOTE_PENDING" : request.status;
  request.statusHistory.push({ status: request.status, changedBy: userId, changedAt: new Date() } as never);
  await request.save();

  await Notification.create({
    customer: customer._id,
    deliveryRequest: request._id,
    type: "QUOTE_STATUS_CHANGED",
    status: "DRAFT",
    title: "Quote created",
    message: `A draft quotation ${quote.quoteNumber} was created for your delivery request ${request.requestNumber}.`,
  });

  return quote.toObject();
}

export async function getQuoteForViewer(viewerRole: string, viewerCustomerId: string | null, quoteId: string) {
  const quote = await Quote.findById(quoteId).lean();
  if (!quote) throw ApiError.notFound("Quote not found");

  if (isCustomerRole(viewerRole) && viewerCustomerId) {
    const customerId = quote.customer.toString();
    if (customerId !== viewerCustomerId) {
      throw ApiError.forbidden("You do not have access to this quote");
    }
  }

  return quote;
}

export async function recalculateQuote(userId: string, quoteId: string) {
  const quote = await Quote.findById(quoteId);
  if (!quote) throw ApiError.notFound("Quote not found");
  if (!isQuoteEditable(quote.status)) throw ApiError.conflict("This quote can no longer be recalculated");

  const request = await DeliveryRequest.findById(quote.deliveryRequest);
  if (!request) throw ApiError.notFound("Delivery request not found");

  quote.pricingSnapshot = calculateQuoteSnapshot(request.toObject());
  quote.updatedAt = new Date();
  quote.internalNotes = `${quote.internalNotes ?? ""}\nRecalculated by ${userId}`.trim();
  await quote.save();

  return quote.toObject();
}

export async function sendQuote(quoteId: string) {
  const quote = await Quote.findById(quoteId);
  if (!quote) throw ApiError.notFound("Quote not found");
  if (!isQuoteEditable(quote.status) && quote.status !== "PENDING_APPROVAL") throw ApiError.conflict("This quote cannot be sent");
  if (new Date(quote.validUntil) <= new Date()) throw ApiError.conflict("This quote has expired");

  quote.status = "SENT";
  quote.sentAt = new Date();
  quote.validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await quote.save();

  await Notification.create({
    customer: quote.customer,
    deliveryRequest: quote.deliveryRequest,
    type: "QUOTE_STATUS_CHANGED",
    status: "SENT",
    title: "Quote sent",
    message: `Your quote ${quote.quoteNumber} is ready to review.`,
  });

  return quote.toObject();
}

export async function acceptQuote(customerUserId: string, quoteId: string, reason?: string) {
  const customer = await getCustomerRecordForUser(customerUserId);
  const quote = await Quote.findById(quoteId);
  if (!quote) throw ApiError.notFound("Quote not found");
  if (quote.customer.toString() !== customer._id.toString()) throw ApiError.forbidden("You do not have access to this quote");
  if (!canTransitionQuoteStatus(quote.status, "ACCEPTED")) throw ApiError.conflict("This quote cannot be accepted");
  if (new Date(quote.validUntil) <= new Date()) throw ApiError.conflict("This quote has expired");

  quote.status = "ACCEPTED";
  quote.acceptedAt = new Date();
  (quote as any).acceptedBy = new Types.ObjectId(customer._id.toString());
  quote.customerNotes = reason ? `${quote.customerNotes ?? ""} ${reason}`.trim() : quote.customerNotes;
  await quote.save();

  await Notification.create({
    customer: customer._id,
    deliveryRequest: quote.deliveryRequest,
    type: "QUOTE_STATUS_CHANGED",
    status: "ACCEPTED",
    title: "Quote accepted",
    message: `Quote ${quote.quoteNumber} was accepted.`,
  });

  return quote.toObject();
}

export async function rejectQuote(customerUserId: string, quoteId: string, reason?: string) {
  const customer = await getCustomerRecordForUser(customerUserId);
  const quote = await Quote.findById(quoteId);
  if (!quote) throw ApiError.notFound("Quote not found");
  if (quote.customer.toString() !== customer._id.toString()) throw ApiError.forbidden("You do not have access to this quote");
  if (!canTransitionQuoteStatus(quote.status, "REJECTED")) throw ApiError.conflict("This quote cannot be rejected");

  quote.status = "REJECTED";
  quote.rejectedAt = new Date();
  (quote as any).rejectedBy = new Types.ObjectId(customer._id.toString());
  quote.rejectionReason = reason ?? "No reason provided";
  await quote.save();

  await Notification.create({
    customer: customer._id,
    deliveryRequest: quote.deliveryRequest,
    type: "QUOTE_STATUS_CHANGED",
    status: "REJECTED",
    title: "Quote rejected",
    message: `Quote ${quote.quoteNumber} was rejected.`,
  });

  return quote.toObject();
}

export async function cancelQuote(staffUserId: string, quoteId: string, reason?: string) {
  const quote = await Quote.findById(quoteId);
  if (!quote) throw ApiError.notFound("Quote not found");
  if (quote.status === "ACCEPTED" || quote.status === "REJECTED" || quote.status === "CANCELLED" || quote.status === "EXPIRED") {
    throw ApiError.conflict("This quote cannot be cancelled");
  }

  quote.status = "CANCELLED";
  quote.cancelledAt = new Date();
  (quote as any).cancelledBy = new Types.ObjectId(staffUserId);
  quote.cancellationReason = reason ?? "Cancelled by staff";
  await quote.save();

  await Notification.create({
    customer: quote.customer,
    deliveryRequest: quote.deliveryRequest,
    type: "QUOTE_STATUS_CHANGED",
    status: "CANCELLED",
    title: "Quote cancelled",
    message: `Quote ${quote.quoteNumber} was cancelled.`,
  });

  return quote.toObject();
}

export function normalizeQuoteStatus(status: string): QuoteStatus {
  if (QUOTE_STATUSES.includes(status as QuoteStatus)) return status as QuoteStatus;
  return "DRAFT";
}
