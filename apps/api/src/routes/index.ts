import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "./auth.routes";
import customerRoutes from "./customer.routes";
import deliveryRequestRoutes from "./deliveryRequest.routes";
import notificationRoutes from "./notification.routes";
import statsRoutes from "./stats.routes";

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
router.use("/auth", authRoutes);
router.use("/customers", customerRoutes);
router.use("/delivery-requests", deliveryRequestRoutes);
router.use("/notifications", notificationRoutes);
router.use("/stats", statsRoutes);

export default router;
