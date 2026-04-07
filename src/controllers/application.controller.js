import {
  getApplicantsForJobService,
  getMyApplicationService,
} from "../services/application.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const applyToJobController = asyncHandler(async (req, res) => {
  const application = await applyToJobService(
    req.body.jobId,
    req.user._id,
    req.user.role,
  );

  return res
    .status(201)
    .json(
      new ApiResponse(201, application, "Application submitted successfully"),
    );
});

const getMyApplicationsController = asyncHandler(async (req, res) => {
  const data = await getMyApplicationService(req.query, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Applications retrieved successfully"));
});

const getApplicantsForJobController = asyncHandler(async (req, res) => {
  const data = await getApplicantsForJobService(
    req.params.jobId,
    req.user._id,
    req.query,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Applicants retrieved successfully"));
});

export {
  applyToJobController,
  getMyApplicationsController,
  getApplicantsForJobController,
};
