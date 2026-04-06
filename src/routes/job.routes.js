import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { onlyRecruiter } from "../middlewares/role.middleware.js";
import {
  createJobController,
  deleteJobController,
  getAllJobsController,
  getJobByIdController,
  getMyJobsController,
  updateJobController,
} from "../controllers/job.controller.js";

const router = Router();

router.route("/").post(verifyJWT, onlyRecruiter, createJobController);
router.route("/").get(getAllJobsController);
router.route("/:id").get(getJobByIdController);
router.route("/my-jobs").get(verifyJWT, onlyRecruiter, getMyJobsController);
router.route("/:id").patch(verifyJWT, onlyRecruiter, updateJobController);
router.route("/:id").delete(verifyJWT, onlyRecruiter, deleteJobController);

export default router;
