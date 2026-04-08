import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  applyToJobController,
  getApplicantsForJobController,
  getMyApplicationsController,
  updateApplicationStatusController,
} from "../controllers/application.controller.js";
import {
  onlyCandidate,
  onlyRecruiter,
} from "../middlewares/role.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, applyToJobController);
router.route("/my").get(verifyJWT, onlyCandidate, getMyApplicationsController);
router
  .route("/job/:jobId")
  .get(verifyJWT, onlyRecruiter, getApplicantsForJobController);

router
  .route("/:id")
  .patch(verifyJWT, onlyRecruiter, updateApplicationStatusController);
export default router;
