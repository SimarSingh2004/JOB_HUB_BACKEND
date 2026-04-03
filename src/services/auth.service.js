import { generateAccessAndRefreshToken } from "../utils/generateAccessAndRefreshToken.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const registerUserService = async (data) => {
  const { fullname, username, email, password, role } = data;

  if (
    [fullname, username, email, password, role].some(
      (field) => field?.trim() === "",
    )
  )
    throw new ApiError(400, "All fields are required");

  const userExists = await User.findOne({ $or: [{ username }, { email }] });

  if (userExists) throw new ApiError(400, "User already exists");

  const user = await User.create({
    fullname,
    username,
    email,
    password,
    role,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -__v -createdAt -updatedAt",
  );

  if (!createdUser) throw new ApiError(500, "Failed to create user");

  return createdUser;
};

const loginUserService = async (data) => {
  const { email, username, password } = data;
  if (!email && !username)
    throw new ApiError(400, "Username or Email is Required");

  const user = await User.findOne({ $or: [{ email }, { username }] });

  if (!user) throw new ApiError(404, "User does not exist");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -__v -createdAt -updatedAt",
  );

  return {
    accessToken,
    refreshToken,
    user: loggedInUser,
  };
};

const logoutUserService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.refreshToken = "";
  await user.save({ validateBeforeSave: false });

  return true;
};

const refreshAccessTokenService = async (incomingRefreshToken) => {
  if (!incomingRefreshToken)
    throw new ApiError(401, "Unauthorized: No refresh token provided");

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
  );
  const user = await User.findById(decodedToken?.id);

  if (!user) throw new ApiError(401, "Unauthorized: Invalid refresh token");

  if (user.refreshToken !== incomingRefreshToken)
    throw new ApiError(
      401,
      "Unauthorized: Refresh token expired or does not match",
    );

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  return { accessToken, refreshToken };
};

export {
  registerUserService,
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
};
