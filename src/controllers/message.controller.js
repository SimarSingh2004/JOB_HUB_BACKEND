import {
  getMessageService,
  sendMessageService,
} from "../services/message.service.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendMessageController = asyncHandler(async (req, res) => {
  const { conversationId, text } = req.body;

  const senderId = req.user._id;

  if (!conversationId || !text) {
    throw new ApiError(400, "conversationId and text are required");
  }

  const message = await sendMessageService(conversationId, senderId, text);
  return res
    .status(201)
    .json(new ApiResponse(201, message, "Message sent successfully"));
});

const getMessagesController = asyncHandler(async (req, res) => {
  const { conversationId } = req.params; // Assuming conversationId is passed as a URL parameter
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query; // Pagination parameters

  if (!conversationId) {
    throw new ApiError(400, "conversationId is required");
  }

  const messages = await getMessageService(
    conversationId,
    userId,
    Number(page),
    Number(limit),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, messages, "Messages retrieved successfully"));
});

export { sendMessageController, getMessagesController };
