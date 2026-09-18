import type { ApiResponse, UserRole } from "@pack-and-go/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiRequestError extends Error {
  public readonly statusCode: number;
  public readonly errors?: Record<string, string[]> | null;

  constructor(statusCode: number, message: string, errors?: Record<string, string[]> | null) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/**
 * The one place raw fetch() calls to the backend are made. Every frontend
 * "resource" client (authApi, deliveryRequestApi, ...) should be built on
 * top of this function rather than calling fetch directly from components.
 */
async function request<T>(path: string, options: RequestOptions = {}, canRefresh = true): Promise<T> {
  const { body, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (
    response.status === 401 &&
    canRefresh &&
    !path.startsWith("/auth/")
  ) {
    if (await refreshAccessToken()) {
      return request(path, options, false);
    }
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload || payload.success === false) {
    const message = payload && "message" in payload ? payload.message : "Request failed";
    const errors = payload && "errors" in payload ? payload.errors : null;
    throw new ApiRequestError(response.status, message, errors);
  }

  return payload.data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

/**
 * Example resource client — establishes the pattern for
 * deliveryRequestApi, quoteApi, bookingApi, etc. as those features land.
 */
export const healthApi = {
  check: () => apiClient.get<{ status: string; timestamp: string }>("/health"),
};

export interface PlatformStats {
  regionsCovered: number;
  shipmentsCompleted: number;
  onTimeDeliveryRate: number | null;
  trackingAvailable: boolean;
}

export const statsApi = {
  get: () => apiClient.get<PlatformStats>("/stats"),
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
}

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    apiClient.post<{ user: AuthUser }>("/auth/register", input),
  createAdmin: (input: { name: string; email: string; password: string }) =>
    apiClient.post<{ user: AuthUser }>("/auth/admin-users", input),
  login: (input: { email: string; password: string }) =>
    apiClient.post<{ user: AuthUser }>("/auth/login", input),
  logout: () => apiClient.post<{}>("/auth/logout"),
  me: () => apiClient.get<{ user: AuthUser }>("/auth/me"),
  refresh: () => apiClient.post<{ user: AuthUser }>("/auth/refresh"),
};

export type DeliveryStatus = "SUBMITTED" | "UNDER_REVIEW" | "QUOTE_PENDING" | "QUOTED" | "ACCEPTED" | "PROCESSING" | "DISPATCHED" | "ARRIVED" | "RECEIVED" | "DECLINED" | "REJECTED" | "CANCELLED";
export type CargoCategory = "STANDARD" | "BULK" | "HEAVY" | "OVERSIZED" | "SPECIAL_HANDLING";
export interface SavedLocation { _id: string; label: string; country: string; region: string; city: string; address: string; latitude?: number; longitude?: number; instructions?: string; contactName?: string; contactPhone?: string; }
export interface CustomerProfile { user: AuthUser; customer: { _id: string; phone?: string; alternatePhone?: string; companyName?: string; savedLocations: SavedLocation[] } }
export interface LocationInput { country: string; region: string; city: string; address: string; latitude?: number; longitude?: number; locationNotes?: string }
export interface ContactInput { name: string; phone: string; email?: string }
export interface CargoInput { category: CargoCategory; description: string; quantity: number; weight?: { value: number; unit: "kg" | "g" | "ton" }; dimensions?: { length: number; width: number; height: number; unit: "cm" | "m" | "ft" }; declaredValue?: { value: number; currency: string } }
export interface HandlingInput { loadingAssistance?: boolean; unloadingAssistance?: boolean; fragile?: boolean; specialEquipmentRequired?: boolean; specialInstructions?: string }
export interface DeliveryRequest { _id: string; requestNumber: string; status: DeliveryStatus; pickup: LocationInput; destination: LocationInput; pickupContact: ContactInput; destinationContact: ContactInput; cargo: CargoInput[]; preferredPickupDate: string; handlingRequirements?: HandlingInput; notes?: string; quote?: { amount: number; currency: string; notes?: string; quotedAt: string; decisionAt?: string }; estimatedDeliveryDate?: string; rider?: { name: string; phone: string; vehicle: string; registrationNumber: string }; trackingNumber?: string; dispatchedAt?: string; createdAt: string; updatedAt: string }
export interface AdminDeliveryRequest extends DeliveryRequest { customer?: { user?: { name?: string; email?: string } } }
export interface CustomerNotification { _id: string; deliveryRequest: string; type: "DELIVERY_STATUS_CHANGED" | "QUOTE_STATUS_CHANGED"; status: DeliveryStatus | "DRAFT" | "PENDING_APPROVAL" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED"; title: string; message: string; readAt?: string; createdAt: string }

export type QuoteStatus = "DRAFT" | "PENDING_APPROVAL" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CANCELLED";
export interface QuoteBreakdown {
  subtotal: number;
  discounts: number;
  taxes: number;
  additionalCharges: number;
  total: number;
}
export interface QuotePricingSnapshot {
  pricingVersion: string;
  calculatedAt: string;
  route: Record<string, unknown>;
  cargo: Record<string, unknown>[];
  vehicle: Record<string, unknown>;
  services: Record<string, unknown>;
  breakdown: QuoteBreakdown;
  subtotal: number;
  discounts: number;
  taxes: number;
  additionalCharges: number;
  total: number;
}
export interface QuoteRecord {
  _id: string;
  quoteNumber: string;
  deliveryRequest: string;
  customer: string;
  currency: string;
  pricingSnapshot: QuotePricingSnapshot;
  status: QuoteStatus;
  validUntil: string;
  title?: string;
  description?: string;
  customerNotes?: string;
  internalNotes?: string;
  sentAt?: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  rejectionReason?: string;
  cancellationReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export const customerApi = {
  getProfile: () => apiClient.get<CustomerProfile>("/customers/me"),
  updateProfile: (input: { phone?: string; alternatePhone?: string; companyName?: string }) => apiClient.patch<CustomerProfile>("/customers/me", input),
  listLocations: () => apiClient.get<{ locations: SavedLocation[] }>("/customers/me/locations"),
  createLocation: (input: Omit<SavedLocation, "_id">) => apiClient.post<{ location: SavedLocation }>("/customers/me/locations", input),
  updateLocation: (id: string, input: Partial<Omit<SavedLocation, "_id">>) => apiClient.patch<{ location: SavedLocation }>(`/customers/me/locations/${id}`, input),
  deleteLocation: (id: string) => apiClient.delete<{}>(`/customers/me/locations/${id}`),
};

export const notificationApi = {
  list: (limit = 20) => apiClient.get<{ notifications: CustomerNotification[]; unreadCount: number }>(`/notifications?limit=${limit}`),
  markRead: (id: string) => apiClient.patch<{ notification: CustomerNotification }>(`/notifications/${id}/read`, {}),
  delete: (id: string) => apiClient.delete<{ notification: CustomerNotification }>(`/notifications/${id}`),
};

export const quoteApi = {
  create: (input: { deliveryRequestId: string; title?: string; description?: string; customerNotes?: string; internalNotes?: string }) => apiClient.post<{ quote: QuoteRecord }>('/quotes', input),
  list: (params: { page?: number; status?: QuoteStatus; customerId?: string; deliveryRequestId?: string; search?: string } = {}) => {
    const query = new URLSearchParams({ page: String(params.page ?? 1) });
    if (params.status) query.set('status', params.status);
    if (params.customerId) query.set('customerId', params.customerId);
    if (params.deliveryRequestId) query.set('deliveryRequestId', params.deliveryRequestId);
    if (params.search) query.set('search', params.search);
    return apiClient.get<{ quotes: QuoteRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/quotes?${query.toString()}`);
  },
  getById: (id: string) => apiClient.get<{ quote: QuoteRecord }>(`/quotes/${id}`),
  recalculate: (id: string) => apiClient.post<{ quote: QuoteRecord }>(`/quotes/${id}/recalculate`, {}),
  send: (id: string) => apiClient.post<{ quote: QuoteRecord }>(`/quotes/${id}/send`, {}),
  accept: (id: string, reason?: string) => apiClient.post<{ quote: QuoteRecord }>(`/quotes/${id}/accept`, { reason }),
  reject: (id: string, reason?: string) => apiClient.post<{ quote: QuoteRecord }>(`/quotes/${id}/reject`, { reason }),
  cancel: (id: string, reason?: string) => apiClient.post<{ quote: QuoteRecord }>(`/quotes/${id}/cancel`, { reason }),
  mine: (page = 1) => apiClient.get<{ quotes: QuoteRecord[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/customers/me/quotes?page=${page}`),
};

export const deliveryRequestApi = {
  create: (input: Omit<DeliveryRequest, "_id" | "requestNumber" | "status" | "createdAt" | "updatedAt">) => apiClient.post<{ request: DeliveryRequest }>("/delivery-requests", input),
  list: (page = 1) => apiClient.get<{ requests: DeliveryRequest[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/delivery-requests?page=${page}`),
  getById: (id: string) => apiClient.get<{ request: DeliveryRequest }>(`/delivery-requests/${id}`),
  update: (id: string, input: Partial<Omit<DeliveryRequest, "_id" | "requestNumber" | "status" | "createdAt" | "updatedAt">>) => apiClient.patch<{ request: DeliveryRequest }>(`/delivery-requests/${id}`, input),
  cancel: (id: string) => apiClient.post<{ request: DeliveryRequest }>(`/delivery-requests/${id}/cancel`),
  decideQuote: (id: string, accepted: boolean) => apiClient.post<{ request: DeliveryRequest }>(`/delivery-requests/${id}/quote/decision`, { accepted }),
  track: (trackingNumber: string) => apiClient.get<{ request: DeliveryRequest }>(`/delivery-requests/track/${encodeURIComponent(trackingNumber)}`),
  adminList: (params: { page?: number; status?: DeliveryStatus; search?: string } = {}) => {
    const query = new URLSearchParams({ page: String(params.page ?? 1) });
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    return apiClient.get<{ requests: AdminDeliveryRequest[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/delivery-requests/admin?${query.toString()}`);
  },
  adminGet: (id: string) => apiClient.get<{ request: AdminDeliveryRequest }>(`/delivery-requests/admin/${id}`),
  adminUpdateStatus: (id: string, status: DeliveryStatus) => apiClient.patch<{ request: AdminDeliveryRequest }>(`/delivery-requests/admin/${id}/status`, { status }),
  adminQuote: (id: string, input: { amount: number; currency?: string; notes?: string }) => apiClient.post<{ request: AdminDeliveryRequest }>(`/delivery-requests/admin/${id}/quote`, input),
  adminProcess: (id: string, input: { estimatedDeliveryDate: string; rider: { name: string; phone: string; vehicle: string; registrationNumber: string } }) => apiClient.post<{ request: AdminDeliveryRequest }>(`/delivery-requests/admin/${id}/process`, input),
  adminDispatch: (id: string) => apiClient.post<{ request: AdminDeliveryRequest }>(`/delivery-requests/admin/${id}/dispatch`, {}),
};
