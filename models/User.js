import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ProjectSchema = new Schema(
  {
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    github: { type: String, default: "" },
    live: { type: String, default: "" },
    url: { type: String, default: "" },
    technologies: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["In Progress", "Completed", "Archived"],
      default: "In Progress",
    },
    featured: { type: Boolean, default: false },
  },
  { _id: false }
);

const SocialLinksSchema = new Schema(
  {
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    twitter: { type: String, default: "" },
    other: { type: String, default: "" },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    profilepic: { type: String, default: "" },
    coverpic: { type: String, default: "" },
    bio: { type: String, default: "" },
    about: { type: String, default: "" },
    currentWork: { type: String, default: "" },
    whySupport: { type: String, default: "" },
    supportPurpose: { type: String, default: "" },
    thankYouMessage: { type: String, default: "" },
    skills: { type: [String], default: [] },
    achievements: { type: [String], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    razorpayid: { type: String, default: "" },
    razorpaysecret: { type: String, default: "" },
    paymentMethod: {
      type: String,
      enum: ["razorpay_link", "razorpay_gateway"],
      default: "razorpay_gateway",
    },
    razorpayLink: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.User || model("User", UserSchema);
