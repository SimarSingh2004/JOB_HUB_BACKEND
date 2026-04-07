import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";

const applyToJobService = async (jobId, userId, userRole) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job ID");
  }

  if (userRole !== "candidate") {
    throw new ApiError(403, "Only candidates can apply to jobs");
  }

  const job = await Job.findById(jobId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (!job.isActive) {
    throw new ApiError(400, "Job is inactive and cannot be applied to");
  }

  if (job.recruiter.toString() === userId.toString()) {
    throw new ApiError(403, "You cannot apply to your own job");
  }

  try {
    const application = await Application.create({
      job: jobId,
      candidate: userId,
    });
    return application;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(400, "You have already applied to this job");
    }
    throw error;
  }
};

const getMyApplicationService = async (queryParams = {}, userId) => {
  const safePage = Math.max(parseInt(queryParams.page) || 1, 1);
  const safeLimit = Math.min(parseInt(queryParams.limit) || 10, 50);
  const skip = (safePage - 1) * safeLimit;

  //Sorting
  const sortFields = queryParams.sort?.split(",") || [];
  const sort = {};

  sortFields.forEach((field) => {
    const normalizedField = field.trim();
    if (!normalizedField) return;

    const sortKey = normalizedField.startsWith("-")
      ? normalizedField.slice(1)
      : normalizedField;

    if (!["job", "createdAt"].includes(sortKey)) return;

    if (!(sortKey in sort)) {
      sort[sortKey] = normalizedField.startsWith("-") ? -1 : 1;
    }
  });

  if (Object.keys(sort).length === 0) sort.createdAt = -1; // Default sort by newest

  //Query
  const filter = { candidate: userId };

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .skip(skip)
      .limit(safeLimit)
      .sort(sort)
      .populate({
        // Populate job details in the application response along with inactive jobs to show the status of the application for those jobs
        path: "job",
        select: "title salary location isActive",
        options: { includeInactive: true },
      }),

    Application.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    applications: applications,
    total: total,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
};

const getApplicantsForJobService = async (jobId, userId, queryParams) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ApiError(400, "Invalid job ID");
  }

  const job = await Job.findById(jobId).withInactive();

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (job.recruiter.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to view applicants for this job",
    );
  }

  const safePage = Math.max(parseInt(queryParams.page) || 1, 1);
  const safeLimit = Math.min(parseInt(queryParams.limit) || 10, 50);
  const skip = (safePage - 1) * safeLimit;

  const sort = { createdAt: -1 }; // Default sort by newest applications

  const filter = { job: jobId };

  const [applications, total] = await Promise.all([
    Application.find(filter).skip(skip).limit(safeLimit).sort(sort).populate({
      path: "candidate",
      select: "fullname email username ",
    }),
    Application.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    applicants: applications,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
};

export {
  applyToJobService,
  getMyApplicationService,
  getApplicantsForJobService,
};
