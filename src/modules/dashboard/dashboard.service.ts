
import { prisma } from "../../config/prisma";

// =====================================================
// KONFIGURASI WAKTU INDONESIA
// =====================================================

const TIME_ZONE = "Asia/Jakarta";
const WIB_OFFSET = 7 * 60 * 60 * 1000;

function getJakartaDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
  };
}

// Mengubah tengah malam WIB menjadi waktu UTC.
function jakartaMidnight(
  year: number,
  month: number,
  day: number
): Date {
  return new Date(
    Date.UTC(year, month - 1, day) - WIB_OFFSET
  );
}

function getJakartaWeekday(
  year: number,
  month: number,
  day: number
) {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

// =====================================================
// HELPER DURASI PENDAMPINGAN
// =====================================================

function calculateTotalHours(
  assignments: { startAt: Date; endAt: Date }[]
): number {
  const totalMilliseconds = assignments.reduce(
    (total, assignment) => {
      const duration =
        assignment.endAt.getTime() -
        assignment.startAt.getTime();

      return total + Math.max(0, duration);
    },
    0
  );

  return Number(
    (totalMilliseconds / (1000 * 60 * 60)).toFixed(2)
  );
}

// =====================================================
// HELPER RENTANG TAHUN AKADEMIK JULI - JUNI
// =====================================================

function getAcademicYearRange(referenceDate = new Date()) {
  const { year, month } = getJakartaDateParts(referenceDate);

  const startYear = month >= 7 ? year : year - 1;

  return {
    start: jakartaMidnight(startYear, 7, 1),
    end: jakartaMidnight(startYear + 1, 7, 1),
  };
}

// =====================================================
// HELPER RENTANG GRAFIK
// =====================================================

type DashboardPeriod = "weekly" | "monthly" | "semester";

function getChartRange(
  period: DashboardPeriod,
  referenceDate = new Date()
) {
  const { year, month, day } =
    getJakartaDateParts(referenceDate);

  if (period === "semester") {
    return getAcademicYearRange(referenceDate);
  }

  if (period === "monthly") {
    return {
      start: jakartaMidnight(year, month, 1),
      end:
        month === 12
          ? jakartaMidnight(year + 1, 1, 1)
          : jakartaMidnight(year, month + 1, 1),
    };
  }

  // Minggu dimulai Senin dan berakhir Minggu.
  const weekday = getJakartaWeekday(year, month, day);
  const daysSinceMonday = (weekday + 6) % 7;

  const localDate = new Date(
    Date.UTC(year, month - 1, day - daysSinceMonday)
  );

  const mondayYear = localDate.getUTCFullYear();
  const mondayMonth = localDate.getUTCMonth() + 1;
  const mondayDay = localDate.getUTCDate();

  const nextMonday = new Date(
    Date.UTC(
      mondayYear,
      mondayMonth - 1,
      mondayDay + 7
    )
  );

  return {
    start: jakartaMidnight(
      mondayYear,
      mondayMonth,
      mondayDay
    ),
    end: jakartaMidnight(
      nextMonday.getUTCFullYear(),
      nextMonday.getUTCMonth() + 1,
      nextMonday.getUTCDate()
    ),
  };
}

// =====================================================
// HELPER BUCKET GRAFIK
// =====================================================

interface ChartBucket {
  label: string;
  start: Date;
  end: Date;
  totalHours: number;
  totalActivities: number;
}

function createChartBuckets(
  period: DashboardPeriod,
  start: Date
): ChartBucket[] {
  const buckets: ChartBucket[] = [];

  // GRAFIK SEMESTER: JULI - JUNI
  if (period === "semester") {
    const startYear = getJakartaDateParts(start).year;

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        Date.UTC(startYear, 6 + i, 1)
      );

      const nextDate = new Date(
        Date.UTC(startYear, 7 + i, 1)
      );

      buckets.push({
        label: new Intl.DateTimeFormat("id-ID", {
          month: "short",
          timeZone: TIME_ZONE,
        }).format(date),

        start: jakartaMidnight(
          date.getUTCFullYear(),
          date.getUTCMonth() + 1,
          1
        ),

        end: jakartaMidnight(
          nextDate.getUTCFullYear(),
          nextDate.getUTCMonth() + 1,
          1
        ),

        totalHours: 0,
        totalActivities: 0,
      });
    }

    return buckets;
  }

  // GRAFIK BULANAN: TANGGAL 1 - AKHIR BULAN
  if (period === "monthly") {
    const { year, month } = getJakartaDateParts(start);

    const totalDays = new Date(
      Date.UTC(year, month, 0)
    ).getUTCDate();

    for (let i = 1; i <= totalDays; i++) {
      buckets.push({
        label: String(i),
        start: jakartaMidnight(year, month, i),
        end: jakartaMidnight(year, month, i + 1),
        totalHours: 0,
        totalActivities: 0,
      });
    }

    return buckets;
  }

  // GRAFIK MINGGUAN: SENIN - MINGGU
  for (let i = 0; i < 7; i++) {
    const date = new Date(
      start.getTime() + i * 24 * 60 * 60 * 1000
    );

    const nextDate = new Date(
      date.getTime() + 24 * 60 * 60 * 1000
    );

    buckets.push({
      label: new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        timeZone: TIME_ZONE,
      }).format(date),

      start: date,
      end: nextDate,
      totalHours: 0,
      totalActivities: 0,
    });
  }

  return buckets;
}

// =====================================================
// HELPER PENGAMBILAN DATA PENDAMPINGAN SELESAI
// =====================================================

async function getCompletedAssignments(
  start: Date,
  end: Date
) {
  return prisma.assignment.findMany({
    where: {
      status: "COMPLETED",

      startAt: {
        gte: start,
        lt: end,
      },

      attendance: {
        isNot: null,
      },
    },

    select: {
      startAt: true,
      endAt: true,
    },
  });
}

// =====================================================
// 1. STATISTIK UTAMA DASHBOARD
// =====================================================

async function getSummary() {
  const [
    totalStudents,
    totalMentors,
    totalAssignments,
    pendingPermissions,
    completedAssignments,
    disabilityGroups,
  ] = await Promise.all([
    prisma.student.count(),

    // Semua pendamping terdaftar.
    prisma.mentor.count(),

    prisma.assignment.count(),

    prisma.permission.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.assignment.findMany({
      where: {
        status: "COMPLETED",
        attendance: {
          isNot: null,
        },
      },

      select: {
        startAt: true,
        endAt: true,
      },
    }),

    prisma.student.groupBy({
      by: ["disabilityType"],
      _count: {
        _all: true,
      },
    }),
  ]);

  return {
    totalStudents,
    totalMentors,
    totalAssignments,
    pendingPermissions,

    totalCompletedHours:
      calculateTotalHours(completedAssignments),

    disabilityBreakdown: disabilityGroups.map((item) => ({
      disabilityType:
        item.disabilityType ?? "Belum ditentukan",

      total: item._count._all,
    })),
  };
}

// =====================================================
// 2. GRAFIK STATISTIK PENDAMPINGAN
// =====================================================

async function getPendampinganStats(
  period: DashboardPeriod = "semester"
) {
  const { start, end } = getChartRange(period);

  
const { year, month, day } = getJakartaDateParts(start);

let previousStart: Date;

if (period === "semester") {
  // Periode akademik sebelumnya: Juli-Juni.
  previousStart = jakartaMidnight(year - 1, 7, 1);
} else if (period === "monthly") {
  // Bulan kalender sebelumnya.
  previousStart = jakartaMidnight(year, month - 1, 1);
} else {
  // Tujuh hari sebelum awal minggu ini.
  previousStart = jakartaMidnight(year, month, day - 7);
}


  const [assignments, previousAssignments] =
    await Promise.all([
      getCompletedAssignments(start, end),
      getCompletedAssignments(previousStart, start),
    ]);

  const chart = createChartBuckets(period, start);

  for (const assignment of assignments) {
    const bucket = chart.find(
      (item) =>
        assignment.startAt >= item.start &&
        assignment.startAt < item.end
    );

    if (bucket) {
      const hours =
        (assignment.endAt.getTime() -
          assignment.startAt.getTime()) /
        (1000 * 60 * 60);

      bucket.totalHours += Math.max(0, hours);
      bucket.totalActivities++;
    }
  }

  const totalHours = calculateTotalHours(assignments);

  const previousTotalHours =
    calculateTotalHours(previousAssignments);

  const percentageChange =
    previousTotalHours === 0
      ? null
      : Number(
          (
            ((totalHours - previousTotalHours) /
              previousTotalHours) *
            100
          ).toFixed(2)
        );

  return {
    period,

    startDate: start.toISOString(),

    endDate: new Date(
      end.getTime() - 1
    ).toISOString(),

    totalHours,
    totalActivities: assignments.length,
    previousTotalHours,
    percentageChange,

    chart: chart.map((item) => ({
      label: item.label,
      totalHours: Number(item.totalHours.toFixed(2)),
      totalActivities: item.totalActivities,
    })),
  };
}

// =====================================================
// 3. KALENDER PENDAMPINGAN
// =====================================================

async function getCalendar(month?: string) {
  const currentDate = getJakartaDateParts();

  const selectedMonth =
    month ??
    `${currentDate.year}-${String(currentDate.month).padStart(2, "0")}`;

  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(selectedMonth)) {
    throw new Error(
      "Format bulan tidak valid. Gunakan YYYY-MM."
    );
  }

  const [year, monthNumber] = selectedMonth
    .split("-")
    .map(Number);

  const start = jakartaMidnight(year, monthNumber, 1);

  const end =
    monthNumber === 12
      ? jakartaMidnight(year + 1, 1, 1)
      : jakartaMidnight(year, monthNumber + 1, 1);

  const assignments = await prisma.assignment.findMany({
    where: {
      startAt: {
        gte: start,
        lt: end,
      },
    },

    orderBy: {
      startAt: "asc",
    },

    include: {
      student: {
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },

      mentor: {
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  return assignments.map((assignment) => ({
    id: assignment.id,
    startAt: assignment.startAt,
    endAt: assignment.endAt,
    location: assignment.location,
    status: assignment.status,

    studentName: assignment.student.user.fullName,
    mentorName: assignment.mentor.user.fullName,
  }));
}

// =====================================================
// 4. PENGAJUAN PERIZINAN
// =====================================================

async function getPermissions() {
  const [pendingCount, permissions] = await Promise.all([
    prisma.permission.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.permission.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 10,

      include: {
        mentor: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    pendingCount,

    permissions: permissions.map((permission) => ({
      id: permission.id,
      mentorName: permission.mentor.user.fullName,
      reason: permission.reason,
      startAt: permission.startAt,
      endAt: permission.endAt,
      status: permission.status,
      createdAt: permission.createdAt,
    })),
  };
}

// =====================================================
// 5. STATISTIK PENDAMPING
// =====================================================

async function getMentorStats() {
  const now = new Date();
  const { year, month, day } = getJakartaDateParts(now);

  const start = jakartaMidnight(year, month, day);
  const end = jakartaMidnight(year, month, day + 1);

  const [totalMentors, assignmentsToday] = await Promise.all([
    prisma.mentor.count(),

    prisma.assignment.findMany({
      where: {
        startAt: {
          gte: start,
          lt: end,
        },
      },

      select: {
        mentorId: true,
      },
    }),
  ]);

  const activeMentorIds = new Set(
    assignmentsToday.map((item) => item.mentorId)
  );

  return {
    totalMentors,
    mentorsWithAssignmentsToday: activeMentorIds.size,
    totalAssignmentsToday: assignmentsToday.length,
  };
}

// =====================================================
// EXPORT DASHBOARD SERVICE
// =====================================================

export const dashboardService = {
  getSummary,
  getPendampinganStats,
  getCalendar,
  getPermissions,
  getMentorStats,
};
