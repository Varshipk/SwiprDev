import express from "express";
const router = express.Router();
import { userAuth } from "../middlewares/auth.js";
import User from "../models/user.js";
import ConnectionRequest from "../models/connectionRequest.js";
router.post("/request/send/:status/:recieverId", userAuth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const recieverId = req.params.recieverId;
    const status = req.params.status;
    const isAllowedStatus = ["interested", "ignored"];
    if (!isAllowedStatus.includes(status)) {
      return res.status(404).json({
        message: `${status} is not allowed`,
      });
    }
    const findReciever = await User.findById(recieverId);
    if (!findReciever) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        {
          senderId,
          recieverId,
        },
        {
          senderId: recieverId,
          recieverId: senderId,
        },
      ],
    });

    if (existingRequest) {
      return res.status(404).json({
        message: "Connection request already existing",
      });
    }
    const newConnectionRequest = new ConnectionRequest({
      senderId,
      recieverId,
      status,
    });
    const data = await newConnectionRequest.save();
    res.json({
      message: "request send",
      data,
    });
  } catch (error) {
    res.status(400).send("Error" + error.message);
  }
});

router.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedInUser = req.user;
      if (!["accepted", "rejected"].includes(status)) {
        return res.status(400).json({
          message: `Invalid ${status}`,
        });
      }
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        recieverId: loggedInUser._id,
        status: "interested",
      });
      if (!connectionRequest) {
        return res.status(400).json({
          message: "Invalid request id",
        });
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({
        message: "connection request" + status,
        data,
      });
    } catch (error) {
      res.status(400).send("Error" + error.message);
    }
  }
);

export default router;
