/// <reference types="node" />
import prisma from "../src/config/prisma";
import { UserRole } from "../src/generated/prisma/client";
import { hash } from "bcryptjs";

// Password KHUSUS DEVELOPMENT. Jangan dipakai di production.
const DEV_PASSWORD = "Password123!";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seed dev tidak boleh dijalankan di production.");
  }

  const passwordHash = await hash(DEV_PASSWORD, 10);

  // ADMIN
  await prisma.user.upsert({
    where: { email: "admin@incluniv.test" },
    update: {},
    create: {
      fullName: "Admin IncluNiv",
      email: "admin@incluniv.test",
      phoneNumber: "081200000000",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  // MAHASISWA
  const students = [
    {
      fullName: "Mahasiswa Satu",
      email: "mahasiswa1@incluniv.test",
      phoneNumber: "081200000001",
      studentCode: "DEV-MHS-001",
      department: "Teknik Informatika",
      disabilityType: "Tunanetra",
      supportNeeds: "Pendamping untuk berpindah antar ruang kelas",
    },
    {
      fullName: "Mahasiswa Dua",
      email: "mahasiswa2@incluniv.test",
      phoneNumber: "081200000002",
      studentCode: "DEV-MHS-002",
      department: "Sastra Inggris",
      disabilityType: "Tuli",
      supportNeeds: "Pencatat materi kuliah",
    },
  ];
  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        fullName: s.fullName,
        email: s.email,
        phoneNumber: s.phoneNumber,
        passwordHash,
        role: UserRole.STUDENT,
        student: {
          create: {
            studentCode: s.studentCode,
            department: s.department,
            disabilityType: s.disabilityType,
            supportNeeds: s.supportNeeds,
          },
        },
      },
    });
  }

  // PENDAMPING
  const mentors = [
    {
      fullName: "Pendamping Satu",
      email: "pendamping1@incluniv.test",
      phoneNumber: "081200000011",
      studentCode: "DEV-PDG-001",
      department: "Psikologi",
      skills: "Bahasa isyarat, orientasi dan mobilitas",
    },
    {
      fullName: "Pendamping Dua",
      email: "pendamping2@incluniv.test",
      phoneNumber: "081200000012",
      studentCode: "DEV-PDG-002",
      department: "Pendidikan Luar Biasa",
      skills: "Pencatatan materi, membaca braille",
    },
  ];
  for (const m of mentors) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        fullName: m.fullName,
        email: m.email,
        phoneNumber: m.phoneNumber,
        passwordHash,
        role: UserRole.MENTOR,
        mentor: {
          create: {
            studentCode: m.studentCode,
            department: m.department,
            skills: m.skills,
          },
        },
      },
    });
  }

  const [users, studentRows, mentorRows] = await Promise.all([
    prisma.user.count(),
    prisma.student.count(),
    prisma.mentor.count(),
  ]);
  console.log("Seed selesai.");
  console.log(`user=${users}, student=${studentRows}, mentor=${mentorRows}`);
}

main()
  .catch((e) => {
    console.error("Seed GAGAL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());