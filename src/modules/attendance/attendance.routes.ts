
import { Router } from "express";
import {
  authenticate,
  authorize,
} from "../../middleware/auth.middleware";

import {
  confirmAttendanceController,
  getMentorAttendanceHistoryController,
  getAllAttendance,
  getAttendanceDetail,
  getMyStudentAttendance,
  getMyMentorAttendance,
} from "./attendance.controller";

const router = Router();

// Semua endpoint membutuhkan autentikasi.
router.use(authenticate);

// Mentor mengonfirmasi pendampingan yang sudah selesai.
router.post(
  "/:assignmentId/confirm",
  authorize("MENTOR"),
  confirmAttendanceController
);

// Riwayat konfirmasi kehadiran mentor.
router.get(
  "/my-history",
  authorize("MENTOR"),
  getMentorAttendanceHistoryController
);

// Riwayat mahasiswa yang sedang login.
router.get(
  "/student/me",
  authorize("STUDENT"),
  getMyStudentAttendance
);

// Riwayat pendamping yang sedang login.
router.get(
  "/mentor/me",
  authorize("MENTOR"),
  getMyMentorAttendance
);

// Seluruh riwayat pelaksanaan untuk admin.
router.get(
  "/",
  authorize("ADMIN"),
  getAllAttendance
);

// Detail riwayat untuk admin.
router.get(
  "/:id",
  authorize("ADMIN"),
  getAttendanceDetail
);

export default router;
