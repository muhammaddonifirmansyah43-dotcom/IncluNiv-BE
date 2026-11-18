import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";

// Dipasang SETELAH semua route: untuk URL yang tidak ada.
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}

// Dipasang paling akhir. Express mengenali error handler dari 4 parameternya.
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Error yang kita lempar sendiri (misalnya 403, 404)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // Validasi zod gagal
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors: err.issues.map((issue) => ({
        field: issue.path.map(String).join("."),
        message: issue.message,
      })),
    });
  }

  // Body JSON dari client rusak (misalnya koma kelebihan)
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type?: string }).type === "entity.parse.failed"
  ) {
    return res.status(400).json({
      success: false,
      message: "Format JSON tidak valid",
    });
  }

  // Error tak terduga: detail hanya di terminal, tidak dibocorkan ke client
  console.error("[ERROR]", err);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
}