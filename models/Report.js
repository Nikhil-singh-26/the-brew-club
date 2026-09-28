import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ReportSchema = new Schema(
  {
    reporterEmail: { type: String, default: "" },
    targetUsername: { type: String, required: true, index: true },
    reason: {
      type: String,
      required: true,
      enum: ["Spam", "Misleading Content", "Copyright Concern", "Harassment", "Other"],
    },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed", "actioned"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Report || model("Report", ReportSchema);
