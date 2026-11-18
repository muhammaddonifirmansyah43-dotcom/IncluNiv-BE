import { Router } from "express";
import { UserRole } from "../../generated/prisma/client";
import { authenticate, authorize } from "../../middleware/authGuard";
import { adminListMentors, adminGetMentor } from "./mentors.controller";

const router = Router();

router.get("/", authenticate, authorize(UserRole.ADMIN), adminListMentors);
router.get("/:id", authenticate, authorize(UserRole.ADMIN), adminGetMentor);

export default router;