import type { ApiResponse } from "@pack-and-go/types";

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

/**
 * The one place raw fetch() calls to the backend are made. Every frontend
 * "resource" client (authApi, deliveryRequestApi, ...) should be built on
 * top of this function rather than calling fetch directly from components.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
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
