import { Router } from "express";

import {
  createScheduleController,
  getMySchedulesController,
  updateScheduleController,
  deleteScheduleController,
} from "./schedules.controller";

import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

// Jadwal kuliah dapat dikelola mahasiswa dan pendamping
router.post(
  "/",
  authorizeRole("STUDENT", "MENTOR"),
  createScheduleController
);

router.get(
  "/my-schedules",
  authorizeRole("STUDENT", "MENTOR"),
  getMySchedulesController
);

router.put(
  "/:id",
  authorizeRole("STUDENT", "MENTOR"),
  updateScheduleController
);

router.delete(
  "/:id",
  authorizeRole("STUDENT", "MENTOR"),
  deleteScheduleController
);

export default router;
