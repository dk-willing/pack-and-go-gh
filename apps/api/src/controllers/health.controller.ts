import { Request, Response } from "express";
import type { HealthCheckData } from "@pack-and-go/types";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { env } from "../config/env";

export const getHealth = asyncHandler(async (req: Request, res: Response) => {
  const data: HealthCheckData = {
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  };

  sendSuccess(res, 200, "API is running", data);
});
