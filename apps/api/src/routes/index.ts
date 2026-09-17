import { Router } from "express";
import healthRoutes from "./health.routes";

/**
 * All v1 routes are mounted here. As features are implemented, add:
 *   router.use("/auth", authRoutes);
 *   router.use("/delivery-requests", deliveryRequestRoutes);
 *   router.use("/quotes", quoteRoutes);
 *   ...
 * Keep this file a thin aggregator — no logic lives here.
 */
const router = Router();

router.use("/health", healthRoutes);

export default router;
