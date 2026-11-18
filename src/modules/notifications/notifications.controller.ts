import { Request, Response } from "express";
import { getAuthUser } from "../../middleware/authGuard";
import { sendSuccess } from "../../utils/response";
import { parsePagination } from "../../utils/pagination";
import { listNotificationsByUserId } from "./notifications.service";

export async function getMyNotifications(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const { page, limit } = parsePagination(req.query);
  const result = await listNotificationsByUserId(authUser.id, { page, limit });
  return sendSuccess(res, result, "Daftar notifikasi berhasil diambil");
}