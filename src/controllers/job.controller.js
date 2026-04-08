import {
  createJobService,
  deleteJobService,
  getAllJobsService,
  getJobByIdService,
  getMyJobsService,
  updateJobService,
} from "../services/job.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createJobController = asyncHandler(async (req, res) => {
  const job = await createJobService(req.body, req.user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, job, "Job created successfully"));
});

const getAllJobsController = asyncHandler(async (req, res) => {
  const { jobs, total, page, limit } = await getAllJobsService(req.query);
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        jobs,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      "Jobs retrieved successfully",
    ),
  );
});

const getJobByIdController = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  const job = await getJobByIdService(jobId);

  return res
    .status(200)
    .json(new ApiResponse(200, job, "Job retrieved successfully"));
});

const getMyJobsController = asyncHandler(async (req, res) => {
  const results = await getMyJobsService(req.query, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, results, "My jobs retrieved successfully"));
});

const updateJobController = asyncHandler(async (req, res) => {
  const updatedJob = await updateJobService(
    req.params.id,
    req.body,
    req.user._id,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedJob, "Job updated successfully"));
});

const deleteJobController = asyncHandler(async (req, res) => {
  const result = await deleteJobService(req.params.id, req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Job deleted successfully"));
});

export {
  createJobController,
  getAllJobsController,
  getJobByIdController,
  getMyJobsController,
  updateJobController,
  deleteJobController,
};
