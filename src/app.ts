import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";

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

export default app;