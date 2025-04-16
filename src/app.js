import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import requestRouter from "./routes/request.js";
import userRouter from "./routes/user.js";
import chatRouter from "./routes/chat.js";
import { initializeSocket } from "./utils/socket.js";
import http from "http";
import cors from "cors";
const app = express();
const server = http.createServer(app);
initializeSocket(server);
import "dotenv/config";
import { dbConnect } from "./config/database.js";
dbConnect();
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with frontend URL
    credentials: true, // Allow cookies
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
server.listen(process.env.PORT || 4000, () => {
  console.log("Server is listening");
});
