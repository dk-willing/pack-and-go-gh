import type { UserRole } from "@pack-and-go/types";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
}

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  sessionId: string;
}