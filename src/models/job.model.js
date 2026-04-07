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
        index: true,
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
      lowercase: true,
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
    optimisticConcurrency: true, // to support optimistic concurrency control and prevent lost updates in concurrent scenarios. Mongoose will automatically add a version key (__v) to the document and increment it on each save. If two concurrent updates are made to the same document, Mongoose will throw a VersionError for the second update, allowing you to handle it gracefully in your application logic.
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
