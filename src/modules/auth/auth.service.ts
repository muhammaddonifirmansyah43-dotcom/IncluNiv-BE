
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";

const JWT_SECRET: string = process.env.JWT_SECRET || "";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET belum dikonfigurasi di file .env");
}

const SALT_ROUNDS = 12;

interface RegisterStudentInput {
  fullName: string;
  studentCode: string;
  email: string;
  department: string;
  phoneNumber: string;
  disabilityType: string;
  supportNeeds: string;
  password: string;
  photoUrl?: string;
}

interface RegisterMentorInput {
  fullName: string;
  studentCode: string;
  email: string;
  department: string;
  phoneNumber: string;
  skills: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

function generateToken(user: {
  id: number;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
}) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

export async function registerStudent(input: RegisterStudentInput) {
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingEmail) {
    throw new Error("Email sudah terdaftar");
  }

  const existingStudent = await prisma.student.findUnique({
    where: { studentCode: input.studentCode },
  });

  const existingMentor = await prisma.mentor.findUnique({
    where: { studentCode: input.studentCode },
  });

  if (existingStudent || existingMentor) {
    throw new Error("NIM sudah terdaftar");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    return tx.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phoneNumber: input.phoneNumber,
        passwordHash,
        role: "STUDENT",
        photoUrl: input.photoUrl,
        student: {
          create: {
            studentCode: input.studentCode,
            department: input.department,
            disabilityType: input.disabilityType,
            supportNeeds: input.supportNeeds,
          },
        },
      },
    });
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      photoUrl: user.photoUrl,
    },
    token,
  };
}

export async function registerMentor(input: RegisterMentorInput) {
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingEmail) {
    throw new Error("Email sudah terdaftar");
  }

  const existingStudent = await prisma.student.findUnique({
    where: { studentCode: input.studentCode },
  });

  const existingMentor = await prisma.mentor.findUnique({
    where: { studentCode: input.studentCode },
  });

  if (existingStudent || existingMentor) {
    throw new Error("NIM sudah terdaftar");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    return tx.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phoneNumber: input.phoneNumber,
        passwordHash,
        role: "MENTOR",
        mentor: {
          create: {
            studentCode: input.studentCode,
            department: input.department,
            skills: input.skills,
          },
        },
      },
    });
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error("Email atau kata sandi salah");
  }

  const passwordValid = await bcrypt.compare(
    input.password,
    user.passwordHash
  );

  if (!passwordValid) {
    throw new Error("Email atau kata sandi salah");
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
    token,
  };
}
