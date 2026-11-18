import { Router } from "express";
import { authenticate } from "../../middleware/authGuard";
import { getMyNotifications } from "./notifications.controller";

const router = Router();

// Semua role yang login boleh melihat notifikasinya sendiri.
router.get("/", authenticate, getMyNotifications);

export default router;