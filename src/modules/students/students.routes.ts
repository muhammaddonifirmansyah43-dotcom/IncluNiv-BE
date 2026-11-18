
import { Router } from "express";
import { UserRole } from "../../generated/prisma/client";
import { authenticate, authorize } from "../../middleware/authGuard";

import { getMyProfile } from "./students.controller";

import {
  createScheduleController,
  getMySchedulesController,
} from "../schedules/schedules.controller";

const router = Router();

// Profil mahasiswa yang sedang login.
router.get(
  "/me",
  authenticate,
  authorize(UserRole.STUDENT),
  getMyProfile
);

// Jadwal kuliah mahasiswa.
router.post(
  "/me/schedules",
  authenticate,
  authorize(UserRole.STUDENT),
  createScheduleController
);

router.get(
  "/me/schedules",
  authenticate,
  authorize(UserRole.STUDENT),
  getMySchedulesController
);

export default router;
