import { Router } from "express";
import {
  getMedicines,
  createMedicine,
  updateMedicine,
  adjustStock,
  deleteMedicine,
} from "../controllers/medicineController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getMedicines);
router.post("/", createMedicine);
router.patch("/:id", updateMedicine);
router.patch("/:id/stock", adjustStock);
router.delete("/:id", deleteMedicine);

export default router;

