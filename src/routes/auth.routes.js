import { Router } from "express";
import {
  loginUserController,
  logoutUserController,
  registerUserController,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUserController);
router.route("/login").post(loginUserController);

//secured Routes
router.route("/logout").post(verifyJWT, logoutUserController);

export default router;
