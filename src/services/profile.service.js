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

const getCandidateProfileService = async (userId) => {
  const profile = await CandidateProfile.findOne({ userId }).populate(
    "userId",
    "fullname email username role",
  );

  if (!profile) throw new ApiError(404, "Candidate profile not found");

  return profile;
};

const getRecruiterProfileService = async (userId) => {
  const profile = await RecruiterProfile.findOne({ userId }).populate(
    "userId",
    "fullname email username role",
  );

  if (!profile) throw new ApiError(404, "Recruiter profile not found");

  return profile;
};

const updateCandidateProfileService = async (userId, data) => {
  //controlled updates
  const allowedUpdates = [
    "bio",
    "skills",
    "experience",
    "education",
    "projects",
    "resume",
  ];

  const updateData = {};

  Object.keys(data).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updateData[key] = data[key];
    }
  });
  const profile = await CandidateProfile.findOneAndUpdate(
    { userId },
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!profile) throw new ApiError(404, "Candidate profile not found");

  return profile;
};

const updateRecruiterProfileService = async (userId, data) => {
  const allowedUpdates = [
    "companyName",
    "companyDescription",
    "companyWebsite",
    "companyLogo",
  ];

  const updateData = {};
  Object.keys(data).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updateData[key] = data[key];
    }
  });
  const profile = await RecruiterProfile.findOneAndUpdate(
    { userId },
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!profile) throw new ApiError(404, "Recruiter profile not found");

  return profile;
};

export {
  createCandidateProfileService,
  createRecruiterProfileService,
  getCandidateProfileService,
  getRecruiterProfileService,
  updateCandidateProfileService,
  updateRecruiterProfileService,
};
