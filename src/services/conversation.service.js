import { Application } from "../models/application.model.js";
import { Conversation } from "../models/conversation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { Job } from "../models/job.model.js";

const createOrGetConversationService = async (
  jobId,
  candidateId,
  recruiterId,
) => {
  const job = await Job.findById(jobId).withInactive();

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  if (!job.isActive) {
    throw new ApiError(
      400,
      "Job is inactive and cannot be used to start a conversation",
    );
  }

  if (job.recruiter.toString() !== recruiterId.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to start a conversation for this job",
    );
  }
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
  })
    .populate({
      path: "jobId",
      select: "title isActive",
      options: { includeInactive: true },
    })
    .populate("candidateId", "fullname email")
    .populate("recruiterId", "fullname email");

  if (conversation) return conversation; // Conversation already exists

  // Create new conversation
  try {
    conversation = await Conversation.create({
      jobId,
      candidateId,
      recruiterId,
    });
    // .create() returns the raw doc with un-populated ObjectId refs —
    // populate before returning, same as the "already exists" branch above,
    // or the frontend's ConversationModel (which expects full objects for
    // jobId/candidateId/recruiterId) fails to parse the response.
    await conversation.populate([
      {
        path: "jobId",
        select: "title isActive",
        options: { includeInactive: true },
      },
      { path: "candidateId", select: "fullname email" },
      { path: "recruiterId", select: "fullname email" },
    ]);
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
    .populate({
      path: "jobId",
      select: "title isActive",
      options: { includeInactive: true },
    })
    .populate("candidateId", "fullname email")
    .populate("recruiterId", "fullname email");

  return conversations;
};

export { createOrGetConversationService, getUserConversationsService };
