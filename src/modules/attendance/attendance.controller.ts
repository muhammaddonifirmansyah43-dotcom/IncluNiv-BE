
import type { Request, Response } from "express";
import {
  confirmAttendance,
  getMentorAttendanceHistory,
  getAllAttendanceHistory,
  getAttendanceHistoryById,
  getStudentAttendanceHistory,
} from "./attendance.service";

// =====================================================
// 1. KONFIRMASI KEHADIRAN OLEH MENTOR
// =====================================================

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

// =====================================================
// 2. RIWAYAT SELURUH PELAKSANAAN (ADMIN)
// =====================================================

export const getAllAttendance = async (
  _req: Request,
  res: Response
) => {
  try {
    const data = await getAllAttendanceHistory();

    return res.status(200).json({
      success: true,
      message: "Riwayat pelaksanaan berhasil diambil.",
      data,
    });
  } catch (error) {
    console.error("Get all attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat pelaksanaan.",
    });
  }
};

// =====================================================
// 3. DETAIL RIWAYAT (ADMIN)
// =====================================================

export const getAttendanceDetail = async (
  req: Request,
  res: Response
) => {
  try {
    const rawId = req.params.id;

    if (
      typeof rawId !== "string" ||
      !/^[1-9]\d*$/.test(rawId)
    ) {
      return res.status(400).json({
        success: false,
        message: "ID riwayat tidak valid.",
      });
    }

    const attendanceId = Number(rawId);

    if (!Number.isSafeInteger(attendanceId)) {
      return res.status(400).json({
        success: false,
        message: "ID riwayat tidak valid.",
      });
    }

    const data = await getAttendanceHistoryById(attendanceId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Riwayat pelaksanaan tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail riwayat berhasil diambil.",
      data,
    });
  } catch (error) {
    console.error("Get attendance detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail riwayat.",
    });
  }
};

// =====================================================
// 4. RIWAYAT MAHASISWA YANG LOGIN
// =====================================================

export const getMyStudentAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk mahasiswa.",
      });
    }

    const data = await getStudentAttendanceHistory(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Riwayat mahasiswa berhasil diambil.",
      data,
    });
  } catch (error) {
    console.error("Get student attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat mahasiswa.",
    });
  }
};

// =====================================================
// 5. RIWAYAT PENDAMPING YANG LOGIN
// =====================================================

export const getMyMentorAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "MENTOR") {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk pendamping.",
      });
    }

    const data = await getMentorAttendanceHistory(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Riwayat pendamping berhasil diambil.",
      data,
    });
  } catch (error) {
    console.error("Get mentor attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat pendamping.",
    });
  }
};

// =====================================================
// 6. RIWAYAT KONFIRMASI KEHADIRAN MENTOR
// =====================================================

export const getMentorAttendanceHistoryController =
  getMyMentorAttendance;
