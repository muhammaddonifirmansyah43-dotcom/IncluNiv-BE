import { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Berhasil",
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}