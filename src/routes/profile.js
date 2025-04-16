import express from "express";
import bcrypt from "bcrypt";
import { userAuth } from "../middlewares/auth.js";
import { validateEditProfileData } from "../utils/helper.js";
const router = express.Router();
router.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.send("Error" + error.message);
  }
});
router.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit req");
    }
    const editUser = req.user;
    Object.keys(req.body).forEach((key) => (editUser[key] = req.body[key]));
    await editUser.save();
    res.json({
      message: `${editUser.firstName} your profile edit successfully`,
      data: editUser,
    });
  } catch (error) {
    res.status(400).send("Error" + error.message);
  }
});

router.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { password, newPassword } = req.body;
    if (!password || !newPassword) {
      throw new Error("Please enter old and new password");
    }
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error("Enter valid password");
    }
    if (password === newPassword) {
      throw new Error("new passwrord must be different from old password");
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({
      message: "password change successfully",
    });
  } catch (error) {
    res.status(400).send("Error" + error.message);
  }
});

export default router;
