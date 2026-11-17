import { Request, Response } from "express";
import {
  confirmAttendance,
  getMentorAttendanceHistory,
} from "./attendance.service";

// Mentor mengonfirmasi pendampingan yang telah selesai
export async function confirmAttendanceController(
  req: Request,
  res: Response
) {
  try {
    if (!req.user || req.user.role !== "MENTOR") {
      return res.status(403).json({
        success: false,
        message: "Hanya pendamping yang dapat mengonfirmasi kehadiran",
      });
    }

    const assignmentId = Number(req.params.assignmentId);
    const { notes } = req.body;

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID penugasan tidak valid",
      });
    }

    if (
      notes !== undefined &&
      notes !== null &&
      typeof notes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Catatan harus berupa teks",
      });
    }

    if (typeof notes === "string" && notes.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Catatan maksimal 2000 karakter",
      });
    }

    const result = await confirmAttendance(
      assignmentId,
      req.user.userId,
      notes
    );

    return res.status(201).json({
      success: true,
      message: "Konfirmasi pendampingan berhasil disimpan",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    const statusCode =
      message === "Data pendamping tidak ditemukan" ||
      message === "Penugasan tidak ditemukan atau bukan milik Anda"
        ? 404
        : message === "Konfirmasi kehadiran sudah dilakukan" ||
            message === "Penugasan belum diterima atau sudah diselesaikan" ||
            message === "Status penugasan telah berubah, silakan coba lagi"
          ? 409
          : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

// Mentor melihat riwayat konfirmasi miliknya
export async function getMentorAttendanceHistoryController(
  req: Request,
  res: Response
) {
  try {
    if (!req.user || req.user.role !== "MENTOR") {
      return res.status(403).json({
        success: false,
        message: "Hanya pendamping yang dapat melihat riwayat kehadirannya",
      });
    }

    const attendance = await getMentorAttendanceHistory(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Riwayat kehadiran berhasil diambil",
      data: attendance,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    return res.status(
      message === "Data pendamping tidak ditemukan" ? 404 : 500
    ).json({
      success: false,
      message,
    });
  }
}
