import { Router } from "express";
import { changePassword, createAdmin, login, logout, me, refresh, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { authRateLimiter } from "../middleware/rateLimiter";
import { UserRole } from "@pack-and-go/types";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/admin-users", requireAuth, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), createAdmin);
router.post("/login", authRateLimiter, login);
router.post("/refresh", authRateLimiter, refresh);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.patch("/change-password", requireAuth, changePassword);

export default router;