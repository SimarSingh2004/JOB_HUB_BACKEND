import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";
import jobRouter from "./routes/job.routes.js";
import applicationRouter from "./routes/application.routes.js";
import conversationRouter from "./routes/conversation.routes.js";
import messageRouter from "./routes/message.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // data from url
app.use(express.static("public"));
app.use(cookieParser());

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/applications", applicationRouter);
app.use("/api/v1/conversations", conversationRouter);
app.use("/api/v1/messages", messageRouter);

export { app };
