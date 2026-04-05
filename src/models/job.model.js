import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    skillsRequired: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    salary: {
      type: Number,
      min: 0,
    },
    location: {
      type: String,
      index: true,
      trim: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

jobSchema.query.withInactive = function () {
  this.setOptions({ includeInactive: true });
  return this;
};

jobSchema.pre(/^find/, function (next) {
  if (!this.getOptions().includeInactive) {
    this.where({ isActive: true });
  }
  next();
});

export const Job = mongoose.model("Job", jobSchema);
