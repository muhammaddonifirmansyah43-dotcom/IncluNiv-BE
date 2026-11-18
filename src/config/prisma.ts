
import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

// Konfigurasi koneksi database MySQL
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "incluniv_db",
  connectionLimit: 5,
});

// Satu instance Prisma Client untuk seluruh backend
export const prisma = new PrismaClient({
  adapter,
});

// Mendukung modul yang memakai default import
export default prisma;
