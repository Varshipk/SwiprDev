import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Name must have character more than 3"],
      maxLength: [56, "Write a valid name"],
    },
    lastName: {
      type: String,
      trim: true,
      minLength: [2, "write a valid last name"],
      maxLength: [56, "write a valid last name"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Enter a valid email");
        }
      },
    },
    password: {
      type: String,
      validate: [validator.isStrongPassword, "Create Strong Password"],
    },
    age: {
      type: Number,
      required: true,
      min: [16, "Age must be greater than 16"],
    },
    gender: {
      type: String,
      required: true,
      enum: {
        values: ["Male", "Female", "Others"],
        message: "{VALUE} is not valid",
      },
    },
    skills: {
      type: [String],
    },
    about: {
      type: String,
    },
    photoUrl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCpY5LtQ47cqncKMYWucFP41NtJvXU06-tnQ&s",
      validate: [validator.isURL, "Invalid photo url"],
    },
  },
  { timestamps: true }
);
userSchema.methods.hashPassword = async function () {
  this.password = await bcrypt.hash(this.password, 10);
  return this.password;
};
userSchema.methods.validatePassword = async function (inputPasswordByuser) {
  const user = this;
  const isValidPassword = await bcrypt.compare(
    inputPasswordByuser,
    user.password
  );

  return isValidPassword;
};
userSchema.methods.getJwt = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

const User = mongoose.model("User", userSchema);
export default User;
