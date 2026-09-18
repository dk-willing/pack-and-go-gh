import { Router } from "express";
import { UserRole } from "@pack-and-go/types";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { list, markRead } from "../controllers/notification.controller";

const router = Router();
router.use(requireAuth, requireRole(UserRole.CUSTOMER, UserRole.BUSINESS_CUSTOMER));
router.get("/", list);
router.patch("/:id/read", markRead);
export default router;