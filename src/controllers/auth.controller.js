import {
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  registerUserService,
} from "../services/auth.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUserController = asyncHandler(async (req, res) => {
  const user = await registerUserService(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

const loginUserController = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await loginUserService(req.body);
  const options = {
    httpOnly: true,
    secure: false, // set to true in production
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, user },
        "User logged in successfully",
      ),
    );
});

const logoutUserController = asyncHandler(async (req, res) => {
  await logoutUserService(req.user._id);

  return res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessTokenController = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  const { accessToken, refreshToken } =
    await refreshAccessTokenService(incomingRefreshToken);

  const options = {
    httpOnly: true,
    secure: false, // set to true in production
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken },
        "Access token refreshed successfully",
      ),
    );
});

export {
  registerUserController,
  loginUserController,
  logoutUserController,
  refreshAccessTokenController,
};
