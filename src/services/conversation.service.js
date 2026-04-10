import { Application } from "../models/application.model.js";
import { Conversation } from "../models/conversation.model.js";
import { ApiError } from "../utils/ApiError.js";

const createOrGetConversationService = async (
  jobId,
  candidateId,
  recruiterId,
) => {
  const application = await Application.findOne({
    job: jobId,
    candidate: candidateId,
  });

  if (!application)
    throw new ApiError(400, "Application not found. Cannot start chat");

  let conversation = await Conversation.findOne({
    jobId,
    candidateId,
    recruiterId,
  });

  if (conversation) return conversation; // Conversation already exists

  // Create new conversation
  try {
    conversation = await Conversation.create({
      jobId,
      candidateId,
      recruiterId,
    });
    return conversation;
  } catch (error) {
    throw new ApiError(500, "Error creating conversation");
  }
};

const getUserConversationsService = async (userId) => {
  const conversations = await Conversation.find({
    $or: [{ candidateId: userId }, { recruiterId: userId }],
  })
    .sort({ lastMessageAt: -1 })
    .populate("jobId", "title")
    .populate("candidateId", "fullname email")
    .populate("recruiterId", "fullname email");

  return conversations;
};

export { createOrGetConversationService, getUserConversationsService };
