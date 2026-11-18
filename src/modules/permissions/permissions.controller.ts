
import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

import {
  createPermission,
  getMentorPermissionHistory,
  getPendingPermissions,
} from "./permissions.service";

// Mengajukan izin sebagai pendamping
export async function createPermissionController(
  req: Request,
  res: Response
) {
  try {
    if (!req.user || req.user.role !== "MENTOR") {
      return res.status(403).json({
        success: false,
        message: "Hanya pendamping yang dapat mengajukan izin",
      });
    }

    const { reason, startAt, endAt, assignmentId } = req.body;

    // Validasi alasan izin
    if (typeof reason !== "string" || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Alasan izin wajib diisi",
      });
    }

    if (reason.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Alasan izin maksimal 2000 karakter",
      });
    }

    // Validasi tanggal izin
    if (
      typeof startAt !== "string" ||
      typeof endAt !== "string" ||
      !startAt.trim() ||
      !endAt.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Tanggal mulai dan selesai izin wajib diisi",
      });
    }

    const parsedStartAt = new Date(startAt);
    const parsedEndAt = new Date(endAt);

    if (
      Number.isNaN(parsedStartAt.getTime()) ||
      Number.isNaN(parsedEndAt.getTime()) ||
      parsedStartAt >= parsedEndAt
    ) {
      return res.status(400).json({
        success: false,
        message: "Rentang waktu izin tidak valid",
      });
    }

    // Validasi ID penugasan jika disertakan
    if (
      assignmentId !== undefined &&
      (
        !Number.isInteger(Number(assignmentId)) ||
        Number(assignmentId) <= 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "ID penugasan tidak valid",
      });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Data pendamping tidak ditemukan",
      });
    }

    const permission = await createPermission(
      mentor.id,
      reason,
      parsedStartAt,
      parsedEndAt,
      assignmentId === undefined
        ? undefined
        : Number(assignmentId)
    );

    return res.status(201).json({
      success: true,
      message: "Pengajuan izin berhasil dikirim",
      data: permission,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    const statusCode =
      message === "Pendamping tidak ditemukan" ||
      message ===
        "Penugasan tidak ditemukan atau bukan milik pendamping tersebut"
        ? 404
        : 400;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

// Melihat riwayat izin pendamping yang sedang login
export async function getMentorPermissionHistoryController(
  req: Request,
  res: Response
) {
  try {
    if (!req.user || req.user.role !== "MENTOR") {
      return res.status(403).json({
        success: false,
        message: "Hanya pendamping yang dapat melihat riwayat izinnya",
      });
    }

    const mentor = await prisma.mentor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Data pendamping tidak ditemukan",
      });
    }

    const permissions = await getMentorPermissionHistory(mentor.id);

    return res.status(200).json({
      success: true,
      message: "Riwayat izin berhasil diambil",
      data: permissions,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

// Admin memantau pengajuan izin yang menunggu pemrosesan
export async function getPendingPermissionsController(
  req: Request,
  res: Response
) {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Hanya admin yang dapat memantau pengajuan izin",
      });
    }

    const permissions = await getPendingPermissions();

    return res.status(200).json({
      success: true,
      message: "Daftar pengajuan izin berhasil diambil",
      data: permissions,
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
