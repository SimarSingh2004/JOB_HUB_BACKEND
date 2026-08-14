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

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const loginUserController = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await loginUserService(req.body);
  const options = cookieOptions;

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken, user },
        "User logged in successfully",
      ),
    );
});

const logoutUserController = asyncHandler(async (req, res) => {
  // req.user may be undefined if the access token had already expired by
  // the time logout was tapped — that's fine, logging out should always
  // succeed. If we do have a valid user, also invalidate their stored
  // refresh token; otherwise just clear cookies client-side.
  if (req.user) {
    await logoutUserService(req.user._id);
  }

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

  const options = cookieOptions;

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken }, // Return the new refresh token in the response body as well
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
