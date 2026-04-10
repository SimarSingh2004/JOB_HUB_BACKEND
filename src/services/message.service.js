import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";

const sendMessageService = async (conversationId, senderId, text) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  if (!conversation.isActive) {
    throw new ApiError(403, "Cannot send message to an inactive conversation");
  }

  const isParticipant =
    conversation.candidateId.toString() === senderId.toString() ||
    conversation.recruiterId.toString() === senderId.toString();

  if (!isParticipant) {
    throw new ApiError(
      403,
      "Not authorized to send message in this conversation",
    );
  }

  const message = await Message.create({
    conversationId,
    senderId,
    text,
  });

  conversation.lastMessage = text;
  conversation.lastMessageAt = message.createdAt;

  await conversation.save();

  return message;
};

const getMessageService = async (
  conversationId,
  userId,
  page = 1,
  limit = 20,
) => {
  const converstion = await Conversation.findById(conversationId);

  if (!converstion) {
    throw new ApiError(404, "Conversation not found");
  }

  const isParticipant =
    converstion.candidateId.toString() === userId.toString() ||
    converstion.recruiterId.toString() === userId.toString();

  if (!isParticipant) {
    throw new ApiError(403, "Not authorized to view this conversation");
  }

  const skip = (page - 1) * limit;

  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return messages;
};
export { sendMessageService, getMessageService };
