
import { Router } from "express";
import { UserRole } from "../../generated/prisma/client";
import { authenticate, authorize } from "../../middleware/authGuard";

import { getMyMentorProfile } from "./mentors.controller";

import {
  createScheduleController,
  getMySchedulesController,
} from "../schedules/schedules.controller";

const router = Router();

// Profil pendamping yang sedang login.
router.get(
  "/me",
  authenticate,
  authorize(UserRole.MENTOR),
  getMyMentorProfile
);

// Jadwal kuliah pendamping.
router.post(
  "/me/schedules",
  authenticate,
  authorize(UserRole.MENTOR),
  createScheduleController
);

router.get(
  "/me/schedules",
  authenticate,
  authorize(UserRole.MENTOR),
  getMySchedulesController
);

export default router;
