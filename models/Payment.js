import mongoose from "mongoose";
const { Schema, model } = mongoose;

const PaymentSchema = new Schema(
  {
    name: { type: String, required: true },
    to_user: { type: String, required: true, index: true },
    oid: { type: String, required: true, unique: true, index: true },
    message: { type: String, default: "" },
    amount: { type: Number, required: true },
    done: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Payment || model("Payment", PaymentSchema);
