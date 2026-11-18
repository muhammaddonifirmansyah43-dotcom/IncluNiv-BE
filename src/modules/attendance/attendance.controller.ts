
import type { Request, Response } from "express";

import {
  getAllAttendanceHistory,
  getAttendanceHistoryById,
  getStudentAttendanceHistory,
  getMentorAttendanceHistory,
} from "./attendance.service";

// Identitas pengguna yang nantinya diisi middleware JWT
type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    role: "STUDENT" | "MENTOR" | "ADMIN";
  };
};

// 1. Daftar seluruh riwayat (ADMIN)
export const getAllAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    if (authReq.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk admin.",
      });
    }

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

// 2. Detail riwayat (ADMIN)
export const getAttendanceDetail = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    if (authReq.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk admin.",
      });
    }

   
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

// 3. Riwayat milik mahasiswa yang sedang login
export const getMyStudentAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    if (authReq.user.role !== "STUDENT") {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk mahasiswa.",
      });
    }

    const data = await getStudentAttendanceHistory(
      authReq.user.id
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

// 4. Riwayat milik pendamping yang sedang login
export const getMyMentorAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
    }

    if (authReq.user.role !== "MENTOR") {
      return res.status(403).json({
        success: false,
        message: "Akses hanya untuk pendamping.",
      });
    }

    const data = await getMentorAttendanceHistory(
      authReq.user.id
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
