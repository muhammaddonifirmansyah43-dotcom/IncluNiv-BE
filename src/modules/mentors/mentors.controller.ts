import { Request, Response } from "express";
import { getAuthUser } from "../../middleware/authGuard";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/appError";
import { parsePagination } from "../../utils/pagination";
import {
  getMentorProfileByUserId,
  listMentors,
  getMentorDetailById,
} from "./mentors.service";

export async function getMyMentorProfile(req: Request, res: Response) {
  const authUser = getAuthUser(req);
  const profile = await getMentorProfileByUserId(authUser.id);
  return sendSuccess(res, profile, "Profil pendamping berhasil diambil");
}

export async function adminListMentors(req: Request, res: Response) {
  const result = await listMentors(parsePagination(req.query));
  return sendSuccess(res, result, "Daftar pendamping berhasil diambil");
}

export async function adminGetMentor(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new AppError(400, "id tidak valid");
  }
  const mentor = await getMentorDetailById(id);
  return sendSuccess(res, mentor, "Detail pendamping berhasil diambil");
}