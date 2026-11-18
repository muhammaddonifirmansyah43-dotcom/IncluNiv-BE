import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import studentRoutes from "./modules/students/students.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import mentorsRoutes from "./modules/mentors/mentors.routes";
import studentsAdminRoutes from "./modules/students/students.admin.routes";
import mentorsAdminRoutes from "./modules/mentors/mentors.admin.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route utama
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Selamat datang di IncluNiv Backend"
  });
});

// Health check
app.use("/api/health", healthRoutes);

// Modul students
app.use("/api/students", studentRoutes);
app.use("/api/mentors", mentorsRoutes);
app.use("/api/notifications", notificationsRoutes);

// Penanganan error (HARUS paling bawah, setelah semua route)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;