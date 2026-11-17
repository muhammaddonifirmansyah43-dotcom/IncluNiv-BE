import { Router } from "express";
import {
  confirmAttendanceController,
  getMentorAttendanceHistoryController,
} from "./attendance.controller";
import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

// Mentor mengonfirmasi pendampingan yang sudah selesai
router.post(
  "/:assignmentId/confirm",
  authorizeRole("MENTOR"),
  confirmAttendanceController
);

// Mentor melihat riwayat konfirmasi kehadirannya
router.get(
  "/my-history",
  authorizeRole("MENTOR"),
  getMentorAttendanceHistoryController
);

export default router;
