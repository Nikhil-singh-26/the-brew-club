import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PaymentSchema = new Schema(
  {
    name: { type: String, default: "Supporter" },
    to_user: { type: String, required: true, index: true },
    supporter_email: { type: String, default: "", index: true },
    oid: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, default: "", index: true },
    paymentMethod: {
      type: String,
      enum: ["razorpay_gateway", "razorpay_link"],
      default: "razorpay_gateway",
    },
    message: { type: String, default: "" },
    amount: { type: Number, required: true },
    done: { type: Boolean, default: false, index: true },
    isAnonymous: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || model("Payment", PaymentSchema);
