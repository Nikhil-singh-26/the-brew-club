import { NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import Payment from "@/models/Payment";
import connectDb from "@/db/connectDb";
import User from "@/models/User";

export const POST = async (req) => {
  try {
    await connectDb();
    const formData = await req.formData();
    const body = Object.fromEntries(formData);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const origin =
      process.env.NEXT_PUBLIC_URL ||
      req.headers.get("origin") ||
      req.nextUrl.origin ||
      "http://localhost:3000";

    if (!razorpay_order_id) {
      return NextResponse.json(
        { success: false, message: "Order ID is required." },
        { status: 400 }
      );
    }

    const p = await Payment.findOne({ oid: razorpay_order_id });
    if (!p) {
      return NextResponse.json(
        { success: false, message: "Order ID not found in records." },
        { status: 404 }
      );
    }

    const user = await User.findOne({ username: p.to_user });
    if (!user || !user.razorpaysecret) {
      return NextResponse.json(
        { success: false, message: "Creator payment configuration missing." },
        { status: 500 }
      );
    }

    const isValid = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      user.razorpaysecret
    );

    if (isValid) {
      const updatedPayment = await Payment.findOneAndUpdate(
        { oid: razorpay_order_id },
        { done: true },
        { new: true }
      );

      const redirectUrl = new URL(`/${updatedPayment.to_user}`, origin);
      redirectUrl.searchParams.set("paymentdone", "true");

      return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
    } else {
      const redirectUrl = new URL(`/${p.to_user}`, origin);
      redirectUrl.searchParams.set("paymentdone", "failed");

      return NextResponse.redirect(redirectUrl.toString(), { status: 303 });
    }
  } catch (error) {
    console.error("Error processing Razorpay callback:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during verification." },
      { status: 500 }
    );
  }
};