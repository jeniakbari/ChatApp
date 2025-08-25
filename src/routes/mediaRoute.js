import { requestImageUploadUrl } from "../controllers/mediaController.js";
import { Router } from "express";
const router = Router();

router.route("/request-upload-url").post(requestImageUploadUrl);

export { router as authRouter };
