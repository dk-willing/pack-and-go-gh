import { Router } from "express";
import { requireRole } from "../middleware/role.middleware";
import { UserRole } from "@pack-and-go/types";
import { calculate, calculateFromRequest, configuration, pricingRoles } from "../controllers/pricing.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth, requireRole(...pricingRoles));
router.get("/config", configuration);
router.post("/calculate", calculate);
router.post("/calculate/:id", calculateFromRequest);

export default router;
