import { ApiError } from "../utils/ApiError.js";

export const onlyCandidate = (req, res, next) => {
  if (req.user.role !== "candidate") {
    throw new ApiError(
      403,
      "Access denied. Only candidates are allowed to access this resource.",
    );
  }
  next();
};

export const onlyRecruiter = (req, res, next) => {
  if (req.user.role !== "recruiter") {
    throw new ApiError(
      403,
      "Access denied. Only recruiters are allowed to access this resource.",
    );
  }
  next();
};
