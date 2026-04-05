import { createJobService } from "../services/job.service";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const createJobController = asyncHandler(async (req, res) => {
  const job = await createJobService(req.body, req.user._id);

  return res
    .status(201)
    .json(new ApiResponse(201, job, "Job created successfully"));
});

const getAllJobsController = asyncHandler(async (req, res) => {
  const { jobs, total, page, limit } = await getAllJobsService(req.query);
  const totalPages = Math.ceil(total / limit);
  return res
    .status(200)
    .json(
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

export { createJobController, getAllJobsController, getJobByIdController };
