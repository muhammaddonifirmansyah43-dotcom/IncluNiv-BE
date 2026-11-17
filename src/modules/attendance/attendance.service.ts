import { prisma } from "../../config/prisma";

// Mentor mengonfirmasi bahwa pendampingan telah selesai
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
      throw new Error("Status penugasan telah berubah, silakan coba lagi");
    }

    return {
      attendance,
      assignment: await tx.assignment.findUnique({
        where: { id: assignmentId },
      }),
    };
  });
}

// Melihat data konfirmasi kehadiran milik mentor yang login
export async function getMentorAttendanceHistory(userId: number) {
  const mentor = await prisma.mentor.findUnique({
    where: { userId },
  });

  if (!mentor) {
    throw new Error("Data pendamping tidak ditemukan");
  }

  return prisma.attendance.findMany({
    where: {
      assignment: {
        mentorId: mentor.id,
      },
    },
    include: {
      assignment: {
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      confirmedAt: "desc",
    },
  });
}
