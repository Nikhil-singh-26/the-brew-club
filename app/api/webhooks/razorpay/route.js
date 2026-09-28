import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import Payment from "@/models/Payment";
import Notification from "@/models/Notification";

/**
 * Verify Razorpay Webhook signature using HMAC-SHA256.
 */
function verifyWebhookSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret.trim())
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const signatureBuf = Buffer.from(signature.trim(), "utf8");

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

/**
 * Helper to extract supporter message from various Razorpay notes formats.
 */
function extractSupporterMessage(paymentNotes, linkNotes) {
  const notes = { ...linkNotes, ...paymentNotes };
  if (!notes || typeof notes !== "object") return "";

  const potentialKeys = [
    "message",
    "note",
    "comment",
    "supporter_message",
    "supporterMessage",
    "note_of_encouragement",
    "Note",
    "Message",
    "Comment",
    "description",
  ];

  for (const key of potentialKeys) {
    if (notes[key] && typeof notes[key] === "string" && notes[key].trim()) {
      return notes[key].trim().slice(0, 300);
    }
  }

  for (const [key, val] of Object.entries(notes)) {
    if (
      typeof val === "string" &&
      val.trim() &&
      (key.toLowerCase().includes("note") ||
        key.toLowerCase().includes("message") ||
        key.toLowerCase().includes("comment"))
    ) {
      return val.trim().slice(0, 300);
    }
  }

  return "";
}

/**
 * Helper to identify the The Brew Club creator username from webhook payload.
 */
async function resolveCreator(eventPayload) {
  const payment = eventPayload?.payment?.entity;
  const paymentLink = eventPayload?.payment_link?.entity;
  const order = eventPayload?.order?.entity;

  const paymentNotes = payment?.notes || {};
  const linkNotes = paymentLink?.notes || {};

  // Strategy 1: Explicit creator username in notes
  const noteUsername =
    paymentNotes.creator ||
    paymentNotes.to_user ||
    paymentNotes.username ||
    linkNotes.creator ||
    linkNotes.to_user ||
    linkNotes.username;

  if (noteUsername && typeof noteUsername === "string") {
    const creator = await User.findOne({
      username: noteUsername.toLowerCase().trim(),
    });
    if (creator) return creator;
  }

  // Strategy 2: Match against stored Payment Link URL or ID
  const linkUrl = paymentLink?.short_url || paymentLink?.url || "";

  if (linkUrl) {
    const creatorByLink = await User.findOne({
      $or: [
        { razorpayLink: linkUrl },
        { razorpayLink: { $regex: linkUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      ],
    });
    if (creatorByLink) return creatorByLink;

    const handleMatch = linkUrl.match(/razorpay\.me\/@([a-zA-Z0-9_-]+)/i);
    if (handleMatch && handleMatch[1]) {
      const creatorByHandle = await User.findOne({
        username: handleMatch[1].toLowerCase().trim(),
      });
      if (creatorByHandle) return creatorByHandle;
    }
  }

  // Strategy 3: Check order_id against existing Payment records
  const orderId = payment?.order_id || order?.id;
  if (orderId) {
    const existingPayment = await Payment.findOne({ oid: orderId });
    if (existingPayment?.to_user) {
      const creator = await User.findOne({ username: existingPayment.to_user });
      if (creator) return creator;
    }
  }

  // Strategy 4: Creator mention in description
  const description = payment?.description || paymentLink?.description || "";
  if (description) {
    const atMatch = description.match(/@([a-zA-Z0-9_-]+)/);
    if (atMatch && atMatch[1]) {
      const creator = await User.findOne({
        username: atMatch[1].toLowerCase().trim(),
      });
      if (creator) return creator;
    }
  }

  return null;
}

export const POST = async (req) => {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    if (!rawBody) {
      return NextResponse.json(
        { success: false, message: "Empty payload." },
        { status: 400 }
      );
    }

    await connectDb();

    let eventData;
    try {
      eventData = JSON.parse(rawBody);
    } catch (parseErr) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON format." },
        { status: 400 }
      );
    }

    const event = eventData?.event || "";
    const payload = eventData?.payload || {};
    const payment = payload?.payment?.entity;
    const paymentLink = payload?.payment_link?.entity;

    // Supported payment events
    const supportedEvents = [
      "payment_link.paid",
      "payment.captured",
      "order.paid",
      "payment.authorized",
    ];

    if (!supportedEvents.includes(event)) {
      return NextResponse.json(
        { status: "ignored", message: `Event '${event}' not processed.` },
        { status: 200 }
      );
    }

    // Resolve creator from payload
    const creator = await resolveCreator(payload);

    // Signature verification against available secrets
    const possibleSecrets = [
      process.env.RAZORPAY_WEBHOOK_SECRET,
      process.env.KEY_SECRET,
      creator?.razorpaysecret,
    ].filter((s) => typeof s === "string" && s.trim());

    let isSignatureValid = false;

    if (possibleSecrets.length > 0) {
      if (!signature) {
        return NextResponse.json(
          { success: false, message: "Missing Razorpay webhook signature header." },
          { status: 401 }
        );
      }
      for (const secret of possibleSecrets) {
        if (verifyWebhookSignature(rawBody, signature, secret)) {
          isSignatureValid = true;
          break;
        }
      }

      if (!isSignatureValid) {
        console.error("Invalid Razorpay webhook signature received.");
        return NextResponse.json(
          { success: false, message: "Invalid webhook signature." },
          { status: 401 }
        );
      }
    }

    if (!payment && !paymentLink) {
      return NextResponse.json(
        { success: false, message: "No payment entity found in payload." },
        { status: 400 }
      );
    }

    // Determine target creator username
    const toUser = creator?.username || payment?.notes?.creator || paymentLink?.notes?.creator;
    if (!toUser) {
      console.warn("Could not determine creator for webhook payment:", payment?.id || paymentLink?.id);
      return NextResponse.json(
        { status: "unmatched", message: "Creator could not be resolved from payload." },
        { status: 200 }
      );
    }

    // Extract Payment & Supporter details
    const paymentId = payment?.id || `pay_link_${Date.now()}`;
    const orderId = payment?.order_id || paymentLink?.id || paymentId;
    const rawAmount = payment?.amount || paymentLink?.amount_paid || paymentLink?.amount || 0;
    const amountInRupees = Math.round(Number(rawAmount)) / 100;

    const supporterNotes = payment?.notes || {};
    const linkNotes = paymentLink?.notes || {};
    const supporterMessage = extractSupporterMessage(supporterNotes, linkNotes);

    const isAnonymous = Boolean(
      supporterNotes.isAnonymous === true ||
      supporterNotes.isAnonymous === "true" ||
      linkNotes.isAnonymous === true ||
      linkNotes.isAnonymous === "true"
    );

    const rawName =
      supporterNotes.name ||
      supporterNotes.supporter_name ||
      paymentLink?.customer?.name ||
      (payment?.email ? payment.email.split("@")[0] : "Supporter");

    const supporterName = isAnonymous ? "Anonymous Supporter" : (rawName || "Supporter").trim();
    const supporterEmail = payment?.email || paymentLink?.customer?.email || "";
    const paymentMethod = paymentLink ? "razorpay_link" : "razorpay_gateway";

    // ========================================================================
    // IDEMPOTENCY CHECK
    // ========================================================================
    const existingPayment = await Payment.findOne({
      $or: [
        { paymentId: paymentId },
        { oid: orderId },
      ],
    });

    if (existingPayment) {
      if (existingPayment.done) {
        return NextResponse.json(
          { status: "ok", message: "Payment already recorded (idempotent)." },
          { status: 200 }
        );
      } else {
        await Payment.updateOne(
          { _id: existingPayment._id },
          {
            $set: {
              done: true,
              paymentId: paymentId,
              paymentMethod: paymentMethod,
              amount: amountInRupees > 0 ? amountInRupees : existingPayment.amount,
              message: supporterMessage || existingPayment.message,
              name: supporterName || existingPayment.name,
              supporter_email: supporterEmail || existingPayment.supporter_email,
              isAnonymous: isAnonymous,
            },
          }
        );

        try {
          await Notification.create({
            recipientUsername: toUser,
            type: "payment",
            title: `Received ₹${(amountInRupees || existingPayment.amount).toLocaleString("en-IN")} from ${supporterName}`,
            message: supporterMessage || existingPayment.message || "Supported via Razorpay",
            amount: amountInRupees || existingPayment.amount,
          });
        } catch (notifErr) {
          console.error("Failed to create notification:", notifErr);
        }

        return NextResponse.json(
          { status: "ok", message: "Pending payment updated to done." },
          { status: 200 }
        );
      }
    }

    // ========================================================================
    // CREATE NEW CONTRIBUTION RECORD
    // ========================================================================
    const newPayment = await Payment.create({
      name: supporterName,
      to_user: toUser,
      supporter_email: supporterEmail,
      oid: orderId,
      paymentId: paymentId,
      paymentMethod: paymentMethod,
      message: supporterMessage,
      amount: amountInRupees,
      done: true,
      isAnonymous: isAnonymous,
    });

    try {
      await Notification.create({
        recipientUsername: toUser,
        type: "payment",
        title: `Received ₹${amountInRupees.toLocaleString("en-IN")} from ${supporterName}`,
        message: supporterMessage || "Supported via Razorpay Payment Link",
        amount: amountInRupees,
      });
    } catch (notifErr) {
      console.error("Failed to create notification on webhook:", notifErr);
    }

    return NextResponse.json(
      {
        status: "ok",
        message: "Contribution recorded successfully.",
        paymentId: newPayment.paymentId,
        creator: toUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during webhook processing." },
      { status: 500 }
    );
  }
};
