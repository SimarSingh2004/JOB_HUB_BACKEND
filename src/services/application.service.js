import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Conversation } from "../models/conversation.model.js";

const applyToJobService = async (jobId, userId, userRole) => {
  const normalizedJobId =
    typeof jobId === "string" ? jobId.trim() : String(jobId || "");

  if (!mongoose.Types.ObjectId.isValid(normalizedJobId)) {
    throw new ApiError(400, "Invalid job ID");
  }

  if (userRole !== "candidate") {
    throw new ApiError(403, "Only candidates can apply to jobs");
  }

  const job = await Job.findById(normalizedJobId);
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
      job: normalizedJobId,
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

  const result = applications.map((app) => {
    const obj = app.toObject();

    if (!obj.job?.isActive) {
      obj.status = "expired";
    }
    return obj;
  });

  const totalPages = Math.ceil(total / safeLimit);

  return {
    applications: result,
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

const updateApplicationStatusService = async (
  applicationId,
  newStatus,
  userId,
) => {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new ApiError(400, "Invalid application ID");
  }
  const allowedStatuses = ["applied", "accepted", "rejected", "shortlisted"];
  if (!allowedStatuses.includes(newStatus)) {
    throw new ApiError(400, "Invalid status value");
  }

  const application = await Application.findById(applicationId).populate({
    path: "job",
    options: { includeInactive: true },
  });

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  if (!application.job) {
    // This can happen if the job was deleted after the application was made. We populate with includeInactive: true to still get the job details in this case, but if the job is deleted, it won't be found and we should handle that gracefully.
    throw new ApiError(404, "Associated job not found");
  }

  if (application.job.recruiter.toString() !== userId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to update the status of this application",
    );
  }

  if (!application.job.isActive) {
    throw new ApiError(
      400,
      "This application is expired and cannot be updated",
    );
  }

  const validTransitions = {
    applied: ["rejected", "shortlisted"],
    shortlisted: ["accepted", "rejected"],
    accepted: [],
    rejected: [],
  };

  const currentStatus = application.status;

  if (!validTransitions[currentStatus].includes(newStatus)) {
    throw new ApiError(
      400,
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
    );
  }

  application.status = newStatus;
  await application.save();

  if (newStatus === "rejected") {
    await Conversation.findOneAndUpdate(
      {
        jobId: application.job._id,
        candidateId: application.candidate,
        recruiterId: application.job.recruiter,
      },
      { isActive: false },
    );
  }

  return application;
};

export {
  applyToJobService,
  getMyApplicationService,
  getApplicantsForJobService,
  updateApplicationStatusService,
};
