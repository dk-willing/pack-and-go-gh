import { Request, Response } from "express";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { changePasswordSchema, createAdminSchema, loginSchema, registerSchema } from "../validators/auth.validator";
import { authenticateUser, changeUserPassword, createAdminUser, getSafeUser, refreshAuthentication, registerUser, revokeSession } from "../services/auth.service";

const accessCookie = { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
const refreshCookie = { ...accessCookie, path: "/api/v1/auth" };

function metadata(req: Request) { return { userAgent: req.get("user-agent"), ipAddress: req.ip }; }

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, { ...accessCookie, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...refreshCookie, maxAge: 7 * 24 * 60 * 60 * 1000 });
}

function clearAuthCookies(res: Response) {
  res.clearCookie("accessToken", accessCookie);
  res.clearCookie("refreshToken", refreshCookie);
}

function parse<T>(schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false; error: { flatten: () => { fieldErrors: Record<string, string[]> } } } }, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) throw ApiError.badRequest("Validation failed", result.error.flatten().fieldErrors);
  return result.data;
}

export const register = asyncHandler(async (req, res) => {
  const input = parse(registerSchema, req.body);
  const user = await registerUser(input);
  sendSuccess(res, 201, "Registration successful", { user });
});

export const createAdmin = asyncHandler(async (req, res) => {
  const input = parse(createAdminSchema, req.body);
  const user = await createAdminUser(input);
  sendSuccess(res, 201, "Admin account created successfully", { user });
});

export const login = asyncHandler(async (req, res) => {
  const input = parse(loginSchema, req.body);
  const result = await authenticateUser(input.email, input.password, metadata(req));
  setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, 200, "Login successful", { user: result.user });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) throw ApiError.unauthorized("Refresh authentication required");
  const result = await refreshAuthentication(token, metadata(req));
  setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, 200, "Authentication refreshed successfully", { user: result.user });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.auth) await revokeSession(req.auth.sessionId, req.auth.id);
  clearAuthCookies(res);
  sendSuccess(res, 200, "Logout successful", {});
});

export const me = asyncHandler(async (req, res) => {
  if (!req.auth) throw ApiError.unauthorized("Authentication required");
  const user = await getSafeUser(req.auth.id);
  sendSuccess(res, 200, "Authenticated user retrieved successfully", { user });
});

export const changePassword = asyncHandler(async (req, res) => {
  if (!req.auth) throw ApiError.unauthorized("Authentication required");
  const input = parse(changePasswordSchema, req.body);
  await changeUserPassword(req.auth.id, input.currentPassword, input.newPassword);
  clearAuthCookies(res);
  sendSuccess(res, 200, "Password changed successfully. Please log in again.", {});
});
