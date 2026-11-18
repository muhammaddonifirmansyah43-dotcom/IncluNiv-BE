
import { Router } from "express";

import {
  authenticate,
  authorize,
} from "../../middleware/auth.middleware";

import {
  getAllAttendance,
  getAttendanceDetail,
  getMyStudentAttendance,
  getMyMentorAttendance,
} from "./attendance.controller";

const router = Router();

// Semua endpoint membutuhkan login.
router.use(authenticate);

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
