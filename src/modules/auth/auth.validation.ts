
import { z } from "zod";

// Validasi dasar akun pengguna
const baseAccountSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Nama lengkap minimal 3 karakter"),

  studentCode: z
    .string()
    .trim()
    .min(1, "NIM wajib diisi"),

  email: z
    .string()
    .trim()
    .email("Format email tidak valid"),

  department: z
    .string()
    .trim()
    .min(1, "Fakultas/program studi wajib diisi"),

  phoneNumber: z
    .string()
    .trim()
    .min(8, "Nomor telepon tidak valid"),

  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter"),

  confirmPassword: z
    .string()
    .min(1, "Konfirmasi kata sandi wajib diisi"),
});

// Validasi registrasi mahasiswa
export const studentRegisterSchema = baseAccountSchema
  .extend({
    disabilityType: z
      .string()
      .trim()
      .min(1, "Jenis disabilitas wajib diisi"),

    supportNeeds: z
      .string()
      .trim()
      .min(1, "Kebutuhan dukungan wajib diisi"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Konfirmasi kata sandi tidak cocok",
      path: ["confirmPassword"],
    }
  );

// Validasi registrasi pendamping
export const mentorRegisterSchema = baseAccountSchema
  .extend({
    skills: z
      .string()
      .trim()
      .min(1, "Keahlian wajib diisi"),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Konfirmasi kata sandi tidak cocok",
      path: ["confirmPassword"],
    }
  );

// Validasi login
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Format email tidak valid"),

  password: z
    .string()
    .min(1, "Kata sandi wajib diisi"),
});
