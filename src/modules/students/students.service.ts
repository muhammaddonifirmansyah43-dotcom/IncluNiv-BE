import prisma from "../../config/prisma";
import { AppError } from "../../utils/appError";

// Service tidak tahu apa-apa soal request/login. Ia hanya menerima userId,
// sehingga mudah diuji dan tidak berubah saat auth asli dipasang.
export async function getStudentProfileByUserId(userId: number) {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      studentCode: true,
      department: true,
      disabilityType: true,
      supportNeeds: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          photoUrl: true,
          createdAt: true,
          // passwordHash sengaja TIDAK dipilih
        },
      },
    },
  });

  if (!student) {
    throw new AppError(404, "Profil mahasiswa tidak ditemukan");
  }

  return {
    userId: student.user.id,
    studentId: student.id,
    fullName: student.user.fullName,
    email: student.user.email,
    phoneNumber: student.user.phoneNumber,
    photoUrl: student.user.photoUrl,
    studentCode: student.studentCode,
    department: student.department,
    disabilityType: student.disabilityType,
    supportNeeds: student.supportNeeds,
    createdAt: student.user.createdAt,
  };
}
type StudentRow = {
  id: number;
  studentCode: string | null;
  department: string | null;
  disabilityType: string | null;
  supportNeeds: string | null;
  user: {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    photoUrl: string | null;
    createdAt: Date;
  };
};

const studentAdminSelect = {
  id: true,
  studentCode: true,
  department: true,
  disabilityType: true,
  supportNeeds: true,
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      photoUrl: true,
      createdAt: true,
      // passwordHash sengaja TIDAK dipilih
    },
  },
} as const;

function mapStudentRow(s: StudentRow) {
  return {
    userId: s.user.id,
    studentId: s.id,
    fullName: s.user.fullName,
    email: s.user.email,
    phoneNumber: s.user.phoneNumber,
    photoUrl: s.user.photoUrl,
    studentCode: s.studentCode,
    department: s.department,
    disabilityType: s.disabilityType,
    supportNeeds: s.supportNeeds,
    createdAt: s.user.createdAt,
  };
}

export async function listStudents(params: { page: number; limit: number; search: string }) {
  const { page, limit, search } = params;
  const where = search ? { user: { fullName: { contains: search } } } : {};

  const [total, rows] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: studentAdminSelect,
    }),
  ]);

  return {
    items: rows.map(mapStudentRow),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getStudentDetailById(studentId: number) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: studentAdminSelect,
  });
  if (!student) {
    throw new AppError(404, "Mahasiswa tidak ditemukan");
  }
  return mapStudentRow(student);
}