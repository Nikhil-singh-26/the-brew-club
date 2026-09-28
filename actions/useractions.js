"use server";

import Razorpay from "razorpay";
import Payment from "@/models/Payment";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import SavedCreator from "@/models/SavedCreator";
import Notification from "@/models/Notification";
import Report from "@/models/Report";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// ============================================================================
// 1. PAYMENT INITIATION ACTION
// ============================================================================
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

    const user = await User.findOne({ username: to_username.toLowerCase().trim() });
    if (!user) {
      return { error: "Creator not found." };
    }

    if (user.paymentMethod === "razorpay_link" && user.razorpayLink) {
      return {
        error: "This creator accepts support via their personalized Razorpay Payment Link.",
        paymentMethod: "razorpay_link",
        paymentLink: user.razorpayLink,
      };
    }

    if (!user.razorpayid || !user.razorpaysecret) {
      return {
        error: "This creator has not configured their Razorpay payment gateway credentials yet.",
      };
    }

    const session = await getServerSession(authOptions);
    const supporterEmail = session?.user?.email || "";

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

    const isAnonymous = Boolean(paymentform?.isAnonymous);
    const rawSupporterName = paymentform?.name?.trim() || (isAnonymous ? "Anonymous Supporter" : "Supporter");
    const rawMessage = paymentform?.message?.trim()?.slice(0, 300) || "";

    await Payment.create({
      oid: order.id,
      amount: parsedAmount / 100,
      to_user: user.username,
      name: isAnonymous ? "Anonymous Supporter" : rawSupporterName,
      supporter_email: supporterEmail,
      message: rawMessage,
      isAnonymous: isAnonymous,
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
      error: error.message || "Failed to initialize payment. Please try again later.",
    };
  }
};

// ============================================================================
// 2. FETCH CREATOR PROFILE (PUBLIC & OWNER AWARE)
// ============================================================================
export const fetchuser = async (username) => {
  try {
    await connectDb();
    if (!username || typeof username !== "string") return null;

    const cleanUsername = username.toLowerCase().trim();
    const u = await User.findOne({ username: cleanUsername }).lean();
    if (!u) return null;

    const session = await getServerSession(authOptions);
    const isOwner = session?.user?.email === u.email;

    const paymentMethod = u.paymentMethod || (u.razorpayLink && !u.razorpayid ? "razorpay_link" : "razorpay_gateway");
    const gatewayConfigured = Boolean(u.razorpayid && u.razorpaysecret);
    const hasPaymentConfigured =
      (paymentMethod === "razorpay_link" && Boolean(u.razorpayLink)) ||
      (paymentMethod === "razorpay_gateway" && Boolean(u.razorpayid)) ||
      Boolean(u.razorpayLink) ||
      Boolean(u.razorpayid);

    return {
      _id: u._id.toString(),
      name: u.name || "",
      username: u.username,
      email: isOwner ? u.email : undefined,
      profilepic: u.profilepic || "",
      coverpic: u.coverpic || "",
      bio: u.bio || "",
      about: u.about || "",
      currentWork: u.currentWork || "",
      whySupport: u.whySupport || "",
      supportPurpose: u.supportPurpose || "",
      thankYouMessage: u.thankYouMessage || "",
      skills: Array.isArray(u.skills) ? u.skills : [],
      achievements: Array.isArray(u.achievements) ? u.achievements : [],
      projects: Array.isArray(u.projects)
        ? u.projects.map((p) => ({
            name: p.name || "",
            description: p.description || "",
            image: p.image || "",
            github: p.github || "",
            live: p.live || "",
            url: p.url || "",
            technologies: Array.isArray(p.technologies) ? p.technologies : [],
            status: p.status || "In Progress",
            featured: Boolean(p.featured),
          }))
        : [],
      socialLinks: {
        github: u.socialLinks?.github || "",
        linkedin: u.socialLinks?.linkedin || "",
        portfolio: u.socialLinks?.portfolio || "",
        twitter: u.socialLinks?.twitter || "",
        other: u.socialLinks?.other || "",
      },
      role: isOwner ? u.role || "user" : undefined,
      paymentMethod,
      razorpayLink: u.razorpayLink || "",
      razorpayid: u.razorpayid || "",
      gatewayConfigured: isOwner ? gatewayConfigured : undefined,
      isTestGateway: isOwner && u.razorpayid ? u.razorpayid.startsWith("rzp_test_") : undefined,
      isLiveGateway: isOwner && u.razorpayid ? u.razorpayid.startsWith("rzp_live_") : undefined,
      hasPaymentConfigured,
      // CRITICAL SECURITY: razorpaysecret is NEVER returned to the client
      razorpaysecret: undefined,
    };
  } catch (error) {
    console.error("Error in fetchuser:", error);
    return null;
  }
};

// ============================================================================
// 3. FETCH RECENT CREATOR PAYMENTS
// ============================================================================
export const fetchpayments = async (username) => {
  try {
    await connectDb();
    if (!username) return [];

    const payments = await Payment.find({
      to_user: username.toLowerCase().trim(),
      done: true,
    })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    return payments.map((p) => ({
      _id: p._id.toString(),
      name: p.isAnonymous ? "Anonymous Supporter" : p.name,
      to_user: p.to_user,
      oid: p.oid,
      message: p.message || "",
      amount: p.amount,
      done: p.done,
      isAnonymous: Boolean(p.isAnonymous),
      createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    }));
  } catch (error) {
    console.error("Error in fetchpayments:", error);
    return [];
  }
};

// ============================================================================
// 4. UPDATE PROFILE ACTION
// ============================================================================
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

      await SavedCreator.updateMany(
        { creatorUsername: currentUser.username },
        { creatorUsername: newUsername }
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
      typeof ndata.bio === "string" ? ndata.bio.trim() : currentUser.bio || "";
    const updatedAbout =
      typeof ndata.about === "string" ? ndata.about.trim() : currentUser.about || "";
    const updatedCurrentWork =
      typeof ndata.currentWork === "string" ? ndata.currentWork.trim() : currentUser.currentWork || "";
    const updatedWhySupport =
      typeof ndata.whySupport === "string" ? ndata.whySupport.trim() : currentUser.whySupport || "";
    const updatedSupportPurpose =
      typeof ndata.supportPurpose === "string" ? ndata.supportPurpose.trim() : currentUser.supportPurpose || "";
    const updatedThankYouMessage =
      typeof ndata.thankYouMessage === "string" ? ndata.thankYouMessage.trim() : currentUser.thankYouMessage || "";

    // Parse and sanitize skills
    let updatedSkills = [];
    if (Array.isArray(ndata.skills)) {
      updatedSkills = ndata.skills
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter((s) => s.length > 0);
    } else if (typeof ndata.skills === "string") {
      updatedSkills = ndata.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else if (Array.isArray(currentUser.skills)) {
      updatedSkills = currentUser.skills;
    }

    // Parse and sanitize achievements
    let updatedAchievements = [];
    if (Array.isArray(ndata.achievements)) {
      updatedAchievements = ndata.achievements
        .map((a) => (typeof a === "string" ? a.trim() : ""))
        .filter((a) => a.length > 0);
    } else if (typeof ndata.achievements === "string" && ndata.achievements.trim()) {
      updatedAchievements = ndata.achievements
        .split("\n")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
    } else if (Array.isArray(currentUser.achievements)) {
      updatedAchievements = currentUser.achievements;
    }

    // Parse and sanitize projects with featured project logic
    let updatedProjects = [];
    let hasFeaturedSet = false;

    if (Array.isArray(ndata.projects)) {
      updatedProjects = ndata.projects
        .filter((p) => p && typeof p === "object" && typeof p.name === "string" && p.name.trim())
        .map((p) => {
          const isFeat = Boolean(p.featured) && !hasFeaturedSet;
          if (isFeat) hasFeaturedSet = true;

          const techs = Array.isArray(p.technologies)
            ? p.technologies
            : typeof p.technologies === "string"
            ? p.technologies.split(",").map((t) => t.trim()).filter(Boolean)
            : [];

          return {
            name: p.name.trim(),
            description: typeof p.description === "string" ? p.description.trim() : "",
            image: typeof p.image === "string" ? p.image.trim() : "",
            github: typeof p.github === "string" ? p.github.trim() : "",
            live: typeof p.live === "string" ? p.live.trim() : "",
            url: typeof p.url === "string" ? p.url.trim() : "",
            technologies: techs,
            status: ["In Progress", "Completed", "Archived"].includes(p.status)
              ? p.status
              : "In Progress",
            featured: isFeat,
          };
        });
    } else if (Array.isArray(currentUser.projects)) {
      updatedProjects = currentUser.projects;
    }

    // Parse and sanitize socialLinks
    let updatedSocialLinks = {
      github: "",
      linkedin: "",
      portfolio: "",
      twitter: "",
      other: "",
    };
    if (ndata.socialLinks && typeof ndata.socialLinks === "object") {
      updatedSocialLinks = {
        github: typeof ndata.socialLinks.github === "string" ? ndata.socialLinks.github.trim() : "",
        linkedin: typeof ndata.socialLinks.linkedin === "string" ? ndata.socialLinks.linkedin.trim() : "",
        portfolio: typeof ndata.socialLinks.portfolio === "string" ? ndata.socialLinks.portfolio.trim() : "",
        twitter: typeof ndata.socialLinks.twitter === "string" ? ndata.socialLinks.twitter.trim() : "",
        other: typeof ndata.socialLinks.other === "string" ? ndata.socialLinks.other.trim() : "",
      };
    } else if (currentUser.socialLinks) {
      updatedSocialLinks = {
        github: currentUser.socialLinks.github || "",
        linkedin: currentUser.socialLinks.linkedin || "",
        portfolio: currentUser.socialLinks.portfolio || "",
        twitter: currentUser.socialLinks.twitter || "",
        other: currentUser.socialLinks.other || "",
      };
    }

    const updatedPaymentMethod = ["razorpay_link", "razorpay_gateway"].includes(ndata.paymentMethod)
      ? ndata.paymentMethod
      : currentUser.paymentMethod || "razorpay_gateway";

    let updatedRazorpayLink =
      typeof ndata.razorpayLink === "string" ? ndata.razorpayLink.trim() : (currentUser.razorpayLink || "");

    if (updatedRazorpayLink && !isValidHttpUrl(updatedRazorpayLink)) {
      return {
        error: "Please enter a valid Payment Link starting with https:// (e.g. https://razorpay.me/@username or https://rzp.io/...)",
      };
    }

    if (updatedPaymentMethod === "razorpay_link" && !updatedRazorpayLink) {
      return {
        error: "Please enter your personalized Razorpay Payment Link (e.g. https://razorpay.me/@username or https://rzp.io/...)",
      };
    }

    const updatedRazorpayId =
      typeof ndata.razorpayid === "string" ? ndata.razorpayid.trim() : (currentUser.razorpayid || "");
    
    let updatedRazorpaySecret = currentUser.razorpaysecret || "";
    if (
      typeof ndata.razorpaysecret === "string" &&
      ndata.razorpaysecret.trim() &&
      !ndata.razorpaysecret.includes("••••")
    ) {
      updatedRazorpaySecret = ndata.razorpaysecret.trim();
    }

    await User.updateOne(
      { email: currentUser.email },
      {
        $set: {
          name: updatedName,
          username: newUsername,
          bio: updatedBio,
          about: updatedAbout,
          currentWork: updatedCurrentWork,
          whySupport: updatedWhySupport,
          supportPurpose: updatedSupportPurpose,
          thankYouMessage: updatedThankYouMessage,
          skills: updatedSkills,
          achievements: updatedAchievements,
          projects: updatedProjects,
          socialLinks: updatedSocialLinks,
          profilepic: trimmedProfilePic,
          coverpic: trimmedCoverPic,
          paymentMethod: updatedPaymentMethod,
          razorpayLink: updatedRazorpayLink,
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
        about: updatedAbout,
        currentWork: updatedCurrentWork,
        whySupport: updatedWhySupport,
        supportPurpose: updatedSupportPurpose,
        thankYouMessage: updatedThankYouMessage,
        skills: updatedSkills,
        achievements: updatedAchievements,
        projects: updatedProjects,
        socialLinks: updatedSocialLinks,
        profilepic: trimmedProfilePic,
        coverpic: trimmedCoverPic,
        paymentMethod: updatedPaymentMethod,
        razorpayLink: updatedRazorpayLink,
        razorpayid: updatedRazorpayId,
        gatewayConfigured: Boolean(updatedRazorpayId && updatedRazorpaySecret),
        hasPaymentConfigured:
          (updatedPaymentMethod === "razorpay_link" && Boolean(updatedRazorpayLink)) ||
          (updatedPaymentMethod === "razorpay_gateway" && Boolean(updatedRazorpayId)) ||
          Boolean(updatedRazorpayLink) ||
          Boolean(updatedRazorpayId),
      },
    };
  } catch (error) {
    console.error("Error in updateProfile:", error);
    return { error: error.message || "Failed to update profile." };
  }
};

// ============================================================================
// 5. FETCH CREATORS DISCOVERY (WITH SEARCH & SKILL FILTER)
// ============================================================================
export const fetchCreators = async ({
  search = "",
  skill = "",
  skip = 0,
  limit = 10,
} = {}) => {
  try {
    await connectDb();

    const sanitizedSkip = Math.max(0, parseInt(skip, 10) || 0);
    const sanitizedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const sanitizedSearch = typeof search === "string" ? search.trim() : "";
    const sanitizedSkill = typeof skill === "string" ? skill.trim() : "";

    const query = {
      username: { $exists: true, $ne: "" },
    };

    const andConditions = [];

    if (sanitizedSearch) {
      const escaped = sanitizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escaped, "i");
      andConditions.push({
        $or: [
          { username: searchRegex },
          { name: searchRegex },
          { bio: searchRegex },
          { currentWork: searchRegex },
          { skills: searchRegex },
        ],
      });
    }

    if (sanitizedSkill && sanitizedSkill !== "All") {
      const escapedSkill = sanitizedSkill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const skillRegex = new RegExp(`^${escapedSkill}$`, "i");
      andConditions.push({ skills: skillRegex });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const total = await User.countDocuments(query);
    const rawCreators = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(sanitizedSkip)
      .limit(sanitizedLimit)
      .select("name username profilepic coverpic bio skills currentWork createdAt razorpayid razorpayLink paymentMethod")
      .lean();

    const creators = rawCreators.map((u) => {
      const pMethod = u.paymentMethod || (u.razorpayLink && !u.razorpayid ? "razorpay_link" : "razorpay_gateway");
      const hasPayment =
        (pMethod === "razorpay_link" && Boolean(u.razorpayLink)) ||
        (pMethod === "razorpay_gateway" && Boolean(u.razorpayid)) ||
        Boolean(u.razorpayLink) ||
        Boolean(u.razorpayid);

      return {
        _id: u._id.toString(),
        name: u.name || "",
        username: u.username,
        profilepic: u.profilepic || "",
        coverpic: u.coverpic || "",
        bio: u.bio || "",
        skills: Array.isArray(u.skills) ? u.skills : [],
        currentWork: u.currentWork || "",
        createdAt: u.createdAt ? u.createdAt.toISOString() : null,
        paymentMethod: pMethod,
        hasPaymentConfigured: hasPayment,
      };
    });

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

// ============================================================================
// 6. USER REGISTRATION ACTION
// ============================================================================
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
          error: "This email was registered with Google or GitHub. Please log in using that provider.",
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
      role: "user",
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

// ============================================================================
// 7. CREATOR ANALYTICS ACTION (AUTHORIZATION CHECKED)
// ============================================================================
export const fetchCreatorAnalytics = async (creatorUsername) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized access." };
    }

    await connectDb();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return { success: false, error: "User account not found." };
    }

    const targetUsername = (creatorUsername || currentUser.username).toLowerCase().trim();
    if (currentUser.username !== targetUsername && currentUser.role !== "admin") {
      return { success: false, error: "You can only view your own analytics." };
    }

    // Aggregate payment data
    const completedPayments = await Payment.find({
      to_user: targetUsername,
      done: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    const totalRaised = completedPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalContributions = completedPayments.length;

    // Calculate unique supporters
    const uniqueSupporterSet = new Set(
      completedPayments.map((p) => p.supporter_email || p.name).filter(Boolean)
    );
    const uniqueSupporters = uniqueSupporterSet.size;

    const averageContribution = totalContributions > 0 ? Math.round(totalRaised / totalContributions) : 0;

    // Calculate monthly breakdown (last 6 months)
    const monthlyMap = {};
    completedPayments.forEach((p) => {
      if (p.createdAt) {
        const date = new Date(p.createdAt);
        const monthKey = date.toLocaleString("en-US", { month: "short", year: "numeric" });
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + Number(p.amount || 0);
      }
    });

    const monthlyTrend = Object.entries(monthlyMap).map(([month, total]) => ({
      month,
      total,
    }));

    return {
      success: true,
      analytics: {
        totalRaised,
        totalContributions,
        uniqueSupporters,
        averageContribution,
        recentPayments: completedPayments.slice(0, 15).map((p) => ({
          _id: p._id.toString(),
          name: p.name || "Supporter",
          amount: p.amount,
          message: p.message || "",
          isAnonymous: Boolean(p.isAnonymous),
          createdAt: p.createdAt ? p.createdAt.toISOString() : null,
        })),
        monthlyTrend,
      },
    };
  } catch (error) {
    console.error("Error in fetchCreatorAnalytics:", error);
    return { success: false, error: "Failed to load analytics." };
  }
};

// ============================================================================
// 8. SUPPORTER ACTIVITY ACTION (CONTRIBUTIONS MADE)
// ============================================================================
export const fetchSupporterActivity = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized access." };
    }

    await connectDb();

    const payments = await Payment.find({
      supporter_email: session.user.email,
      done: true,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return {
      success: true,
      activity: payments.map((p) => ({
        _id: p._id.toString(),
        to_user: p.to_user,
        amount: p.amount,
        message: p.message || "",
        createdAt: p.createdAt ? p.createdAt.toISOString() : null,
      })),
    };
  } catch (error) {
    console.error("Error in fetchSupporterActivity:", error);
    return { success: false, error: "Failed to load supporter activity." };
  }
};

// ============================================================================
// 9. SAVE / BOOKMARK CREATOR ACTIONS
// ============================================================================
export const saveCreator = async (creatorUsername) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: "Please log in to save creators." };
    }

    if (!creatorUsername || typeof creatorUsername !== "string") {
      return { success: false, error: "Invalid creator username." };
    }

    const cleanUsername = creatorUsername.toLowerCase().trim();

    await connectDb();

    const creatorExists = await User.findOne({ username: cleanUsername });
    if (!creatorExists) {
      return { success: false, error: "Creator does not exist." };
    }

    if (creatorExists.email === session.user.email) {
      return { success: false, error: "You cannot bookmark your own profile." };
    }

    await SavedCreator.findOneAndUpdate(
      { userEmail: session.user.email, creatorUsername: cleanUsername },
      { userEmail: session.user.email, creatorUsername: cleanUsername },
      { upsert: true, new: true }
    );

    return { success: true, isSaved: true, message: "Creator saved to bookmarks." };
  } catch (error) {
    console.error("Error in saveCreator:", error);
    return { success: false, error: "Failed to save creator." };
  }
};

export const unsaveCreator = async (creatorUsername) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: "Please log in to manage bookmarks." };
    }

    if (!creatorUsername) return { success: false, error: "Invalid creator username." };

    const cleanUsername = creatorUsername.toLowerCase().trim();
    await connectDb();

    await SavedCreator.deleteOne({
      userEmail: session.user.email,
      creatorUsername: cleanUsername,
    });

    return { success: true, isSaved: false, message: "Creator removed from bookmarks." };
  } catch (error) {
    console.error("Error in unsaveCreator:", error);
    return { success: false, error: "Failed to remove bookmark." };
  }
};

export const checkIsSaved = async (creatorUsername) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { isSaved: false };
    }

    if (!creatorUsername) return { isSaved: false };

    await connectDb();
    const saved = await SavedCreator.findOne({
      userEmail: session.user.email,
      creatorUsername: creatorUsername.toLowerCase().trim(),
    }).lean();

    return { isSaved: Boolean(saved) };
  } catch (error) {
    console.error("Error in checkIsSaved:", error);
    return { isSaved: false };
  }
};

export const fetchSavedCreators = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, creators: [] };
    }

    await connectDb();

    const bookmarks = await SavedCreator.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .lean();

    const usernames = bookmarks.map((b) => b.creatorUsername);
    if (usernames.length === 0) {
      return { success: true, creators: [] };
    }

    const creators = await User.find({ username: { $in: usernames } })
      .select("name username profilepic coverpic bio skills currentWork razorpayid")
      .lean();

    return {
      success: true,
      creators: creators.map((u) => ({
        _id: u._id.toString(),
        name: u.name || "",
        username: u.username,
        profilepic: u.profilepic || "",
        coverpic: u.coverpic || "",
        bio: u.bio || "",
        skills: Array.isArray(u.skills) ? u.skills : [],
        currentWork: u.currentWork || "",
        hasPaymentConfigured: Boolean(u.razorpayid),
      })),
    };
  } catch (error) {
    console.error("Error in fetchSavedCreators:", error);
    return { success: false, creators: [] };
  }
};

// ============================================================================
// 10. NOTIFICATIONS ACTION
// ============================================================================
export const fetchNotifications = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, notifications: [], unreadCount: 0 };
    }

    await connectDb();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) {
      return { success: false, notifications: [], unreadCount: 0 };
    }

    const notifications = await Notification.find({
      recipientUsername: currentUser.username,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
      success: true,
      unreadCount,
      notifications: notifications.map((n) => ({
        _id: n._id.toString(),
        title: n.title,
        message: n.message || "",
        amount: n.amount || 0,
        read: Boolean(n.read),
        createdAt: n.createdAt ? n.createdAt.toISOString() : null,
      })),
    };
  } catch (error) {
    console.error("Error in fetchNotifications:", error);
    return { success: false, notifications: [], unreadCount: 0 };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized." };
    }

    await connectDb();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser) return { success: false };

    if (notificationId === "all") {
      await Notification.updateMany(
        { recipientUsername: currentUser.username, read: false },
        { $set: { read: true } }
      );
    } else {
      await Notification.updateOne(
        { _id: notificationId, recipientUsername: currentUser.username },
        { $set: { read: true } }
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error in markNotificationAsRead:", error);
    return { success: false };
  }
};

// ============================================================================
// 11. REPORT CREATOR / CONTENT ACTION
// ============================================================================
export const submitReport = async ({ targetUsername, reason, description }) => {
  try {
    if (!targetUsername || typeof targetUsername !== "string") {
      return { success: false, error: "Target creator username is required." };
    }

    const validReasons = [
      "Spam",
      "Misleading Content",
      "Copyright Concern",
      "Harassment",
      "Other",
    ];
    if (!validReasons.includes(reason)) {
      return { success: false, error: "Please select a valid reason for the report." };
    }

    await connectDb();

    const targetUser = await User.findOne({ username: targetUsername.toLowerCase().trim() });
    if (!targetUser) {
      return { success: false, error: "Target creator not found." };
    }

    const session = await getServerSession(authOptions);
    const reporterEmail = session?.user?.email || "anonymous";

    await Report.create({
      reporterEmail,
      targetUsername: targetUser.username,
      reason,
      description: typeof description === "string" ? description.trim().slice(0, 500) : "",
      status: "pending",
    });

    return {
      success: true,
      message: "Thank you for submitting your report. Our team will review it shortly.",
    };
  } catch (error) {
    console.error("Error in submitReport:", error);
    return { success: false, error: "Failed to submit report. Please try again." };
  }
};

// ============================================================================
// 12. ADMIN / MODERATION ACTIONS (ROLE STRICTLY VALIDATED)
// ============================================================================
export const fetchAdminData = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized access." };
    }

    await connectDb();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, error: "Forbidden: Admin access required." };
    }

    const [totalUsers, totalPayments, paymentsAggregate, reports] = await Promise.all([
      User.countDocuments(),
      Payment.countDocuments({ done: true }),
      Payment.aggregate([
        { $match: { done: true } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),
      Report.find().sort({ createdAt: -1 }).limit(50).lean(),
    ]);

    const totalVolume = paymentsAggregate[0]?.totalAmount || 0;

    return {
      success: true,
      stats: {
        totalUsers,
        totalPayments,
        totalVolume,
        pendingReports: reports.filter((r) => r.status === "pending").length,
      },
      reports: reports.map((r) => ({
        _id: r._id.toString(),
        targetUsername: r.targetUsername,
        reporterEmail: r.reporterEmail,
        reason: r.reason,
        description: r.description,
        status: r.status,
        createdAt: r.createdAt ? r.createdAt.toISOString() : null,
      })),
    };
  } catch (error) {
    console.error("Error in fetchAdminData:", error);
    return { success: false, error: "Failed to load admin data." };
  }
};

export const moderateReport = async ({ reportId, status }) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return { success: false, error: "Unauthorized." };
    }

    await connectDb();
    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, error: "Forbidden." };
    }

    if (!["reviewed", "dismissed", "actioned"].includes(status)) {
      return { success: false, error: "Invalid status." };
    }

    await Report.findByIdAndUpdate(reportId, { status });
    return { success: true, message: `Report marked as ${status}.` };
  } catch (error) {
    console.error("Error in moderateReport:", error);
    return { success: false, error: "Failed to update report." };
  }
};
