import { Router } from "express";
import { createReminder, getReminders, updateReminderStatus } from "../controllers/reminderController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/", getReminders);
router.post("/", createReminder);
router.patch("/:id", updateReminderStatus);

export default router;
