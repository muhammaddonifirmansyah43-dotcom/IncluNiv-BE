
import { Request, Response } from "express";

import {
  createSchedule,
  getMySchedules,
  updateSchedule,
  deleteSchedule,
} from "./schedules.service";

function getScheduleId(value: string | string[]): number | null {
  if (Array.isArray(value)) {
    return null;
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export async function createScheduleController(
  req: Request,
  res: Response
) {
  try {
    const { courseName, dayOfWeek, startTime, endTime, location } = req.body;

    if (
      typeof courseName !== "string" ||
      typeof dayOfWeek !== "number" ||
      typeof startTime !== "string" ||
      typeof endTime !== "string" ||
      (location !== undefined &&
        location !== null &&
        typeof location !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Data jadwal tidak lengkap atau formatnya tidak valid",
      });
    }

    const schedule = await createSchedule(req.user!.userId, {
      courseName,
      dayOfWeek,
      startTime,
      endTime,
      location,
    });

    return res.status(201).json({
      success: true,
      message: "Jadwal kuliah berhasil ditambahkan",
      data: schedule,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    const status = message.includes("bertabrakan") ? 409 : 400;

    return res.status(status).json({
      success: false,
      message,
    });
  }
}

export async function getMySchedulesController(
  req: Request,
  res: Response
) {
  try {
    const schedules = await getMySchedules(req.user!.userId);

    return res.status(200).json({
      success: true,
      message: "Jadwal kuliah berhasil diambil",
      data: schedules,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil jadwal kuliah",
    });
  }
}

export async function updateScheduleController(
  req: Request,
  res: Response
) {
  try {
    const scheduleId = getScheduleId(req.params.id);

    if (scheduleId === null) {
      return res.status(400).json({
        success: false,
        message: "ID jadwal tidak valid",
      });
    }

    const { courseName, dayOfWeek, startTime, endTime, location } = req.body;

    if (
      (courseName !== undefined && typeof courseName !== "string") ||
      (dayOfWeek !== undefined && typeof dayOfWeek !== "number") ||
      (startTime !== undefined && typeof startTime !== "string") ||
      (endTime !== undefined && typeof endTime !== "string") ||
      (location !== undefined &&
        location !== null &&
        typeof location !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Format data jadwal tidak valid",
      });
    }

    const schedule = await updateSchedule(
      scheduleId,
      req.user!.userId,
      { courseName, dayOfWeek, startTime, endTime, location }
    );

    return res.status(200).json({
      success: true,
      message: "Jadwal kuliah berhasil diperbarui",
      data: schedule,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    const status = message.includes("bertabrakan")
      ? 409
      : message.includes("tidak ditemukan")
        ? 404
        : 400;

    return res.status(status).json({
      success: false,
      message,
    });
  }
}

export async function deleteScheduleController(
  req: Request,
  res: Response
) {
  try {
    const scheduleId = getScheduleId(req.params.id);

    if (scheduleId === null) {
      return res.status(400).json({
        success: false,
        message: "ID jadwal tidak valid",
      });
    }

    await deleteSchedule(scheduleId, req.user!.userId);

    return res.status(200).json({
      success: true,
      message: "Jadwal kuliah berhasil dihapus",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    const status = message.includes("tidak ditemukan") ? 404 : 500;

    return res.status(status).json({
      success: false,
      message,
    });
  }
}
