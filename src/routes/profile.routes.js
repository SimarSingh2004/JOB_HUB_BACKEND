import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCandidateProfileController,
  createRecruiterProfileController,
} from "../controllers/profile.controller.js";

const router = Router();

router.route("/candidate").post(verifyJWT, createCandidateProfileController);
router.route("/recruiter").post(verifyJWT, createRecruiterProfileController);

export default router;
