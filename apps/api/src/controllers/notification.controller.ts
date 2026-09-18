import { Request } from "express";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getOrCreateCustomer } from "../services/customer.service";
import { listCustomerNotifications, markNotificationRead, unreadNotificationCount } from "../services/notification.service";

async function customerId(req: Request) {
  if (!req.auth) throw ApiError.unauthorized("Authentication required");
  const customer = await getOrCreateCustomer(req.auth.id);
  return customer._id;
}

export const list = asyncHandler(async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const id = await customerId(req);
  const [notifications, unreadCount] = await Promise.all([listCustomerNotifications(id, limit), unreadNotificationCount(id)]);
  sendSuccess(res, 200, "Notifications retrieved successfully", { notifications, unreadCount });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(await customerId(req), req.params.id);
  if (!notification) throw ApiError.notFound("Notification not found");
  sendSuccess(res, 200, "Notification marked as read", { notification });
});