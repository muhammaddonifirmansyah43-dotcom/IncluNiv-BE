
import { Router } from "express";

import {
  createPermissionController,
  getMentorPermissionHistoryController,
  getPendingPermissionsController,
} from "./permissions.controller";

import {
  authenticateToken,
  authorizeRole,
} from "../../middleware/auth.middleware";

const router = Router();

// Semua endpoint izin wajib menggunakan token autentikasi
router.use(authenticateToken);

// Pengajuan izin hanya untuk pendamping
router.post(
  "/",
  authorizeRole("MENTOR"),
  createPermissionController
);

// Monitoring pengajuan izin hanya untuk admin
router.get(
  "/monitoring",
  authorizeRole("ADMIN"),
  getPendingPermissionsController
);

// Riwayat izin hanya untuk pendamping
router.get(
  "/my-history",
  authorizeRole("MENTOR"),
  getMentorPermissionHistoryController
);

export default router;
