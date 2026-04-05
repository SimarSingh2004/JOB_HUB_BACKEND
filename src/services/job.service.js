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

export { createJobService, getAllJobsService, getJobByIdService };
