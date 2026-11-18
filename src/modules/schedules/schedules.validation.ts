import { AppError } from "../../utils/appError";
import { CreateScheduleInput } from "./schedules.service";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateCreateSchedule(body: any): CreateScheduleInput {
  const { courseName, dayOfWeek, startTime, endTime, location } = body ?? {};

  if (typeof courseName !== "string" || courseName.trim() === "") {
    throw new AppError(400, "courseName wajib diisi");
  }
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
    throw new AppError(400, "dayOfWeek harus angka 1-7 (1 = Senin, 7 = Minggu)");
  }
  if (typeof startTime !== "string" || !TIME_REGEX.test(startTime)) {
    throw new AppError(400, "startTime harus berformat HH:mm, contoh 08:00");
  }
  if (typeof endTime !== "string" || !TIME_REGEX.test(endTime)) {
    throw new AppError(400, "endTime harus berformat HH:mm, contoh 09:40");
  }
  if (startTime >= endTime) {
    throw new AppError(400, "startTime harus lebih awal dari endTime");
  }
  if (location !== undefined && location !== null && typeof location !== "string") {
    throw new AppError(400, "location harus berupa teks");
  }

  return {
    courseName: courseName.trim(),
    dayOfWeek,
    startTime,
    endTime,
    location: typeof location === "string" && location.trim() !== "" ? location.trim() : null,
  };
}