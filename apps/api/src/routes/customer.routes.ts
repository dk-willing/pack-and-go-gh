import { Router } from "express";
import { getMe, updateMe, getLocations, postLocation, patchLocation, removeLocation, adminList } from "../controllers/customer.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { UserRole } from "@pack-and-go/types";

const router = Router();
const customers = [UserRole.CUSTOMER, UserRole.BUSINESS_CUSTOMER];
router.use(requireAuth);
router.get("/me", requireRole(...customers), getMe);
router.patch("/me", requireRole(...customers), updateMe);
router.get("/me/locations", requireRole(...customers), getLocations);
router.post("/me/locations", requireRole(...customers), postLocation);
router.patch("/me/locations/:locationId", requireRole(...customers), patchLocation);
router.delete("/me/locations/:locationId", requireRole(...customers), removeLocation);
router.get("/", requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OPERATIONS_MANAGER), adminList);
export default router;