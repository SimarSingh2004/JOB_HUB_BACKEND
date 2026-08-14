import { Router } from "express";
import {
  loginUserController,
  logoutUserController,
  refreshAccessTokenController,
  registerUserController,
} from "../controllers/auth.controller.js";
import { attachUserIfPresent } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUserController);
router.route("/login").post(loginUserController);
router.route("/refresh-token").post(refreshAccessTokenController);

//secured Routes
router.route("/logout").post(attachUserIfPresent, logoutUserController);

export default router;
