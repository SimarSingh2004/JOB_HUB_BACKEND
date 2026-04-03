import mongoose, { Schema } from "mongoose";

const recruiterProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    companyDescription: {
      type: String,
      required: true,
    },
    companyWebsite: {
      type: String,
      default: "",
    },
    companyLogo: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export const RecruiterProfile = mongoose.model(
  "RecruiterProfile",
  recruiterProfileSchema,
);
