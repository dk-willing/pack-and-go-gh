import { NextFunction, Request, Response } from "express";
import type { UserRole } from "@pack-and-go/types";
import { ApiError } from "../utils/ApiError";

export function requireRole(...roles: UserRole[]) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    if (!_req.auth || !roles.includes(_req.auth.role)) return next(ApiError.forbidden("You do not have permission to access this resource"));
    return next();
  };
}