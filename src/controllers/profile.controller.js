import {
  createCandidateProfileService,
  createRecruiterProfileService,
} from "../services/profile.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCandidateProfileController = asyncHandler(async (req, res) => {
  const profile = await createCandidateProfileService(req.user._id, req.body);

  return res
    .status(201)
    .json(
      new ApiResponse(201, profile, "Candidate profile created successfully"),
    );
});

const createRecruiterProfileController = asyncHandler(async (req, res) => {
  const profile = await createRecruiterProfileService(req.user._id, req.body);
  return res
    .status(201)
    .json(
      new ApiResponse(201, profile, "Recruiter profile created successfully"),
    );
});

export { createCandidateProfileController, createRecruiterProfileController };
