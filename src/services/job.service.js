import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { ApiError } from "../utils/ApiError.js";
import { buildJobFilter, buildSort } from "../utils/jobQueryBuilder.js";

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

const getAllJobsService = async (queryParams = {}) => {
  const { page = 1, limit = 10 } = queryParams;

  const includeInactive = queryParams.includeInactive === "true"; // Convert string to boolean since query params are strings by default
  const safePage = Math.max(1, parseInt(page) || 1);
  const safeLimit = Math.min(50, parseInt(limit) || 10);
  const skip = (safePage - 1) * safeLimit;

  const filter = buildJobFilter(queryParams);
  const sort = buildSort(queryParams);

  let query = Job.find(filter);

  if (includeInactive) {
    query = query.withInactive();
  }

  const [jobs, total] = await Promise.all([
    query
      .skip(skip)
      .limit(safeLimit)
      .populate("recruiter", "fullname username email")
      .sort(sort),
    Job.countDocuments(filter).setOptions({ includeInactive }),
  ]);

  return {
    jobs: jobs,
    total: total,
    page: safePage,
    limit: safeLimit,
  };
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

const getMyJobsService = async (queryParams = {}, userId) => {
  const includeInactive = true; // Always include inactive jobs for the recruiter when fetching their own jobs
  const safePage = Math.max(1, parseInt(queryParams.page) || 1);
  const safeLimit = Math.min(50, parseInt(queryParams.limit) || 10);
  const skip = (safePage - 1) * safeLimit;

  const dynamicFilter = buildJobFilter(queryParams);
  const finalFilter = { ...dynamicFilter, recruiter: userId };
  const sort = buildSort(queryParams);

  let query = Job.find(finalFilter);

  if (includeInactive) {
    query = query.withInactive();
  }

  const [jobs, total] = await Promise.all([
    query.skip(skip).limit(safeLimit).sort(sort),

    Job.countDocuments(finalFilter).setOptions({ includeInactive }),
  ]);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    jobs: jobs,
    total: total,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
};

const updateJobService = async (jobId, data, userId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job ID");
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (!job.isActive) {
    throw new ApiError(400, "Job is inactive and cannot be updated");
  }

  if (job.recruiter.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to update this job");
  }

  const allowedFields = [
    "title",
    "description",
    "skillsRequired",
    "salary",
    "location",
  ];

  const filteredUpdate = {};

  Object.keys(data).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredUpdate[key] = data[key];
    }
  });

  if (Object.keys(filteredUpdate).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  if (filteredUpdate.salary !== undefined && filteredUpdate.salary < 0) {
    throw new ApiError(400, "Salary cannot be negative");
  }

  if (Array.isArray(filteredUpdate.skillsRequired)) {
    filteredUpdate.skillsRequired = filteredUpdate.skillsRequired
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  Object.assign(job, filteredUpdate);

  await job.save();

  return job;
};

const deleteJobService = async (jobId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job ID");
  }

  const job = await Job.findById(jobId);

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (!job.isActive) {
    throw new ApiError(404, "Job not found");
  }

  if (job.recruiter.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this job");
  }

  job.isActive = false;
  await job.save();

  return { id: jobId };
};

export {
  createJobService,
  getAllJobsService,
  getJobByIdService,
  getMyJobsService,
  updateJobService,
  deleteJobService,
};
