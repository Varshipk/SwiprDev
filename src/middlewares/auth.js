import jwt from "jsonwebtoken";
import User from "../models/user.js";
export const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please login");
    }
    const verifiedToken = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(verifiedToken._id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Error" + error.message);
  }
};
