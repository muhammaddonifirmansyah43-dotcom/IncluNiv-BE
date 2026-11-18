
import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";

import healthRoutes from "./routes/health.routes";
import authRoutes from "./modules/auth/auth.routes";
import permissionsRoutes from "./modules/permissions/permissions.routes";
import assignmentsRoutes from "./modules/assignments/assignments.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import schedulesRoutes from "./modules/schedules/schedules.routes";

import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import recapsRoutes from "./modules/recaps/recaps.routes";
import studentRoutes from "./modules/students/students.routes";
import mentorsRoutes from "./modules/mentors/mentors.routes";
import studentsAdminRoutes from "./modules/students/students.admin.routes";
import mentorsAdminRoutes from "./modules/mentors/mentors.admin.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";

import {
  errorHandler as globalErrorHandler,
  notFoundHandler,
} from "./middleware/errorHandler";

const app = express();

// Middleware utama
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file untuk foto profil
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// Route utama
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Selamat datang di IncluNiv Backend",
  });
});

// Health Check
app.use("/api/health", healthRoutes);

// Authentication
app.use("/api/auth", authRoutes);

// Permissions
app.use("/api/permissions", permissionsRoutes);

// Assignments
app.use("/api/assignments", assignmentsRoutes);

// Attendance
app.use("/api/attendance", attendanceRoutes);

// Schedules
app.use("/api/schedules", schedulesRoutes);

// Dashboard Admin
app.use("/api/dashboard", dashboardRoutes);

// Recaps
app.use("/api/recaps", recapsRoutes);

// Students
app.use("/api/students", studentRoutes);

// Admin Students
app.use("/api/admin/students", studentsAdminRoutes);

// Mentors
app.use("/api/mentors", mentorsRoutes);

// Admin Mentors
app.use("/api/admin/mentors", mentorsAdminRoutes);

// Notifications
app.use("/api/notifications", notificationsRoutes);

// Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Ukuran foto maksimal 5 MB"
        : "Terjadi kesalahan saat mengunggah foto";

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (
    err instanceof Error &&
    err.message === "Format foto harus JPG, PNG, atau WEBP"
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  return globalErrorHandler(err, req, res, next);
});

export default app;
