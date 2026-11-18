import type {
  Request,
  Response,
  NextFunction,
} from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/prisma";

type UserRole = "STUDENT" | "MENTOR" | "ADMIN";

interface AuthPayload {
  id: number;
  userId: number;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// Memverifikasi JWT dan mengambil identitas pengguna dari database.
export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.headers.authorization;
  const secret = process.env.JWT_SECRET;

  if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
    res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan",
    });
    return;
  }

  if (!secret) {
    console.error("JWT_SECRET belum dikonfigurasi.");

    res.status(503).json({
      success: false,
      message: "Layanan autentikasi belum siap",
    });
    return;
  }

  const token = authorization.replace(/^Bearer\s+/i, "");

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "number" ||
      !Number.isSafeInteger(decoded.userId) ||
      decoded.userId <= 0
    ) {
      res.status(401).json({
        success: false,
        message: "Format token tidak valid",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Akun tidak ditemukan",
      });
      return;
    }

    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      res.status(401).json({
        success: false,
        message: "Token tidak valid atau sudah kedaluwarsa",
      });
      return;
    }

    next(error);
  }
}

// Alias agar kompatibel dengan modul dari branch main.
export const authenticate = authenticateToken;

// Memeriksa hak akses berdasarkan role.
export function authorizeRole(...allowedRoles: UserRole[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Autentikasi diperlukan",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: "Anda tidak memiliki izin untuk mengakses fitur ini",
      });
      return;
    }

    next();
  };
}

// Alias agar kompatibel dengan modul dari branch main.
export const authorize = authorizeRole;