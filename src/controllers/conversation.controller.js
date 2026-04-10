import {
  createOrGetConversationService,
  getUserConversationsService,
} from "../services/conversation.service.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createConversationController = asyncHandler(async (req, res) => {
  const { jobId, candidateId } = req.body;
  const recruiterId = req.user._id;

  if (!jobId || !candidateId) {
    throw new ApiError(400, "jobId and candidateId are required");
  }
  const conversation = await createOrGetConversationService(
    jobId,
    candidateId,
    recruiterId,
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        conversation,
        "Conversation retrieved/created successfully",
      ),
    );
});

const getConversationsController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const conversations = await getUserConversationsService(userId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        conversations,
        "Conversations retrieved successfully",
      ),
    );
});

export { createConversationController, getConversationsController };
