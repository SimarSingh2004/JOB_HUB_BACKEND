import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { onlyRecruiter } from "../middlewares/role.middleware.js";
import {
  createJobController,
  getAllJobsController,
  getJobByIdController,
} from "../controllers/job.controller.js";

const router = Router();

router.route("/").post(verifyJWT, onlyRecruiter, createJobController);
router.route("/").get(getAllJobsController);
router.route("/:id").get(getJobByIdController);

export default router;
