import prisma from "../../config/prisma";

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
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        body: true,
        readAt: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    items: rows,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}