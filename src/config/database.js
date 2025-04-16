import mongoose from "mongoose";

export const dbConnect = async () => {
  await mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log("DB connect"))
    .catch((e) => {
      console.log(e);
    });
};
