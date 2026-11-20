
import type { Request, Response } from "express";

import { getAuthUser } from "../../middleware/authGuard";
import { AppError } from "../../utils/appError";
import { sendSuccess } from "../../utils/response";
import { parsePagination } from "../../utils/pagination";

import {
  listNotificationsByUserId,
  markNotificationAsRead,
  markNotificationAsUnread,
} from "./notifications.service";

// Validasi ID notifikasi
function parseNotificationId(
  value: string | string[]
): number {
  if (
    Array.isArray(value) ||
    !/^[1-9]\d*$/.test(value)
  ) {
    throw new AppError(
      400,
      "ID notifikasi tidak valid"
    );
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id)) {
    throw new AppError(
      400,
      "ID notifikasi tidak valid"
    );
  }

  return id;
}

// Controller 1: Daftar notifikasi
export async function getMyNotifications(
  req: Request,
  res: Response
) {
  const user = getAuthUser(req);

  const { page, limit } = parsePagination(req.query);

  const result = await listNotificationsByUserId(
    user.id,
    { page, limit }
  );

  return sendSuccess(
    res,
    result,
    "Daftar notifikasi berhasil diambil"
  );
}

// Controller 2: Tandai sudah dibaca
export async function markMyNotificationAsRead(
  req: Request,
  res: Response
) {
  const user = getAuthUser(req);
  const id = parseNotificationId(req.params.id);

  const notification = await markNotificationAsRead(
    user.id,
    id
  );

  return sendSuccess(
    res,
    notification,
    "Notifikasi berhasil ditandai sudah dibaca"
  );
}

// Controller 3: Tandai belum dibaca
export async function markMyNotificationAsUnread(
  req: Request,
  res: Response
) {
  const user = getAuthUser(req);
  const id = parseNotificationId(req.params.id);

  const notification = await markNotificationAsUnread(
    user.id,
    id
  );

  return sendSuccess(
    res,
    notification,
    "Notifikasi berhasil ditandai belum dibaca"
  );
}
