import { Job } from "../models/job.model.js";
import { ApiError } from "../utils/ApiError.js";

const createJobService = async (data, userId) => {
  const { title, description, skillsRequired, salary, location } = data;

  if (!title || !description)
    throw new ApiError(400, "Title and Description are required fields");

  const job = await Job.create({
    title,
    description,
    skillsRequired,
    salary,
    location,
    recruiter: userId,
  });

  if (!job) throw new ApiError(500, "Failed to create job");

  return job;
};

const getAllJobsService = async ({ includeInactive = false } = {}) => {
  let query = Job.find();

  if (includeInactive) {
    query = query.withInactive();
  }

  const jobs = await query
    .populate("recruiter", "fullname username email")
    .sort({ createdAt: -1 });

  return jobs;
};

const getJobByIdService = async (jobId, { includeInactive = false } = {}) => {
  let query = Job.findById(jobId);

  if (includeInactive) {
    query = query.withInactive();
  }

  const job = await query.populate("recruiter", "fullname username email");

  if (!job || (!includeInactive && !job.isActive)) {
    throw new ApiError(404, "Job not found");
  }

  return job;
};

export { createJobService, getAllJobsService, getJobByIdService };
