
import type { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";

// =====================================================
// 1. STATISTIK UTAMA
// =====================================================

export async function getSummary(
  _req: Request,
  res: Response
) {
  try {
    const data = await dashboardService.getSummary();

    return res.status(200).json({
      success: true,
      message: "Statistik dashboard berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik dashboard",
    });
  }
}

// =====================================================
// 2. GRAFIK PENDAMPINGAN
// =====================================================

export async function getPendampinganStats(
  req: Request,
  res: Response
) {
  try {
    const period = req.query.period ?? "semester";

    const allowedPeriods = [
      "weekly",
      "monthly",
      "semester",
    ];

    if (
      typeof period !== "string" ||
      !allowedPeriods.includes(period)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Periode tidak valid. Gunakan weekly, monthly, atau semester.",
      });
    }

    const data =
      await dashboardService.getPendampinganStats(
        period as "weekly" | "monthly" | "semester"
      );

    return res.status(200).json({
      success: true,
      message: "Grafik pendampingan berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("Dashboard chart error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil grafik pendampingan",
    });
  }
}

// =====================================================
// 3. KALENDER PENDAMPINGAN
// =====================================================

export async function getCalendar(
  req: Request,
  res: Response
) {
  try {
    const month = req.query.month;

    if (
      month !== undefined &&
      typeof month !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Parameter month harus berupa teks.",
      });
    }

    const data = await dashboardService.getCalendar(month);

    return res.status(200).json({
      success: true,
      message: "Kalender pendampingan berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("Dashboard calendar error:", error);

    const message =
      error instanceof Error ? error.message : "";

    if (message.includes("Format bulan tidak valid")) {
      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil kalender pendampingan",
    });
  }
}

// =====================================================
// 4. PENGAJUAN PERIZINAN
// =====================================================

export async function getPermissions(
  _req: Request,
  res: Response
) {
  try {
    const data = await dashboardService.getPermissions();

    return res.status(200).json({
      success: true,
      message: "Data pengajuan izin berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("Dashboard permissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data pengajuan izin",
    });
  }
}

// =====================================================
// 5. STATISTIK PENDAMPING
// =====================================================

export async function getMentorStats(
  _req: Request,
  res: Response
) {
  try {
    const data = await dashboardService.getMentorStats();

    return res.status(200).json({
      success: true,
      message: "Statistik pendamping berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("Dashboard mentors error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik pendamping",
    });
  }
}
