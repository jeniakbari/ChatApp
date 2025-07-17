import { Router } from "express";
import { uploadAvatar } from '../middleware/upload-middleware.js';
const router = Router();

import {
  registerUser,
  verifyEmail,
  sendOtp,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../controllers/authController.js";

router.route("/register").post(uploadAvatar.single('avatar'), registerUser);

router.route("/verify/:token").get(verifyEmail);

router.route("/send-otp").post(sendOtp);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/logout").post(logoutUser);

export { router as authRouter };
