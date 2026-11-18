
import { prisma } from "../../config/prisma";

// Mengajukan izin pendamping
export async function createPermission(
  mentorId: number,
  reason: string,
  startAt: Date,
  endAt: Date,
  assignmentId?: number
) {
  // Validasi rentang waktu
  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    startAt >= endAt
  ) {
    throw new Error("Rentang waktu izin tidak valid");
  }

  // Validasi alasan izin
  if (!reason || !reason.trim()) {
    throw new Error("Alasan izin wajib diisi");
  }

  // Periksa keberadaan pendamping
  const mentor = await prisma.mentor.findUnique({
    where: {
      id: mentorId,
    },
  });

  if (!mentor) {
    throw new Error("Pendamping tidak ditemukan");
  }

  // Jika izin berkaitan dengan penugasan tertentu
  if (assignmentId !== undefined) {
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        mentorId,
      },
    });

    if (!assignment) {
      throw new Error(
        "Penugasan tidak ditemukan atau bukan milik pendamping tersebut"
      );
    }
  }

  // Simpan pengajuan izin dengan status PENDING
  return prisma.permission.create({
    data: {
      mentorId,
      assignmentId,
      reason: reason.trim(),
      startAt,
      endAt,
      status: "PENDING",
    },
  });
}

// Memperbarui keputusan izin berdasarkan hasil pemrosesan AI
export async function updatePermissionDecision(
  permissionId: number,
  decision: "APPROVED" | "REJECTED"
) {
  // Periksa apakah pengajuan izin tersedia
  const permission = await prisma.permission.findUnique({
    where: {
      id: permissionId,
    },
  });

  if (!permission) {
    throw new Error("Pengajuan izin tidak ditemukan");
  }

  // Hanya izin yang masih menunggu yang dapat diproses
  if (permission.status !== "PENDING") {
    throw new Error("Pengajuan izin sudah pernah diproses");
  }

  // Simpan keputusan
  return prisma.permission.update({
    where: {
      id: permissionId,
    },
    data: {
      status: decision,
    },
  });
}

// Mengambil seluruh pengajuan izin yang menunggu pemrosesan AI
export async function getPendingPermissions() {
  return prisma.permission.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      mentor: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
      assignment: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

// Mengambil riwayat pengajuan izin berdasarkan pendamping
export async function getMentorPermissionHistory(mentorId: number) {
  // Periksa keberadaan pendamping
  const mentor = await prisma.mentor.findUnique({
    where: {
      id: mentorId,
    },
  });

  if (!mentor) {
    throw new Error("Pendamping tidak ditemukan");
  }

  // Ambil seluruh riwayat izin pendamping
  return prisma.permission.findMany({
    where: {
      mentorId,
    },
    include: {
      assignment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
