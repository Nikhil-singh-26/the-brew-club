import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    username: { type: String, required: true, unique: true, index: true },
    profilepic: { type: String, default: "" },
    coverpic: { type: String, default: "" },
    razorpayid: { type: String, default: "" },
    razorpaysecret: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.User || model("User", UserSchema);
