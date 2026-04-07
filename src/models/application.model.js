import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    candidate: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "rejected", "accepted"],
      default: "applied",
    },
  },
  {
    timestamps: true,
  },
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true }); // Ensure a candidate can apply to a job only once(Composite unique index)

export const Application = mongoose.model("Application", applicationSchema);
