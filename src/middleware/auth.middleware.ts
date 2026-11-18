
import type {
  Request,
  Response,
  NextFunction,
} from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/prisma";

type UserRole = "STUDENT" | "MENTOR" | "ADMIN";

export type AuthUser = {
  id: number;
  role: UserRole;
};

type AuthRequest = Request & {
  user?: AuthUser;
};

function isJwtPayload(
  value: string | JwtPayload
): value is JwtPayload {
  return typeof value !== "string";
}

// Memastikan pengguna memiliki JWT yang valid.
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authorization = req.headers.authorization;

  if (
    !authorization ||
    !/^Bearer\s+\S+$/i.test(authorization)
  ) {
    res.status(401).json({
      success: false,
      message: "Token autentikasi diperlukan.",
    });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET belum dikonfigurasi.");

    res.status(503).json({
      success: false,
      message: "Layanan autentikasi belum siap.",
    });
    return;
  }

  const token = authorization.replace(
    /^Bearer\s+/i,
    ""
  );

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      !isJwtPayload(decoded) ||
      typeof decoded.sub !== "string" ||
      !/^[1-9]\d*$/.test(decoded.sub)
    ) {
      res.status(401).json({
        success: false,
        message: "Identitas token tidak valid.",
      });
      return;
    }

    const userId = Number(decoded.sub);

    if (!Number.isSafeInteger(userId)) {
      res.status(401).json({
        success: false,
        message: "Identitas pengguna tidak valid.",
      });
      return;
    }

    // Ambil role aktual dari database,
    // bukan mempercayai role dari token saja.
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Akun tidak ditemukan.",
      });
      return;
    }

    (req as AuthRequest).user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Token tidak valid atau kedaluwarsa.",
      });
      return;
    }

    console.error("Authentication error:", error);

    res.status(500).json({
      success: false,
      message: "Gagal memverifikasi autentikasi.",
    });
  }
}

// Memastikan role memiliki izin mengakses endpoint.
export function authorize(...roles: UserRole[]) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const user = (req as AuthRequest).user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu.",
      });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses.",
      });
      return;
    }

    next();
  };
}
