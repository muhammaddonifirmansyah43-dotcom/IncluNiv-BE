import { prisma } from "../../config/prisma";

export interface CreateScheduleInput {
  courseName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string | null;
}

type ScheduleInput = CreateScheduleInput;

const scheduleSelect = {
  id: true,
  courseName: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  location: true,
  createdAt: true,
} as const;

function validateSchedule(data: ScheduleInput) {
  if (!data.courseName || !data.courseName.trim()) {
    throw new Error("Nama mata kuliah wajib diisi");
  }

  if (
    !Number.isInteger(data.dayOfWeek) ||
    data.dayOfWeek < 0 ||
    data.dayOfWeek > 6
  ) {
    throw new Error("Hari harus berupa angka 0 sampai 6 (Minggu sampai Sabtu)");
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (
    !timePattern.test(data.startTime) ||
    !timePattern.test(data.endTime)
  ) {
    throw new Error("Format waktu harus HH:mm");
  }

  if (data.startTime >= data.endTime) {
    throw new Error("Jam selesai harus setelah jam mulai");
  }

  if (
    data.location !== undefined &&
    data.location !== null &&
    typeof data.location !== "string"
  ) {
    throw new Error("Lokasi harus berupa teks");
  }
}

async function checkScheduleConflict(
  userId: number,
  data: ScheduleInput,
  excludeId?: number
) {
  const conflict = await prisma.classSchedule.findFirst({
    where: {
      userId,
      dayOfWeek: data.dayOfWeek,
      ...(excludeId !== undefined
        ? { id: { not: excludeId } }
        : {}),
      startTime: {
        lt: data.endTime,
      },
      endTime: {
        gt: data.startTime,
      },
    },
  });

  if (conflict) {
    throw new Error("Jadwal kuliah bertabrakan dengan jadwal lain");
  }
}

export async function createSchedule(
  userId: number,
  data: ScheduleInput
) {
  validateSchedule(data);
  await checkScheduleConflict(userId, data);

  return prisma.classSchedule.create({
    data: {
      userId,
      courseName: data.courseName.trim(),
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      location: data.location?.trim() || null,
    },
    select: scheduleSelect,
  });
}

export async function getMySchedules(userId: number) {
  return prisma.classSchedule.findMany({
    where: { userId },
    orderBy: [
      { dayOfWeek: "asc" },
      { startTime: "asc" },
    ],
    select: scheduleSelect,
  });
}

export async function updateSchedule(
  scheduleId: number,
  userId: number,
  data: Partial<ScheduleInput>
) {
  const existingSchedule = await prisma.classSchedule.findFirst({
    where: {
      id: scheduleId,
      userId,
    },
  });

  if (!existingSchedule) {
    throw new Error("Jadwal tidak ditemukan atau bukan milik Anda");
  }

  const updatedData: ScheduleInput = {
    courseName: data.courseName ?? existingSchedule.courseName,
    dayOfWeek: data.dayOfWeek ?? existingSchedule.dayOfWeek,
    startTime: data.startTime ?? existingSchedule.startTime,
    endTime: data.endTime ?? existingSchedule.endTime,
    location:
      data.location !== undefined
        ? data.location
        : existingSchedule.location,
  };

  validateSchedule(updatedData);
  await checkScheduleConflict(userId, updatedData, scheduleId);

  return prisma.classSchedule.update({
    where: { id: scheduleId },
    data: {
      courseName: updatedData.courseName.trim(),
      dayOfWeek: updatedData.dayOfWeek,
      startTime: updatedData.startTime,
      endTime: updatedData.endTime,
      location: updatedData.location?.trim() || null,
    },
    select: scheduleSelect,
  });
}

export async function deleteSchedule(
  scheduleId: number,
  userId: number
) {
  const existingSchedule = await prisma.classSchedule.findFirst({
    where: {
      id: scheduleId,
      userId,
    },
  });

  if (!existingSchedule) {
    throw new Error("Jadwal tidak ditemukan atau bukan milik Anda");
  }

  return prisma.classSchedule.delete({
    where: { id: scheduleId },
    select: scheduleSelect,
  });
}