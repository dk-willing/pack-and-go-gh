import { Response } from "express";
import type { ApiSuccessResponse } from "@pack-and-go/types";

/**
 * Sends a consistently-shaped success response.
 * Every controller should respond through this helper rather than
 * calling res.json(...) directly, so the envelope never drifts.
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T
): Response<ApiSuccessResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}
