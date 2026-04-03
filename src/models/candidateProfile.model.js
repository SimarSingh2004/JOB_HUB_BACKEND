import mongoose, { Schema } from "mongoose";

const candidateProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
    },
    skills: [
      {
        type: String,
      },
    ],
    resume: {
      type: String,
      default: "",
    },
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startYear: Number,
        endYear: Number,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        link: String,
      },
    ],
    experience: [
      {
        company: String,
        role: String,
        duration: String,
      },
    ],
  },
  { timestamps: true },
);

export const CandidateProfile = mongoose.model(
  "CandidateProfile",
  candidateProfileSchema,
);
