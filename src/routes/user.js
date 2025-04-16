import express from "express";
import { userAuth } from "../middlewares/auth.js";
import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";

const router = express.Router();
const userData = "firstName lastName age gender photoUrl skills about";
router.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      recieverId: loggedInUser._id,
      status: "interested",
    }).populate("senderId", userData);
    res.json({
      message: "data fetched successfully",
      data: connectionRequests,
    });
  } catch (error) {
    res.status(400).send("Error" + error.message);
  }
});

router.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { senderId: loggedInUser._id, status: "accepted" },
        { recieverId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("senderId", userData)
      .populate("recieverId", userData);

    const data = connectionRequests.map((row) => {
      if (row.senderId._id.equals(loggedInUser._id)) {
        return row.recieverId;
      }
      return row.senderId;
    });
    res.json({ data });
  } catch (error) {
    res.send("Error" + error.message);
  }
});

router.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    let limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    limit = limit > 20 ? 20 : limit;

    // const sentRequests = await ConnectionRequest.find({
    //   senderId: loggedInUser._id,
    // }).distinct("recieverId");
    // const recievedRequests = await ConnectionRequest.find({
    //   recieverId: loggedInUser._id,
    // }).distinct("senderId");
    // const availableUser = await User.find({
    //   _id: {
    //     $nin: [...sentRequests, ...recievedRequests, loggedInUser._id],
    //   },
    // });

    // Another way to find User
    const connectionRequest = await ConnectionRequest.find({
      $or: [{ senderId: loggedInUser._id }, { recieverId: loggedInUser._id }],
    }).select("senderId recieverId");
    const hideUser = new Set();

    connectionRequest.forEach((element) => {
      hideUser.add(element.senderId.toString());
      hideUser.add(element.recieverId.toString());
    });

    const availableUser = await User.find({
      $and: [
        {
          _id: {
            $nin: Array.from(hideUser),
          },
        },
        {
          _id: {
            $ne: loggedInUser._id,
          },
        },
      ],
    })
      .select(userData)
      .skip(skip)
      .limit(limit);

    res.json(availableUser);
  } catch (error) {
    res.send("Error" + error.message);
  }
});

export default router;
