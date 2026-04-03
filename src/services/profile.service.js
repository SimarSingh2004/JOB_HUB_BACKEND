import { CandidateProfile } from "../models/candidateProfile.model.js";
import { RecruiterProfile } from "../models/recruiterProfile.model.js";
import { ApiError } from "../utils/ApiError.js";

const createCandidateProfileService = async (userId, data) => {
  const existingProfile = await CandidateProfile.findOne({ userId });

  if (existingProfile)
    throw new ApiError(400, "Candidate profile already exists for this user");

  const candidateProfile = await CandidateProfile.create({
    userId,
    ...data,
  });

  const createdProfile = await CandidateProfile.findById(candidateProfile._id);

  if (!createdProfile)
    throw new ApiError(500, "Failed to create candidate profile");

  return createdProfile;
};

const createRecruiterProfileService = async (userId, data) => {
  const existingProfile = await RecruiterProfile.findOne({ userId });

  if (existingProfile)
    throw new ApiError(400, "Recruiter profile already exists for this user");

  const recruiterProfile = await RecruiterProfile.create({
    userId,
    ...data,
  });

  const createdProfile = await RecruiterProfile.findById(recruiterProfile._id);

  if (!createdProfile)
    throw new ApiError(500, "Failed to create recruiter profile");

  return createdProfile;
};

export { createCandidateProfileService, createRecruiterProfileService };
