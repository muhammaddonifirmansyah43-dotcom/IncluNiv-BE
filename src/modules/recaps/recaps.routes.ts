
import { Router } from "express";

import {
  authenticate,
  authorize,
} from "../../middleware/auth.middleware";

import {
  getAllRecaps,
  getRecapDetail,
  getMyRecap,
} from "./recaps.controller";

const router = Router();

// Semua endpoint membutuhkan login.
router.use(authenticate);

// Rekap seluruh volunteer untuk admin.
router.get(
  "/",
  authorize("ADMIN"),
  getAllRecaps
);

// Rekap pribadi pendamping.
router.get(
  "/me",
  authorize("MENTOR"),
  getMyRecap
);

// Detail rekap volunteer untuk admin.
router.get(
  "/:id",
  authorize("ADMIN"),
  getRecapDetail
);

export default router;
