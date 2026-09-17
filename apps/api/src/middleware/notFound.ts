import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

/**
 * Catches any request that didn't match a route and forwards a 404
 * ApiError to the centralized error handler, keeping the "not found"
 * response shape consistent with every other error.
 */
export function notFound(req: Request, res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
