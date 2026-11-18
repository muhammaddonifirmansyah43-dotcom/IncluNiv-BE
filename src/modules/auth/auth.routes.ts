
import { Router } from "express";
import {
  loginController,
  registerMentorController,
  registerStudentController,
} from "./auth.controller";
import { uploadProfilePhoto } from "./upload.middleware";

const router = Router();

// Registrasi mahasiswa dengan upload foto profil
router.post(
  "/register/student",
  uploadProfilePhoto.single("photo"),
  registerStudentController
);

// Registrasi pendamping
router.post("/register/mentor", registerMentorController);

// Login semua role
router.post("/login", loginController);

export default router;
