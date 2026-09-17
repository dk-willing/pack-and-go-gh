import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { API_PREFIX } from "@pack-and-go/config";
import { env } from "./config/env";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import v1Router from "./routes";

export function createApp(): Application {
  const app = express();

  // --- Security & parsing middleware -------------------------------------
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true, limit: "10kb" }));
  app.use(cookieParser());

  // --- Logging -------------------------------------------------------------
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  // --- Rate limiting ---------------------------------------------------------
  app.use(apiRateLimiter);

  // --- Versioned API routes --------------------------------------------------
  app.use(API_PREFIX, v1Router);

  // --- 404 + centralized error handling ---------------------------------------
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
