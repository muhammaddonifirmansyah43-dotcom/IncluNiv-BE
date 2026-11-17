
import { prisma } from "../../config/prisma";

// Menghitung kecocokan kebutuhan mahasiswa dengan keterampilan mentor
function calculateSkillMatch(
  supportNeeds: string | null,
  mentorSkills: string | null
) {
  const stopWords = new Set([
    "dan",
    "atau",
    "dengan",
    "untuk",
    "pada",
    "dalam",
    "yang",
    "mahasiswa",
    "disabilitas",
    "pendampingan",
    "pendamping",
    "kebutuhan",
    "bantuan",
  ]);

  const tokenize = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 1 && !stopWords.has(word));

  const needs = [...new Set(tokenize(supportNeeds ?? ""))];
  const skills = new Set(tokenize(mentorSkills ?? ""));

  const matchedSkills = needs.filter((skill) => skills.has(skill));

  const score =
    needs.length > 0
      ? Math.round((matchedSkills.length / needs.length) * 100)
      : 0;

  return {
    score,
    matchedSkills,
  };
}

export async function getStudentsForAssignment() {
  return prisma.student.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });
}

export async function getMentorsForAssignment() {
  return prisma.mentor.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });
}

export async function getMentorAvailability(
  mentorId: number,
  startAt: Date,
  endAt: Date
) {
  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    startAt >= endAt
  ) {
    throw new Error("Rentang waktu pendampingan tidak valid");
  }

  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    include: {
      user: {
        include: {
          classSchedules: true,
        },
      },
    },
  });

  if (!mentor) {
    throw new Error("Pendamping tidak ditemukan");
  }

  const dayOfWeek = startAt.getDay();

  const classScheduleConflict =
    mentor.user.classSchedules.some((schedule) => {
      if (schedule.dayOfWeek !== dayOfWeek) {
        return false;
      }

      const requestedStart =
        startAt.getHours() * 60 + startAt.getMinutes();

      const requestedEnd =
        endAt.getHours() * 60 + endAt.getMinutes();

      const classStart = schedule.startTime.split(":").map(Number);
      const classEnd = schedule.endTime.split(":").map(Number);

      const classStartMinutes =
        classStart[0] * 60 + classStart[1];

      const classEndMinutes =
        classEnd[0] * 60 + classEnd[1];

      return (
        requestedStart < classEndMinutes &&
        requestedEnd > classStartMinutes
      );
    });

  if (classScheduleConflict) {
    return {
      available: false,
      reason: "Pendamping memiliki jadwal kuliah pada waktu tersebut",
    };
  }

  const assignmentConflict = await prisma.assignment.findFirst({
    where: {
      mentorId,
      status: {
        in: ["PENDING", "ACCEPTED", "ONGOING"],
      },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (assignmentConflict) {
    return {
      available: false,
      reason: "Pendamping memiliki penugasan lain pada waktu tersebut",
    };
  }

  const permissionConflict = await prisma.permission.findFirst({
    where: {
      mentorId,
      status: {
        in: ["PENDING", "APPROVED"],
      },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  if (permissionConflict) {
    return {
      available: false,
      reason: "Pendamping memiliki pengajuan izin pada waktu tersebut",
    };
  }

  return {
    available: true,
    reason: "Pendamping tersedia pada waktu tersebut",
  };
}

export async function getEligibleMentorsForStudent(
  studentId: number,
  startAt: Date,
  endAt: Date
) {
  if (
    Number.isNaN(startAt.getTime()) ||
    Number.isNaN(endAt.getTime()) ||
    startAt >= endAt
  ) {
    throw new Error("Rentang waktu pendampingan tidak valid");
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error("Mahasiswa tidak ditemukan");
  }

  // Mengambil jadwal kuliah mahasiswa
  const studentSchedules = await prisma.classSchedule.findMany({
    where: {
      userId: student.userId,
    },
  });

  // Memeriksa bentrok jadwal kuliah mahasiswa
  const dayOfWeek = startAt.getDay();

  const requestedStart =
    startAt.getHours() * 60 + startAt.getMinutes();

  const requestedEnd =
    endAt.getHours() * 60 + endAt.getMinutes();

  const studentScheduleConflict = studentSchedules.some((schedule) => {
    if (schedule.dayOfWeek !== dayOfWeek) {
      return false;
    }

    const classStart = schedule.startTime.split(":").map(Number);
    const classEnd = schedule.endTime.split(":").map(Number);

    const classStartMinutes =
      classStart[0] * 60 + classStart[1];

    const classEndMinutes =
      classEnd[0] * 60 + classEnd[1];

    return (
      requestedStart < classEndMinutes &&
      requestedEnd > classStartMinutes
    );
  });

  // Jika mahasiswa memiliki jadwal kuliah yang bertabrakan
  if (studentScheduleConflict) {
    return {
      student: {
        id: student.id,
        fullName: student.user.fullName,
        supportNeeds: student.supportNeeds,
      },
      candidates: [],
      reason: "Mahasiswa memiliki jadwal kuliah pada waktu tersebut",
    };
  }

  // Mengambil seluruh mentor
  const mentors = await getMentorsForAssignment();

  // Memeriksa ketersediaan dan kecocokan keterampilan mentor
  const candidates = await Promise.all(
    mentors.map(async (mentor) => {
      const availability = await getMentorAvailability(
        mentor.id,
        startAt,
        endAt
      );

      const skillMatch = calculateSkillMatch(
        student.supportNeeds,
        mentor.skills
      );

      return {
        mentor,
        available: availability.available,
        reason: availability.reason,
        skillMatchScore: skillMatch.score,
        matchedSkills: skillMatch.matchedSkills,
      };
    })
  );

  // Hanya mentor tersedia yang menjadi kandidat,
  // kemudian diurutkan berdasarkan kecocokan keterampilan tertinggi
  const eligibleCandidates = candidates
    .filter((candidate) => candidate.available)
    .sort(
      (a, b) => b.skillMatchScore - a.skillMatchScore
    );

  return {
    student: {
      id: student.id,
      fullName: student.user.fullName,
      supportNeeds: student.supportNeeds,
    },
    candidates: eligibleCandidates,
    reason: "Pemeriksaan ketersediaan dan kecocokan keterampilan mentor selesai",
  };
}

export async function getAssignmentsForMonitoring() {
  return prisma.assignment.findMany({
    include: {
      student: {
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
      attendance: true,
      permissions: true,
    },
    orderBy: {
      startAt: "desc",
    },
  });
}

// Mentor menerima penugasan miliknya sendiri
export async function acceptAssignment(
  assignmentId: number,
  userId: number
) {
  const mentor = await prisma.mentor.findUnique({
    where: { userId },
  });

  if (!mentor) {
    throw new Error("Data pendamping tidak ditemukan");
  }

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      mentorId: mentor.id,
    },
  });

  if (!assignment) {
    throw new Error("Penugasan tidak ditemukan atau bukan milik Anda");
  }

  if (assignment.status !== "PENDING") {
    throw new Error("Penugasan tidak dapat diterima karena sudah diproses");
  }

  const result = await prisma.assignment.updateMany({
    where: {
      id: assignmentId,
      mentorId: mentor.id,
      status: "PENDING",
    },
    data: {
      status: "ACCEPTED",
      mentorAcceptedAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new Error("Penugasan sudah diproses oleh permintaan lain");
  }

  return prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
}
