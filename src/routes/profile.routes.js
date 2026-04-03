import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createCandidateProfileController,
  createRecruiterProfileController,
  getProfileController,
  updateProfileController,
} from "../controllers/profile.controller.js";
import {
  onlyCandidate,
  onlyRecruiter,
} from "../middlewares/role.middleware.js";

const router = Router();

router
  .route("/candidate")
  .post(verifyJWT, onlyCandidate, createCandidateProfileController);
router
  .route("/recruiter")
  .post(verifyJWT, onlyRecruiter, createRecruiterProfileController);

router.route("/me").get(verifyJWT, getProfileController);

router.route("/me").patch(verifyJWT, updateProfileController);

export default router;
