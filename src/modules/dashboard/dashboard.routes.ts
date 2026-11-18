
import { Router } from "express";

import {
  authenticate,
  authorize,
} from "../../middleware/auth.middleware";

import {
  getSummary,
  getPendampinganStats,
  getCalendar,
  getPermissions,
  getMentorStats,
} from "./dashboard.controller";

const router = Router();

// Semua endpoint dashboard khusus ADMIN.
router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/summary", getSummary);

router.get(
  "/pendampingan",
  getPendampinganStats
);

router.get("/calendar", getCalendar);

router.get("/permissions", getPermissions);

router.get("/mentors", getMentorStats);

export default router;
