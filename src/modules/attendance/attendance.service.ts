
import { prisma } from "../../config/prisma";

// Data relasi yang ditampilkan pada riwayat pelaksanaan.
const attendanceSelect = {
  id: true,
  assignmentId: true,
  confirmedAt: true,
  notes: true,
  assignment: {
    select: {
      id: true,
      startAt: true,
      endAt: true,
      location: true,
      status: true,
      student: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
              photoUrl: true,
            },
          },
        },
      },
      mentor: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              fullName: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  },
} as const;

// =====================================================
// 1. KONFIRMASI KEHADIRAN OLEH MENTOR
// =====================================================

export async function confirmAttendance(
  assignmentId: number,
  userId: number,
  notes?: string
) {
  if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
    throw new Error("ID penugasan tidak valid");
  }

  const mentor = await prisma.mentor.findUnique({
    where: { userId },
  });

  if (!mentor) {
    throw new Error("Data pendamping tidak ditemukan");
  }

  return prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findFirst({
      where: {
        id: assignmentId,
        mentorId: mentor.id,
      },
    });

    if (!assignment) {
      throw new Error("Penugasan tidak ditemukan atau bukan milik Anda");
    }

    if (!["ACCEPTED", "ONGOING"].includes(assignment.status)) {
      throw new Error(
        "Penugasan belum diterima atau sudah diselesaikan"
      );
    }

    const existingAttendance = await tx.attendance.findUnique({
      where: { assignmentId },
    });

    if (existingAttendance) {
      throw new Error("Konfirmasi kehadiran sudah dilakukan");
    }

    const attendance = await tx.attendance.create({
      data: {
        assignmentId,
        notes: notes?.trim() || null,
      },
    });

    const updatedAssignment = await tx.assignment.updateMany({
      where: {
        id: assignmentId,
        mentorId: mentor.id,
        status: assignment.status,
      },
      data: {
        status: "COMPLETED",
      },
    });

    if (updatedAssignment.count === 0) {
      throw new Error(
        "Status penugasan telah berubah, silakan coba lagi"
      );
    }

    return {
      attendance,
      assignment: await tx.assignment.findUnique({
        where: { id: assignmentId },
      }),
    };
  });
}

// =====================================================
// 2. RIWAYAT SELURUH PELAKSANAAN (ADMIN)
// =====================================================

export const getAllAttendanceHistory = async () => {
  return prisma.attendance.findMany({
    where: {
      assignment: {
        status: "COMPLETED",
      },
    },
    select: attendanceSelect,
    orderBy: {
      confirmedAt: "desc",
    },
  });
};

// =====================================================
// 3. DETAIL RIWAYAT (ADMIN)
// =====================================================

export const getAttendanceHistoryById = async (
  attendanceId: number
) => {
  return prisma.attendance.findFirst({
    where: {
      id: attendanceId,
      assignment: {
        status: "COMPLETED",
      },
    },
    select: attendanceSelect,
  });
};

// =====================================================
// 4. RIWAYAT MAHASISWA
// =====================================================

export const getStudentAttendanceHistory = async (
  userId: number
) => {
  return prisma.attendance.findMany({
    where: {
      assignment: {
        status: "COMPLETED",
        student: {
          userId,
        },
      },
    },
    select: attendanceSelect,
    orderBy: {
      confirmedAt: "desc",
    },
  });
};

// =====================================================
// 5. RIWAYAT PENDAMPING
// =====================================================

export const getMentorAttendanceHistory = async (
  userId: number
) => {
  return prisma.attendance.findMany({
    where: {
      assignment: {
        status: "COMPLETED",
        mentor: {
          userId,
        },
      },
    },
    select: attendanceSelect,
    orderBy: {
      confirmedAt: "desc",
    },
  });
};
