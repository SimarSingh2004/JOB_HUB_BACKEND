import { generateAccessAndRefreshToken } from "../utils/jwt";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

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

export { registerUserService, loginUserService };
