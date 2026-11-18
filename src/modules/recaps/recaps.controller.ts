
import type { Request, Response } from "express";
import { recapsService } from "./recaps.service";

// Kontrak identitas dari middleware JWT tim.
// id harus menggunakan User.id, bukan Mentor.id.
type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    role: "STUDENT" | "MENTOR" | "ADMIN";
  };
};

function sendError(
  res: Response,
  status: number,
  message: string
) {
  return res.status(status).json({
    success: false,
    message,
  });
}

// =====================================================
// 1. DAFTAR REKAP SELURUH VOLUNTEER — ADMIN
// =====================================================

export async function getAllRecaps(
  req: Request,
  res: Response
) {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    return sendError(res, 401, "Silakan login terlebih dahulu.");
  }

  if (user.role !== "ADMIN") {
    return sendError(res, 403, "Akses hanya untuk admin.");
  }

  try {
    const data = await recapsService.getAllVolunteerRecaps();

    return res.status(200).json({
      success: true,
      message: "Rekap volunteer berhasil diambil.",
      data,
    });
  } catch (error) {
    console.error("Recaps list error:", error);

    return sendError(
      res,
      500,
      "Gagal mengambil rekap volunteer."
    );
  }
}

// =====================================================
// 2. DETAIL REKAP SATU VOLUNTEER — ADMIN
// =====================================================

export async function getRecapDetail(
  req: Request,
  res: Response
) {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    return sendError(res, 401, "Silakan login terlebih dahulu.");
  }

  if (user.role !== "ADMIN") {
    return sendError(res, 403, "Akses hanya untuk admin.");
  }

  const rawId = req.params.id;

  if (
    typeof rawId !== "string" ||
    !/^[1-9]\d*$/.test(rawId)
  ) {
    return sendError(res, 400, "ID pendamping tidak valid.");
  }

  const mentorId = Number(rawId);

  if (!Number.isSafeInteger(mentorId)) {
    return sendError(res, 400, "ID pendamping tidak valid.");
  }

  try {
    const data = await recapsService.getVolunteerRecapById(
      mentorId
    );

    if (!data) {
      return sendError(
        res,
        404,
        "Data pendamping tidak ditemukan."
      );
    }

    return res.status(200).json({
      success: true,
      message: "Detail rekap volunteer berhasil diambil.",
      data,
    });
  } catch (error) {
    console.error("Recaps detail error:", error);

    return sendError(
      res,
      500,
      "Gagal mengambil detail rekap volunteer."
    );
  }
}

// =====================================================
// 3. REKAP PRIBADI — MENTOR
// =====================================================

export async function getMyRecap(
  req: Request,
  res: Response
) {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    return sendError(res, 401, "Silakan login terlebih dahulu.");
  }

  if (user.role !== "MENTOR") {
    return sendError(
      res,
      403,
      "Akses hanya untuk pendamping."
    );
  }

  try {
    const data = await recapsService.getMyVolunteerRecap(
      user.id
    );

    if (!data) {
      return sendError(
        res,
        404,
        "Profil pendamping tidak ditemukan."
      );
    }

    return res.status(200).json({
      success: true,
      message: "Rekap pribadi berhasil diambil.",
      data,
    });
  } catch (error) {
    console.error("My recap error:", error);

    return sendError(
      res,
      500,
      "Gagal mengambil rekap pribadi."
    );
  }
}
