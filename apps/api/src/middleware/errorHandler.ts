import { NextFunction, Request, Response } from "express";
import type { ApiErrorResponse } from "@pack-and-go/types";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

/**
 * Single place where every error in the application is turned into an
 * HTTP response. Must be registered LAST, after all routes.
 *
 * - Known, operational errors (ApiError) are returned with their intended
 *   status code and message.
 * - Anything else is treated as an unexpected error: logged in full, but
 *   only a generic message is sent to the client (never a stack trace or
 *   internal detail), regardless of environment.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  if (err instanceof ApiError) {
    const body: ApiErrorResponse = {
      success: false,
      message: err.message,
      errors: err.errors ?? null,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unexpected error — log full detail server-side only.
  console.error("🔥 Unhandled error:", err);

  const body: ApiErrorResponse = {
    success: false,
    message:
      env.NODE_ENV === "production"
        ? "Something went wrong. Please try again later."
        : err instanceof Error
        ? err.message
        : "Something went wrong.",
    errors: null,
  };

  res.status(500).json(body);
}
