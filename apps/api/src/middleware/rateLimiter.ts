import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/**
 * General-purpose rate limiter applied to the whole API. Stricter,
 * endpoint-specific limiters (e.g. login attempts) can be added
 * alongside this one when those endpoints are implemented.
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    errors: null,
  },
});
