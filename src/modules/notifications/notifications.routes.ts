
import { Router } from "express";

import { authenticate } from "../../middleware/authGuard";

import {
  getMyNotifications,
  markMyNotificationAsRead,
  markMyNotificationAsUnread,
} from "./notifications.controller";

const router = Router();

// Semua API notifikasi membutuhkan JWT
router.use(authenticate);

// API 1: Daftar notifikasi
router.get("/", getMyNotifications);

// API 2: Tandai sudah dibaca
router.patch(
  "/:id/read",
  markMyNotificationAsRead
);

// API 3: Tandai belum dibaca
router.patch(
  "/:id/unread",
  markMyNotificationAsUnread
);

export default router;
