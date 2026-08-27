import { Router } from "express";
import { getMedicines } from "../controllers/medicineController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getMedicines);

export default router;
