import bcrypt from "bcryptjs";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import { UserRole } from "@pack-and-go/types";
import { env } from "../config/env";
import { AuthSession } from "../models/AuthSession.model";
import { User, type UserDocument } from "../models/User.model";
import { Customer } from "../models/Customer.model";
import { ApiError } from "../utils/ApiError";
import type { AuthenticatedUser, SafeUser } from "../types/auth";

const PASSWORD_ROUNDS = 12;
const GENERIC_AUTH_ERROR = "Invalid email or password";

function safeUser(user: UserDocument & { _id: { toString(): string } }): SafeUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    ...(user.lastLoginAt ? { lastLoginAt: user.lastLoginAt.toISOString() } : {}),
  };
}

function getExpirationDate(): Date {
  const match = env.JWT_REFRESH_EXPIRES_IN.match(/^(\d+)([smhd])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 } as const;
  return new Date(Date.now() + Number(match[1]) * units[match[2] as keyof typeof units]);
}

function issueTokens(user: UserDocument & { _id: { toString(): string } }, sessionId: string) {
  const subject = user._id.toString();
  const claims = { role: user.role, sessionId };
  const accessOptions: SignOptions = { subject, expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"] };
  const refreshOptions: SignOptions = { subject, expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] };
  return {
    accessToken: jwt.sign(claims, env.JWT_ACCESS_SECRET, accessOptions),
    refreshToken: jwt.sign(claims, env.JWT_REFRESH_SECRET, refreshOptions),
  };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await User.exists({ email: input.email });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const password = await bcrypt.hash(input.password, PASSWORD_ROUNDS);
  const user = await User.create({ ...input, password, role: UserRole.CUSTOMER });
  await Customer.create({ user: user._id, savedLocations: [] });
  return safeUser(user);
}

export async function authenticateUser(email: string, password: string, metadata: { userAgent?: string; ipAddress?: string }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
    throw ApiError.unauthorized(GENERIC_AUTH_ERROR);
  }

  user.lastLoginAt = new Date();
  await user.save();
  const session = new AuthSession({
    _id: new Types.ObjectId(),
    userId: user._id,
    refreshTokenHash: "",
    expiresAt: getExpirationDate(),
    ...metadata,
  });
  const tokens = issueTokens(user, session._id.toString());
  session.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, PASSWORD_ROUNDS);
  await session.save();
  return { user: safeUser(user), ...tokens };
}

function verifyRefreshToken(token: string): JwtPayload & { sub: string; sessionId: string } {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof payload === "string" || !payload.sub || typeof payload.sessionId !== "string") {
    throw ApiError.unauthorized("Invalid refresh token");
  }
  return payload as JwtPayload & { sub: string; sessionId: string };
}

export async function refreshAuthentication(token: string, metadata: { userAgent?: string; ipAddress?: string }) {
  let payload: JwtPayload & { sub: string; sessionId: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const session = await AuthSession.findOne({ _id: payload.sessionId, userId: payload.sub }).select("+refreshTokenHash");
  const user = await User.findById(payload.sub);
  if (!session || !user || !user.isActive || !(await bcrypt.compare(token, session.refreshTokenHash))) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const removed = await AuthSession.findOneAndDelete({ _id: session._id, userId: payload.sub, refreshTokenHash: session.refreshTokenHash });
  if (!removed) throw ApiError.unauthorized("Invalid refresh token");
  const replacement = new AuthSession({ _id: new Types.ObjectId(), userId: user._id, refreshTokenHash: "", expiresAt: getExpirationDate(), ...metadata });
  const tokens = issueTokens(user, replacement._id.toString());
  replacement.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, PASSWORD_ROUNDS);
  await replacement.save();
  return { user: safeUser(user), ...tokens };
}

export async function revokeSession(sessionId: string, userId: string) {
  await AuthSession.deleteOne({ _id: sessionId, userId });
}

export async function changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId).select("+password");
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    throw ApiError.unauthorized("Current password is incorrect");
  }
  user.password = await bcrypt.hash(newPassword, PASSWORD_ROUNDS);
  await user.save();
  await AuthSession.deleteMany({ userId });
}

export async function getSafeUser(userId: string) {
  const user = await User.findById(userId);
  if (!user || !user.isActive) throw ApiError.unauthorized("Authentication required");
  return safeUser(user);
}