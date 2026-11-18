
import { prisma } from "../../config/prisma";

// =====================================================
// HELPER PERHITUNGAN REKAP
// =====================================================

// Hanya kegiatan selesai yang sudah dikonfirmasi.
const completedAssignmentFilter = {
  status: "COMPLETED" as const,
  attendance: {
    isNot: null,
  },
};

function calculateDurationMinutes(
  startAt: Date,
  endAt: Date
): number {
  const milliseconds = endAt.getTime() - startAt.getTime();

  // Menghindari durasi negatif.
  return Math.max(0, milliseconds / (1000 * 60));
}

function roundHours(minutes: number): number {
  return Number((minutes / 60).toFixed(2));
}

// =====================================================
// 1. DAFTAR REKAP SELURUH VOLUNTEER (ADMIN)
// =====================================================

export async function getAllVolunteerRecaps() {
  const mentors = await prisma.mentor.findMany({
    select: {
      id: true,
      userId: true,
      studentCode: true,
      department: true,
      user: {
        select: {
          fullName: true,
          email: true,
          photoUrl: true,
        },
      },
      assignments: {
        where: completedAssignmentFilter,
        select: {
          startAt: true,
          endAt: true,
        },
      },
    },
  });

  const data = mentors.map((mentor) => {
    const totalMinutes = mentor.assignments.reduce(
      (sum, assignment) =>
        sum +
        calculateDurationMinutes(
          assignment.startAt,
          assignment.endAt
        ),
      0
    );

    return {
      mentorId: mentor.id,
      userId: mentor.userId,
      nim: mentor.studentCode,
      fullName: mentor.user.fullName,
      email: mentor.user.email,
      photoUrl: mentor.user.photoUrl,
      department: mentor.department,
      totalActivities: mentor.assignments.length,
      totalHours: roundHours(totalMinutes),
    };
  });

  // Urutkan berdasarkan total jam terbanyak.
  data.sort((a, b) => b.totalHours - a.totalHours);

  return {
    totalVolunteers: data.length,
    volunteers: data,
  };
}

// =====================================================
// 2. DETAIL REKAP DAN AKTIVITAS SATU VOLUNTEER
// =====================================================

export async function getVolunteerRecapById(
  mentorId: number
) {
  const mentor = await prisma.mentor.findUnique({
    where: {
      id: mentorId,
    },
    select: {
      id: true,
      userId: true,
      studentCode: true,
      department: true,
      skills: true,
      user: {
        select: {
          fullName: true,
          email: true,
          photoUrl: true,
        },
      },
      assignments: {
        where: completedAssignmentFilter,
        orderBy: {
          startAt: "desc",
        },
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
                  fullName: true,
                },
              },
            },
          },
          attendance: {
            select: {
              confirmedAt: true,
              notes: true,
            },
          },
        },
      },
    },
  });

  if (!mentor) {
    return null;
  }

  const activities = mentor.assignments.map(
    (assignment) => {
      const durationMinutes = calculateDurationMinutes(
        assignment.startAt,
        assignment.endAt
      );

      return {
        assignmentId: assignment.id,
        studentId: assignment.student.id,
        studentName: assignment.student.user.fullName,
        startAt: assignment.startAt,
        endAt: assignment.endAt,
        location: assignment.location,
        status: assignment.status,
        confirmedAt: assignment.attendance?.confirmedAt,
        notes: assignment.attendance?.notes,
        durationHours: roundHours(durationMinutes),
      };
    }
  );

  const totalMinutes = mentor.assignments.reduce(
    (sum, assignment) =>
      sum +
      calculateDurationMinutes(
        assignment.startAt,
        assignment.endAt
      ),
    0
  );

  return {
    mentorId: mentor.id,
    userId: mentor.userId,
    nim: mentor.studentCode,
    fullName: mentor.user.fullName,
    email: mentor.user.email,
    photoUrl: mentor.user.photoUrl,
    department: mentor.department,
    skills: mentor.skills,
    totalActivities: activities.length,
    totalHours: roundHours(totalMinutes),
    activities,
  };
}

// =====================================================
// 3. REKAP PRIBADI PENDAMPING (MENTOR)
// =====================================================

export async function getMyVolunteerRecap(
  userId: number
) {
  const mentor = await prisma.mentor.findUnique({
    where: {
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!mentor) {
    return null;
  }

  return getVolunteerRecapById(mentor.id);
}

// =====================================================
// EXPORT SERVICE
// =====================================================

export const recapsService = {
  getAllVolunteerRecaps,
  getVolunteerRecapById,
  getMyVolunteerRecap,
};
