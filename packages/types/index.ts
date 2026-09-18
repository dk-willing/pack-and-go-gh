/**
 * Shared types used by both apps/web and apps/api.
 *
 * Keep this package small. Only add types here when sharing them
 * genuinely improves consistency between frontend and backend
 * (e.g. API response envelopes, role enums). Feature-specific types
 * belong in each app until there's a proven need to share them.
 */

// ---------------------------------------------------------------------------
// API response envelope
// ---------------------------------------------------------------------------

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]> | null;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Auth / roles
// ---------------------------------------------------------------------------

/**
 * High-level roles the platform will authorize against.
 * Kept minimal for the foundation stage — expand as features that need
 * finer-grained roles (e.g. dispatcher, support-agent) are implemented.
 */
export enum UserRole {
  CUSTOMER = "CUSTOMER",
  BUSINESS_CUSTOMER = "BUSINESS_CUSTOMER",
  DRIVER = "DRIVER",
  DISPATCHER = "DISPATCHER",
  OPERATIONS_MANAGER = "OPERATIONS_MANAGER",
  FINANCE = "FINANCE",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export type Permission =
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "shipments:read"
  | "shipments:create"
  | "shipments:update"
  | "quotes:create"
  | "quotes:approve"
  | "quotes:view"
  | "payments:read"
  | "payments:manage";

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

export interface HealthCheckData {
  status: "ok";
  uptimeSeconds: number;
  timestamp: string;
  environment: string;
}
