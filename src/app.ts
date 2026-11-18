
import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import attendanceRoutes from "./modules/attendance/attendance.routes";
import recapsRoutes from "./modules/recaps/recaps.routes";

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

export default app;
