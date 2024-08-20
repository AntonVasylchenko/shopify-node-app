import mongoose from "mongoose";

export function connectDB(url) {
  return mongoose
    .connect(url)
    .then(() => {
      console.log("Conneted to the DB");
    })
    .catch((err) => {
      console.log(err);
    });
}
