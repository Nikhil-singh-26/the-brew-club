import mongoose from "mongoose";
const { Schema, model } = mongoose;

const NotificationSchema = new Schema(
  {
    recipientUsername: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["payment", "system"],
      default: "payment",
    },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  model("Notification", NotificationSchema);
