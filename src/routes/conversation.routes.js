import { Router } from "express";
import {
  createConversationController,
  getConversationsController,
} from "../controllers/conversation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { onlyRecruiter } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, onlyRecruiter, createConversationController);
router.route("/").get(verifyJWT, getConversationsController);

export default router;
