import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "IncluNiv Backend API berjalan",
    data: {
      status: "healthy"
    }
  });
});

export default router;