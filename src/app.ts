
import express, { ErrorRequestHandler } from "express";
import cors from "cors";
import path from "path";
import multer from "multer";

import healthRoutes from "./routes/health.routes";
import authRoutes from "./modules/auth/auth.routes";
import permissionsRoutes from "./modules/permissions/permissions.routes";
import assignmentsRoutes from "./modules/assignments/assignments.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import schedulesRoutes from "./modules/schedules/schedules.routes";

const app = express();

// Middleware
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

// Health check
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

// Global error handler
const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Ukuran foto maksimal 5 MB"
        : "Terjadi kesalahan saat mengunggah foto";

    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (
    error instanceof Error &&
    error.message === "Format foto harus JPG, PNG, atau WEBP"
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Unhandled application error:", error);

  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
};

app.use(errorHandler);

export default app;
