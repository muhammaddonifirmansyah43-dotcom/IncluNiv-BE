
import { prisma } from "../../config/prisma";

// =====================================================
// RELASI RIWAYAT PELAKSANAAN
// =====================================================

// Hanya mengambil kolom yang diperlukan.
// Tidak mengambil passwordHash atau data sensitif lain.
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
// 1. RIWAYAT SELURUH PELAKSANAAN (ADMIN)
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
// 2. DETAIL RIWAYAT BERDASARKAN ID
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
// 3. RIWAYAT MAHASISWA (USER ID)
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
// 4. RIWAYAT PENDAMPING (USER ID)
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
