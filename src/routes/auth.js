import express from "express";
import User from "../models/user.js";

const router = express.Router();
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, gender, age, password } = req.body;

  try {
    const newuser = User({
      firstName,
      lastName,
      email,
      gender,
      age,
      password,
    });
    await newuser.hashPassword();
    await newuser.save();
    const token = await newuser.getJwt();
    res.cookie("token", token);
    res.send(newuser);
  } catch (error) {
    res.send(error.message);
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Wrong email or password");
    }
    const validPassword = await user.validatePassword(password);
    if (!validPassword) {
      throw new Error("Wrong email or password");
    }
    const token = await user.getJwt();
    res.cookie("token", token);
    res.send(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});
router.post("/logout", (req, res) => {
  res
    .cookie("token", null, { expires: new Date(Date.now()) })
    .send("Logged out");
});

export default router;
