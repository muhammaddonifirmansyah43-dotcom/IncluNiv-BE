
import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";

import {
  login,
  registerMentor,
  registerStudent,
} from "./auth.service";

import {
  loginSchema,
  mentorRegisterSchema,
  studentRegisterSchema,
} from "./auth.validation";

async function deleteUploadedPhoto(filename?: string) {
  if (!filename) return;

  const filePath = path.join(
    process.cwd(),
    "uploads",
    "profiles",
    filename
  );

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("Gagal menghapus foto:", error);
  }
}

export async function registerStudentController(
  req: Request,
  res: Response
) {
  try {
    const validation = studentRegisterSchema.safeParse(req.body);

    if (!validation.success) {
      await deleteUploadedPhoto(req.file?.filename);

      return res.status(400).json({
        success: false,
        message: "Data registrasi tidak valid",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const photoUrl = req.file
      ? `/uploads/profiles/${req.file.filename}`
      : undefined;

    const result = await registerStudent({
      ...validation.data,
      photoUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Registrasi mahasiswa berhasil",
      data: result,
    });
  } catch (error) {
    await deleteUploadedPhoto(req.file?.filename);

    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function registerMentorController(
  req: Request,
  res: Response
) {
  try {
    // Debug: periksa data yang diterima dari Postman
    const { password, confirmPassword, ...safeBody } = req.body ?? {};

    console.log("DATA REGISTER MENTOR:", {
      ...safeBody,
      password: password ? "[TERISI]" : "[KOSONG]",
      confirmPassword: confirmPassword ? "[TERISI]" : "[KOSONG]",
    });

    const validation = mentorRegisterSchema.safeParse(req.body);

    if (!validation.success) {
      console.log(
        "VALIDATION ERROR MENTOR:",
        validation.error.flatten().fieldErrors
      );

      return res.status(400).json({
        success: false,
        message: "Data registrasi tidak valid",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const result = await registerMentor(validation.data);

    return res.status(201).json({
      success: true,
      message: "Registrasi pendamping berhasil",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Data login tidak valid",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const result = await login(validation.data);

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan";

    return res.status(401).json({
      success: false,
      message,
    });
  }
}
