
import { Request, RequestHandler } from "express";
import prisma from "../config/prisma";
import type { UserRole } from "../generated/prisma/client";
import { AppError } from "../utils/appError";

// Data pengguna yang sedang login.
export interface AuthUser {
  id: number;
  userId: number;
  email: string;
  role: UserRole;
}

export type AuthedRequest = Request & { user?: AuthUser };

// ---------------------------------------------------------------
// (A) AUTENTIKASI SEMENTARA - HANYA UNTUK DEVELOPMENT/TESTING
// Aktif hanya jika NODE_ENV bukan "production" DAN ENABLE_DEV_AUTH="true".
// Cara pakai: kirim header x-dev-user-email: <email user di database>.
// User dicari di database agar id dan role berasal dari database.
// Di production, fungsi ini selalu menolak (401).
// ---------------------------------------------------------------
const devAuthenticate: RequestHandler = async (req, _res, next) => {
  const aktif =
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEV_AUTH === "true";

  if (!aktif) {
    throw new AppError(401, "Autentikasi diperlukan");
  }

  const email = req.header("x-dev-user-email");

  if (!email) {
    throw new AppError(
      401,
      "Header x-dev-user-email wajib diisi (mode development)"
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new AppError(401, "User development tidak ditemukan");
  }

  (req as AuthedRequest).user = {
    id: user.id,
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  next();
};

// ---------------------------------------------------------------
// (B) TITIK SAMBUNG KE AUTH ASLI
// ---------------------------------------------------------------
export const authenticate: RequestHandler = devAuthenticate;

// Pembatas hak akses berdasarkan role.
export function authorize(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    const user = (req as AuthedRequest).user;

    if (!user) {
      throw new AppError(401, "Autentikasi diperlukan");
    }

    if (!roles.includes(user.role)) {
      throw new AppError(403, "Anda tidak memiliki akses ke resource ini");
    }

    next();
  };
}

// Dipakai controller untuk mengambil pengguna yang sedang login.
export function getAuthUser(req: Request): AuthUser {
  const user = (req as AuthedRequest).user;

  if (!user) {
    throw new AppError(401, "Autentikasi diperlukan");
  }

  return user;
}
