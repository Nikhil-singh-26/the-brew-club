import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: "" },
    profilepic: { type: String, default: "" },
    coverpic: { type: String, default: "" },
    bio: { type: String, default: "" },
    about: { type: String, default: "" },
    currentWork: { type: String, default: "" },
    whySupport: { type: String, default: "" },
    skills: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    projects: {
      type: [
        {
          name: { type: String, default: "" },
          description: { type: String, default: "" },
          image: { type: String, default: "" },
          github: { type: String, default: "" },
          live: { type: String, default: "" },
          url: { type: String, default: "" },
        },
      ],
      default: [],
    },
    socialLinks: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      portfolio: { type: String, default: "" },
      twitter: { type: String, default: "" },
      other: { type: String, default: "" },
    },
    razorpayid: { type: String, default: "" },
    razorpaysecret: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.User || model("User", UserSchema);
