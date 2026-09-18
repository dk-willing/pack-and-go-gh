import { Router } from "express";
import { UserRole } from "@pack-and-go/types";
import { accept, cancel, create, getById, list, myQuotes, recalculate, reject, send } from "../controllers/quote.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";

const router = Router();
const customers = [UserRole.CUSTOMER, UserRole.BUSINESS_CUSTOMER];
const staff = [UserRole.DISPATCHER, UserRole.OPERATIONS_MANAGER, UserRole.FINANCE, UserRole.ADMIN, UserRole.SUPER_ADMIN];

router.use(requireAuth);
router.get("/", requireRole(...[...customers, ...staff]), list);
router.get("/mine", requireRole(...customers), myQuotes);
router.post("/", requireRole(...staff), create);
router.get("/:quoteId", requireRole(...[...customers, ...staff]), getById);
router.post("/:quoteId/recalculate", requireRole(...staff), recalculate);
router.post("/:quoteId/send", requireRole(...staff), send);
router.post("/:quoteId/accept", requireRole(...customers), accept);
router.post("/:quoteId/reject", requireRole(...customers), reject);
router.post("/:quoteId/cancel", requireRole(...staff), cancel);

export default router;
