import { Request, Response } from "express";
import { getAuthUser } from "../../middleware/authGuard";
import { sendSuccess } from "../../utils/response";
import { createScheduleForUser, listSchedulesByUserId } from "./schedules.service";
import { validateCreateSchedule } from "./schedules.validation";

export async function createMySchedule(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const input = validateCreateSchedule(req.body);
  const schedule = await createScheduleForUser(authUser.id, input);
  res.status(201);
  return sendSuccess(res, schedule, "Jadwal kuliah berhasil disimpan");
}

export async function getMySchedules(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const schedules = await listSchedulesByUserId(authUser.id);
  return sendSuccess(res, schedules, "Jadwal kuliah berhasil diambil");
}