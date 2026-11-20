import type { Request } from "express";
import type { UserRole } from "../generated/prisma/client";

import { AppError } from "../utils/appError";

import {
  authenticateToken,
  authorizeRole,
} from "./auth.middleware";

// Menggunakan autentikasi JWT yang sama untuk seluruh modul
export const authenticate = authenticateToken;
export const authorize = authorizeRole;

// Struktur pengguna yang telah diautentikasi
export interface AuthUser {
  id: number;
  userId: number;
  email: string;
  role: UserRole;
}

// Mengambil pengguna dari JWT yang sudah diverifikasi
export function getAuthUser(req: Request): AuthUser {
  if (!req.user) {
    throw new AppError(401, "Autentikasi diperlukan");
  }

  return req.user;
}