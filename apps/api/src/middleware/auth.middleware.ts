import { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User.model";
import { ApiError } from "../utils/ApiError";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.accessToken as string | undefined;
    if (!token) return next(ApiError.unauthorized("Authentication required"));
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload & { role?: string; sessionId?: string };
    if (!payload.sub || !payload.role || !payload.sessionId) return next(ApiError.unauthorized("Invalid authentication token"));
    const user = await User.findById(payload.sub).select("role isActive");
    if (!user || !user.isActive || user.role !== payload.role) return next(ApiError.unauthorized("Authentication required"));
    req.auth = { id: user._id.toString(), role: user.role, sessionId: payload.sessionId };
    return next();
  } catch {
    return next(ApiError.unauthorized("Authentication required"));
  }
}