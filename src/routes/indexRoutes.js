import { authRouter } from "./authRoute.js";
import { userRouter } from "./userRoute.js";
import { Router } from "express";

const router = Router();

// Initialize routes

router.use("/auth", authRouter);
router.use("/user", userRouter);

export { router };
