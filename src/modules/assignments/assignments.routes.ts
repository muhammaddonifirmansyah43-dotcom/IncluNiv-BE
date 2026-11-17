
import { Router } from "express";
import {
  getAssignmentsForMonitoringController,
  acceptAssignmentController,
} from "./assignments.controller";
import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

// Monitoring penugasan khusus admin
router.get(
  "/monitoring",
  authorizeRole("ADMIN"),
  getAssignmentsForMonitoringController
);

// Mentor menerima penugasan miliknya
router.post(
  "/:id/accept",
  authorizeRole("MENTOR"),
  acceptAssignmentController
);

export default router;
