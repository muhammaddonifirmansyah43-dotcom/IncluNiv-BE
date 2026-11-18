
import { Request, Response } from "express";
import {
  getAssignmentsForMonitoring,
  acceptAssignment,
} from "./assignments.service";

export async function getAssignmentsForMonitoringController(
  req: Request,
  res: Response
) {
  try {
    const assignments = await getAssignmentsForMonitoring();

    return res.status(200).json({
      success: true,
      message: "Data monitoring penugasan berhasil diambil",
      data: assignments,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    return res.status(500).json({
      success: false,
      message,
    });
  }
}

export async function acceptAssignmentController(
  req: Request,
  res: Response
) {
  try {
    const assignmentId = Number(req.params.id);
    const userId = req.user?.userId;

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID penugasan tidak valid",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan",
      });
    }

    const assignment = await acceptAssignment(assignmentId, userId);

    return res.status(200).json({
      success: true,
      message: "Penugasan berhasil diterima",
      data: assignment,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    const statusCode =
      message === "Data pendamping tidak ditemukan" ||
      message === "Penugasan tidak ditemukan atau bukan milik Anda"
        ? 404
        : message === "Penugasan tidak dapat diterima karena sudah diproses" ||
            message === "Penugasan sudah diproses oleh permintaan lain"
          ? 409
          : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}
