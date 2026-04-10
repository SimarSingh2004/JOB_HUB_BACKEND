import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getMessagesController,
  sendMessageController,
} from "../controllers/message.controller.js";

const router = Router();

router.route("/").post(verifyJWT, sendMessageController);
router.route("/:conversationId").get(verifyJWT, getMessagesController);

export default router;
