
import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes";

import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import recapsRoutes from "./modules/recaps/recaps.routes";

import studentRoutes from "./modules/students/students.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import mentorsRoutes from "./modules/mentors/mentors.routes";
import studentsAdminRoutes from "./modules/students/students.admin.routes";
import mentorsAdminRoutes from "./modules/mentors/mentors.admin.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";


const app = express();

// Middleware utama
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route utama
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Selamat datang di IncluNiv Backend",
  });
});

// Health Check
app.use("/api/health", healthRoutes);


  // Dashboard Admin
  app.use("/api/dashboard", dashboardRoutes);

  // Riwayat Pelaksanaan
  app.use("/api/attendance", attendanceRoutes);

  // Rekap Volunteer
  app.use("/api/recaps", recapsRoutes);

  // Modul Students
  app.use("/api/students", studentRoutes);

  // Modul Mentors
  app.use("/api/mentors", mentorsRoutes);

  // Modul Notifications
  app.use("/api/notifications", notificationsRoutes);

  // Penanganan error harus di bagian paling bawah
  // setelah seluruh route didaftarkan
  app.use(notFoundHandler);
  app.use(errorHandler);

  export default app;

