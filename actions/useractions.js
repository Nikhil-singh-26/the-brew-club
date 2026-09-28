"use server";

import Razorpay from "razorpay";
import Payment from "@/models/Payment";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const initiate = async (amount, to_username, paymentform) => {
  try {
    await connectDb();

    const parsedAmount = Math.round(Number(amount));
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount < 100) {
      return { error: "Please enter a valid amount (minimum ₹1)." };
    }

    if (!to_username || typeof to_username !== "string") {
      return { error: "Invalid creator username." };
    }

    const user = await User.findOne({ username: to_username });
    if (!user) {
      return { error: "Creator not found." };
    }

    if (!user.razorpayid || !user.razorpaysecret) {
      return {
        error: "This creator has not configured their Razorpay payment credentials yet.",
      };
    }

    const instance = new Razorpay({
      key_id: user.razorpayid,
      key_secret: user.razorpaysecret,
    });

    const options = {
      amount: parsedAmount,
      currency: "INR",
      receipt: `rcpt_${Date.now().toString().slice(-8)}`,
    };

    const order = await instance.orders.create(options);

    await Payment.create({
      oid: order.id,
      amount: parsedAmount / 100,
      to_user: to_username,
      name: paymentform?.name?.trim() || "Supporter",
      message: paymentform?.message?.trim() || "",
      done: false,
    });

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: user.razorpayid,
    };
  } catch (error) {
    console.error("Error in initiate payment action:", error);
    return {
      error:
        error.message || "Failed to initialize payment. Please try again later.",
    };
  }
};

export const fetchuser = async (username) => {
  try {
    await connectDb();
    if (!username) return null;

    const u = await User.findOne({ username: username }).lean();
    if (!u) return null;

    const session = await getServerSession(authOptions);
    const isOwner = session?.user?.email === u.email;

    return {
      _id: u._id.toString(),
      name: u.name || "",
      username: u.username,
      email: isOwner ? u.email : undefined,
      profilepic: u.profilepic || "",
      coverpic: u.coverpic || "",
      bio: u.bio || "",
      razorpayid: u.razorpayid || "",
      razorpaysecret: isOwner ? u.razorpaysecret || "" : undefined,
    };
  } catch (error) {
    console.error("Error in fetchuser:", error);
    return null;
  }
};

export const fetchpayments = async (username) => {
  try {
    await connectDb();
    if (!username) return [];

    const payments = await Payment.find({ to_user: username, done: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return payments.map((p) => ({
      _id: p._id.toString(),
      name: p.name,
      to_user: p.to_user,
      oid: p.oid,
      message: p.message || "",
      amount: p.amount,
      done: p.done,
      createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    }));
  } catch (error) {
    console.error("Error in fetchpayments:", error);
    return [];
  }
};

export const updateProfile = async (data, oldusername) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { error: "You must be signed in to update your profile." };
    }

    await connectDb();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return { error: "User account not found." };
    }

    let ndata = {};
    if (data && typeof data.entries === "function") {
      ndata = Object.fromEntries(data.entries());
    } else if (typeof data === "object" && data !== null) {
      ndata = { ...data };
    }

    const newUsername = (ndata.username || currentUser.username)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, "");

    if (!newUsername || newUsername.length < 2) {
      return { error: "Username must be at least 2 alphanumeric characters." };
    }

    const reservedUsernames = [
      "dashboard",
      "profile",
      "login",
      "about",
      "api",
      "admin",
      "user",
      "terms",
      "privacy",
      "explore",
      "home",
      "creators",
      "favicon.ico",
    ];
    if (reservedUsernames.includes(newUsername)) {
      return {
        error: `The username '${newUsername}' is reserved. Please choose a different username.`,
      };
    }

    if (newUsername !== currentUser.username) {
      const existing = await User.findOne({
        username: newUsername,
        email: { $ne: currentUser.email },
      });
      if (existing) {
        return { error: "Username is already taken by another creator." };
      }

      await Payment.updateMany(
        { to_user: currentUser.username },
        { to_user: newUsername }
      );
    }

    const isValidHttpUrl = (string) => {
      if (!string || typeof string !== "string") return true;
      const trimmed = string.trim();
      if (!trimmed) return true;
      try {
        const url = new URL(trimmed);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch (_) {
        return false;
      }
    };

    const trimmedProfilePic =
      typeof ndata.profilepic === "string" ? ndata.profilepic.trim() : currentUser.profilepic;
    const trimmedCoverPic =
      typeof ndata.coverpic === "string" ? ndata.coverpic.trim() : currentUser.coverpic;

    if (trimmedProfilePic && !isValidHttpUrl(trimmedProfilePic)) {
      return {
        error: "Profile picture must be a valid URL starting with http:// or https://",
      };
    }

    if (trimmedCoverPic && !isValidHttpUrl(trimmedCoverPic)) {
      return {
        error: "Cover banner must be a valid URL starting with http:// or https://",
      };
    }

    const updatedName =
      typeof ndata.name === "string" ? ndata.name.trim() : currentUser.name;
    const updatedBio =
      typeof ndata.bio === "string" ? ndata.bio.trim() : (currentUser.bio || "");
    const updatedRazorpayId =
      typeof ndata.razorpayid === "string" ? ndata.razorpayid.trim() : currentUser.razorpayid;
    const updatedRazorpaySecret =
      typeof ndata.razorpaysecret === "string" ? ndata.razorpaysecret.trim() : currentUser.razorpaysecret;

    await User.updateOne(
      { email: currentUser.email },
      {
        $set: {
          name: updatedName,
          username: newUsername,
          bio: updatedBio,
          profilepic: trimmedProfilePic,
          coverpic: trimmedCoverPic,
          razorpayid: updatedRazorpayId,
          razorpaysecret: updatedRazorpaySecret,
        },
      }
    );

    return {
      success: true,
      message: "Profile updated successfully.",
      username: newUsername,
      user: {
        name: updatedName,
        username: newUsername,
        bio: updatedBio,
        profilepic: trimmedProfilePic,
        coverpic: trimmedCoverPic,
        razorpayid: updatedRazorpayId,
      },
    };
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return { error: error.message || "Failed to update profile." };
  }
};

export const fetchCreators = async ({ search = "", skip = 0, limit = 10 } = {}) => {
  try {
    await connectDb();

    const sanitizedSkip = Math.max(0, parseInt(skip, 10) || 0);
    const sanitizedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const sanitizedSearch = typeof search === "string" ? search.trim() : "";

    const query = {
      username: { $exists: true, $ne: "" },
    };

    if (sanitizedSearch) {
      const escaped = sanitizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escaped, "i");
      query.$or = [
        { username: searchRegex },
        { name: searchRegex },
        { bio: searchRegex },
      ];
    }

    const total = await User.countDocuments(query);
    const rawCreators = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(sanitizedSkip)
      .limit(sanitizedLimit)
      .select("name username profilepic coverpic bio createdAt razorpayid")
      .lean();

    const creators = rawCreators.map((u) => ({
      _id: u._id.toString(),
      name: u.name || "",
      username: u.username,
      profilepic: u.profilepic || "",
      coverpic: u.coverpic || "",
      bio: u.bio || "",
      createdAt: u.createdAt ? u.createdAt.toISOString() : null,
      hasPaymentConfigured: Boolean(u.razorpayid),
    }));

    return {
      success: true,
      creators,
      total,
      hasMore: sanitizedSkip + creators.length < total,
      skip: sanitizedSkip,
      limit: sanitizedLimit,
    };
  } catch (error) {
    console.error("Error in fetchCreators:", error);
    return {
      success: false,
      error: "Failed to fetch creators.",
      creators: [],
      total: 0,
      hasMore: false,
      skip: 0,
      limit: 10,
    };
  }
};

export const registerUser = async (formData) => {
  try {
    let email = "";
    let password = "";

    if (formData && typeof formData.get === "function") {
      email = formData.get("email");
      password = formData.get("password");
    } else if (formData && typeof formData === "object") {
      email = formData.email;
      password = formData.password;
    }

    const rawEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const rawPassword = typeof password === "string" ? password : "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      return {
        success: false,
        error: "Please enter a valid email address.",
      };
    }

    if (!rawPassword || rawPassword.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long.",
      };
    }

    await connectDb();

    const existingUser = await User.findOne({ email: rawEmail });
    if (existingUser) {
      if (existingUser.password) {
        return {
          success: false,
          error: "An account with this email already exists. Please log in.",
        };
      } else {
        return {
          success: false,
          error:
            "This email was registered with Google or GitHub. Please log in using that provider.",
        };
      }
    }

    let baseUsername = rawEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!baseUsername || baseUsername.length < 2) {
      baseUsername = "user";
    }

    const reservedUsernames = [
      "dashboard",
      "profile",
      "login",
      "join",
      "about",
      "api",
      "admin",
      "user",
      "terms",
      "privacy",
      "explore",
      "home",
      "creators",
      "favicon.ico",
    ];

    let finalUsername = baseUsername;
    let counter = 1;
    while (
      reservedUsernames.includes(finalUsername) ||
      (await User.findOne({ username: finalUsername }))
    ) {
      finalUsername = `${baseUsername}${counter}`;
      counter++;
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await User.create({
      email: rawEmail,
      name: baseUsername,
      username: finalUsername,
      password: hashedPassword,
      profilepic: "",
      coverpic: "",
      bio: "",
      razorpayid: "",
      razorpaysecret: "",
    });

    return {
      success: true,
      message: "Account created successfully.",
      username: finalUsername,
    };
  } catch (error) {
    console.error("Error in registerUser:", error);
    return {
      success: false,
      error: error.message || "Failed to create account. Please try again.",
    };
  }
};

