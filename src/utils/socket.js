import { Server } from "socket.io";
import { socketAuth } from "../middlewares/socketAuth.js";
import Chat from "../models/chat.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
  io.use(socketAuth);
  io.on("connection", (socket) => {
    socket.on("joinChat", ({ senderId, recieverId }) => {
      const roomId = [senderId, recieverId].sort().join("_");
      socket.join(roomId);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, senderId, recieverId, text }) => {
        try {
          const roomId = [senderId, recieverId].sort().join("_");
          let chat = await Chat.findOne({
            participants: { $all: [senderId, recieverId] },
          });
          if (!chat) {
            chat = new Chat({
              participants: [senderId, recieverId],
              messages: [],
            });
          }
          chat.messages.push({
            senderId,
            text,
          });
          await chat.save();
          io.to(roomId).emit("messageRecieved", { firstName, text });
        } catch (error) {
          console.error(error.message);
        }
      }
    );
    socket.on("typing", ({ senderId, recieverId }) => {
      const roomId = [senderId, recieverId].sort().join("_");
      io.to(roomId).emit("display_typing", { senderId, recieverId });
    });
    socket.on("stop_typing", ({ senderId, recieverId }) => {
      const roomId = [senderId, recieverId].sort().join("_");
      io.to(roomId).emit("hide_typing");
    });
    socket.on("disconnect", () => {});
  });
};
