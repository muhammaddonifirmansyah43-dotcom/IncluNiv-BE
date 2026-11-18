import { Request, Response } from "express";
import { getAuthUser } from "../../middleware/authGuard";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/appError";
import { parsePagination } from "../../utils/pagination";
import {
  getStudentProfileByUserId,
  listStudents,
  getStudentDetailById,
} from "./students.service";

export async function getMyProfile(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const profile = await getStudentProfileByUserId(authUser.id);
  return sendSuccess(res, profile, "Profil mahasiswa berhasil diambil");
}

export async function adminListStudents(req: Request, res: Response) {
  const result = await listStudents(parsePagination(req.query));
  return sendSuccess(res, result, "Daftar mahasiswa berhasil diambil");
}

export async function adminGetStudent(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, "id tidak valid");
  }
  const student = await getStudentDetailById(id);
  return sendSuccess(res, student, "Detail mahasiswa berhasil diambil");
}