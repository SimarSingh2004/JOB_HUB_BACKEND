import {
  applyToJobService,
  getApplicantsForJobService,
  getMyApplicationService,
  updateApplicationStatusService,
} from "../services/application.service.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const applyToJobController = asyncHandler(async (req, res) => {
  const jobId = req.body.jobId;

  if (!jobId) {
    throw new ApiError(400, "jobId is required");
  }

  const application = await applyToJobService(
    jobId,
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

const updateApplicationStatusController = asyncHandler(async (req, res) => {
  const updated = await updateApplicationStatusService(
    req.params.id,
    req.body.status,
    req.user._id,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updated, "Application status updated successfully"),
    );
});

export {
  applyToJobController,
  getMyApplicationsController,
  getApplicantsForJobController,
  updateApplicationStatusController,
};
