import { Router } from "express";
import { UserRole } from "../../generated/prisma/client";
import { authenticate, authorize } from "../../middleware/authGuard";
import { adminListStudents, adminGetStudent } from "./students.controller";

const router = Router();

router.get("/", authenticate, authorize(UserRole.ADMIN), adminListStudents);
router.get("/:id", authenticate, authorize(UserRole.ADMIN), adminGetStudent);

export default router;