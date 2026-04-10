import mongoose, { Schema } from "mongoose";

const ConversationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true, // can be use to disable conversation when job is closed or candidate withdraw application
    },
  },
  {
    timestamps: true,
  },
);

ConversationSchema.index(
  {
    jobId: 1,
    candidateId: 1,
    recruiterId: 1,
  },
  {
    unique: true,
  },
);

export const Conversation = mongoose.model("Conversation", ConversationSchema);
