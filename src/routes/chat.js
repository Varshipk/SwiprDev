import express from "express";
import { userAuth } from "../middlewares/auth.js";
import Chat from "../models/chat.js";

const router = express.Router();

router.get("/chat/:recieverId", userAuth, async (req, res) => {
  const senderId = req.user._id;
  const { recieverId } = req.params;
  let chat = await Chat.findOne({
    participants: {
      $all: [senderId, recieverId],
    },
  }).populate({
    path: "messages.senderId",
    select: "firstName lastName",
  });
  if (!chat) {
    chat = new Chat({
      participants: [senderId, recieverId],
      messages: [],
    });
    await chat.save();
  }
  res.json(chat);
});

export default router;
