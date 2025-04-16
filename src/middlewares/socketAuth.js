import cookie from "cookie";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const socketAuth = async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    const token = cookies.token;
    if (!token) {
      return res.status(401).send("Please login");
    }
    const verifiedToken = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verifiedToken._id);
    if (!user) {
      throw new Error("User not found");
    }
    socket.user = user;
    next();
  } catch (error) {
    return next(new Error("Authentication error: Invalid token"));
  }
};
