import prisma from "../../config/prisma";

export type CreateScheduleInput = {
  courseName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
};

const scheduleSelect = {
  id: true,
  courseName: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  location: true,
  createdAt: true,
} as const;

// userId berasal dari login (atau dev auth), BUKAN dari body request.
export async function createScheduleForUser(userId: number, input: CreateScheduleInput) {
  return prisma.classSchedule.create({
    data: { userId, ...input },
    select: scheduleSelect,
  });
}

export async function listSchedulesByUserId(userId: number) {
  return prisma.classSchedule.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    select: scheduleSelect,
  });
}