import { Router } from "express";
import { UserRole } from "../../generated/prisma/client";
import { authenticate, authorize } from "../../middleware/authGuard";
import { getMyProfile } from "./students.controller";
import { createMySchedule, getMySchedules } from "../schedules/schedules.controller";

const router = Router();

// Hanya mahasiswa yang login yang boleh melihat profilnya sendiri.
router.get("/me", authenticate, authorize(UserRole.STUDENT), getMyProfile);

// Jadwal kuliah mahasiswa: hanya input (POST) dan lihat (GET), tanpa ubah/hapus.
router.post("/me/schedules", authenticate, authorize(UserRole.STUDENT), createMySchedule);
router.get("/me/schedules", authenticate, authorize(UserRole.STUDENT), getMySchedules);

export default router;