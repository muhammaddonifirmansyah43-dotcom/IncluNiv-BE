import prisma from "../../config/prisma";
import { AppError } from "../../utils/appError";

export async function getMentorProfileByUserId(userId: number) {
  const mentor = await prisma.mentor.findUnique({
    where: { userId },
    select: {
      id: true,
      studentCode: true,
      department: true,
      skills: true,
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

  if (!mentor) {
    throw new AppError(404, "Profil pendamping tidak ditemukan");
  }

  return {
    userId: mentor.user.id,
    mentorId: mentor.id,
    fullName: mentor.user.fullName,
    email: mentor.user.email,
    phoneNumber: mentor.user.phoneNumber,
    photoUrl: mentor.user.photoUrl,
    studentCode: mentor.studentCode,
    department: mentor.department,
    skills: mentor.skills,
    createdAt: mentor.user.createdAt,
  };
}
type MentorRow = {
  id: number;
  studentCode: string | null;
  department: string | null;
  skills: string | null;
  user: {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    photoUrl: string | null;
    createdAt: Date;
  };
};

const mentorAdminSelect = {
  id: true,
  studentCode: true,
  department: true,
  skills: true,
  user: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      photoUrl: true,
      createdAt: true,
    },
  },
} as const;

function mapMentorRow(m: MentorRow) {
  return {
    userId: m.user.id,
    mentorId: m.id,
    fullName: m.user.fullName,
    email: m.user.email,
    phoneNumber: m.user.phoneNumber,
    photoUrl: m.user.photoUrl,
    studentCode: m.studentCode,
    department: m.department,
    skills: m.skills,
    createdAt: m.user.createdAt,
  };
}

export async function listMentors(params: { page: number; limit: number; search: string }) {
  const { page, limit, search } = params;
  const where = search ? { user: { fullName: { contains: search } } } : {};

  const [total, rows] = await Promise.all([
    prisma.mentor.count({ where }),
    prisma.mentor.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: mentorAdminSelect,
    }),
  ]);

  return {
    items: rows.map(mapMentorRow),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getMentorDetailById(mentorId: number) {
  const mentor = await prisma.mentor.findUnique({
    where: { id: mentorId },
    select: mentorAdminSelect,
  });
  if (!mentor) {
    throw new AppError(404, "Pendamping tidak ditemukan");
  }
  return mapMentorRow(mentor);
}