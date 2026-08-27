import { Router } from "express";
import { getReports } from "../controllers/reportController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/", authenticate, authorizeRoles("ADMIN"), getReports);

export default router;
