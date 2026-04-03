import {
  createCandidateProfileService,
  createRecruiterProfileService,
  getCandidateProfileService,
  getRecruiterProfileService,
  updateCandidateProfileService,
  updateRecruiterProfileService,
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

const getProfileController = asyncHandler(async (req, res) => {
  let profile;

  if (req.user.role === "candidate") {
    profile = await getCandidateProfileService(req.user._id);
  } else profile = await getRecruiterProfileService(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Profile retrieved successfully"));
});

const updateProfileController = asyncHandler(async (req, res) => {
  let profile;

  if (req.user.role === "candidate")
    profile = await updateCandidateProfileService(req.user._id, req.body);
  else profile = await updateRecruiterProfileService(req.user._id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, profile, "Profile updated successfully"));
});

export {
  createCandidateProfileController,
  createRecruiterProfileController,
  getProfileController,
  updateProfileController,
};
