import { Router } from "express";
import { UserRole } from "../../generated/prisma/client";
import { authenticate, authorize } from "../../middleware/authGuard";
import { getMyMentorProfile } from "./mentors.controller";
import { createMySchedule, getMySchedules } from "../schedules/schedules.controller";

const router = Router();

// Hanya pendamping yang login yang boleh melihat profilnya sendiri.
router.get("/me", authenticate, authorize(UserRole.MENTOR), getMyMentorProfile);

// Jadwal kuliah pendamping: hanya input (POST) dan lihat (GET), tanpa ubah/hapus.
router.post("/me/schedules", authenticate, authorize(UserRole.MENTOR), createMySchedule);
router.get("/me/schedules", authenticate, authorize(UserRole.MENTOR), getMySchedules);

export default router;