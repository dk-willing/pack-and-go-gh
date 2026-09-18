import { Router } from "express";
import { changePassword, login, logout, me, refresh, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter, login);
router.post("/refresh", authRateLimiter, refresh);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);
router.patch("/change-password", requireAuth, changePassword);

export default router;