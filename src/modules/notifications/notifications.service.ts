
import prisma from "../../config/prisma";
import { AppError } from "../../utils/appError";

// Field notifikasi yang boleh dikirim ke frontend
const notificationSelect = {
  id: true,
  title: true,
  body: true,
  readAt: true,
  createdAt: true,
} as const;

// API 1: Mengambil daftar notifikasi milik pengguna
export async function listNotificationsByUserId(
  userId: number,
  params: { page: number; limit: number }
) {
  const { page, limit } = params;
  const where = { userId };

  const [total, rows] = await Promise.all([
    prisma.notification.count({ where }),

    prisma.notification.findMany({
      where,
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: notificationSelect,
    }),
  ]);

  return {
    items: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Fungsi bersama untuk mengubah status dibaca
async function setNotificationReadState(
  userId: number,
  notificationId: number,
  read: boolean
) {
  // Pastikan notifikasi milik pengguna yang login
  const where = {
    id: notificationId,
    userId,
  };

  const existing = await prisma.notification.findFirst({
    where,
    select: notificationSelect,
  });

  if (!existing) {
    throw new AppError(
      404,
      "Notifikasi tidak ditemukan"
    );
  }

  // Jika statusnya sudah sesuai, tidak perlu update
  if ((existing.readAt !== null) === read) {
    return existing;
  }

  // Update tetap memeriksa kepemilikan notifikasi
  const result = await prisma.notification.updateMany({
    where: {
      ...where,
      readAt: read ? null : { not: null },
    },
    data: {
      readAt: read ? new Date() : null,
    },
  });

  // Jika ada perubahan bersamaan dari request lain
  if (result.count === 0) {
    const latest = await prisma.notification.findFirst({
      where,
      select: notificationSelect,
    });

    if (!latest) {
      throw new AppError(
        404,
        "Notifikasi tidak ditemukan"
      );
    }

    return latest;
  }

  const updated = await prisma.notification.findFirst({
    where,
    select: notificationSelect,
  });

  if (!updated) {
    throw new AppError(
      404,
      "Notifikasi tidak ditemukan"
    );
  }

  return updated;
}

// API 2: Tandai notifikasi sudah dibaca
export async function markNotificationAsRead(
  userId: number,
  notificationId: number
) {
  return setNotificationReadState(
    userId,
    notificationId,
    true
  );
}

// API 3: Tandai notifikasi belum dibaca
export async function markNotificationAsUnread(
  userId: number,
  notificationId: number
) {
  return setNotificationReadState(
    userId,
    notificationId,
    false
  );
}
