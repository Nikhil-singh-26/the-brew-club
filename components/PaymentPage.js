"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  fetchuser,
  fetchpayments,
  initiate,
  saveCreator,
  unsaveCreator,
  checkIsSaved,
  submitReport,
} from "@/actions/useractions";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "./Toast";

const PaymentPage = ({ username, initialUser = null, initialPayments = [] }) => {
  const { data: session } = useSession();
  const [paymentform, setPaymentform] = useState({
    name: "",
    message: "",
    amount: "100",
    isAnonymous: false,
  });

  const [currentUser, setCurrentUser] = useState(initialUser);
  const [payments, setPayments] = useState(initialPayments);
  const [loading, setLoading] = useState(!initialUser);
  const [paying, setPaying] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Feature States
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [thankYouShown, setThankYouShown] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://thebrewclub.com/${username}`;

  // Check saved state
  useEffect(() => {
    if (session?.user?.email && username) {
      checkIsSaved(username).then((res) => {
        if (res?.isSaved !== undefined) setIsSaved(res.isSaved);
      });
    }
  }, [session, username]);

  // Load creator data
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const user = await fetchuser(username);
        if (!isMounted) return;
        setCurrentUser(user);

        const dbpayments = await fetchpayments(username);
        if (!isMounted) return;
        setPayments(dbpayments || []);
      } catch (error) {
        console.error("Failed to load creator data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [username]);

  // Handle payment status callback
  useEffect(() => {
    const paymentStatus = searchParams.get("paymentdone");
    if (paymentStatus === "true") {
      setThankYouShown(true);
      toast.success("Thank you for supporting this creator! ☕");
      const refreshAfterPayment = async () => {
        try {
          const user = await fetchuser(username);
          setCurrentUser(user);
          const dbpayments = await fetchpayments(username);
          setPayments(dbpayments || []);
        } catch (err) {
          console.error("Failed to refresh creator data:", err);
        }
      };
      refreshAfterPayment();
      router.replace(`/${username}`);
    } else if (paymentStatus === "failed") {
      toast.error("Payment verification could not be completed.");
      router.replace(`/${username}`);
    }
  }, [searchParams, router, username, toast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentform((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Toggle Save / Bookmark
  const handleToggleSave = async () => {
    if (!session?.user) {
      toast.error("Please sign in to save creators to your bookmarks.");
      return;
    }

    if (session.user.name === username || session.user.email === currentUser?.email) {
      toast.error("You cannot bookmark your own profile.");
      return;
    }

    setSavingBookmark(true);
    try {
      if (isSaved) {
        const res = await unsaveCreator(username);
        if (res?.success) {
          setIsSaved(false);
          toast.success("Creator removed from saved bookmarks.");
        } else {
          toast.error(res?.error || "Could not remove bookmark.");
        }
      } else {
        const res = await saveCreator(username);
        if (res?.success) {
          setIsSaved(true);
          toast.success("Creator saved to your bookmarks! 🔖");
        } else {
          toast.error(res?.error || "Could not save creator.");
        }
      }
    } catch (err) {
      toast.error("Failed to update bookmark.");
    } finally {
      setSavingBookmark(false);
    }
  };

  // Copy Profile Link
  const handleCopyLink = () => {
    const link = typeof window !== "undefined" ? window.location.href.split("?")[0] : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      toast.success("Profile link copied to clipboard! 📋");
    } else {
      toast.error("Could not copy link.");
    }
  };

  // Submit Report
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const res = await submitReport({
        targetUsername: username,
        reason: reportReason,
        description: reportDescription,
      });
      if (res?.success) {
        toast.success(res.message);
        setShowReportModal(false);
        setReportDescription("");
      } else {
        toast.error(res?.error || "Failed to submit report.");
      }
    } catch (err) {
      toast.error("Failed to submit report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  // Payment Handler
  const handlePay = async (e) => {
    if (e) e.preventDefault();

    // CASE 1: Razorpay Payment Link Mode
    if (currentUser?.paymentMethod === "razorpay_link") {
      if (currentUser.razorpayLink) {
        window.open(currentUser.razorpayLink, "_blank", "noopener,noreferrer");
        toast.success("Opening creator's Razorpay Payment Link ↗");
        return;
      } else {
        toast.error("This creator has not configured their Razorpay payment link yet.");
        return;
      }
    }

    // CASE 2: Razorpay Gateway Mode
    const numericAmount = parseFloat(paymentform.amount);
    if (isNaN(numericAmount) || numericAmount < 1) {
      toast.error("Please enter a valid amount (minimum ₹1).");
      return;
    }

    if (!paymentform.isAnonymous && (!paymentform.name.trim() || paymentform.name.trim().length < 2)) {
      toast.error("Please enter your name (at least 2 characters) or select anonymous.");
      return;
    }

    if (!currentUser?.razorpayid) {
      toast.error("This creator has not configured their Razorpay payment gateway yet.");
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      toast.error("Payment gateway is loading. Please check your connection and try again.");
      return;
    }

    setPaying(true);

    try {
      const amountInPaise = Math.round(numericAmount * 100);
      const order = await initiate(amountInPaise, username, paymentform);

      if (order?.error) {
        toast.error(order.error);
        setPaying(false);
        return;
      }

      const callbackUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/api/razorpay`
          : `${process.env.NEXT_PUBLIC_URL || ""}/api/razorpay`;

      const options = {
        key: currentUser.razorpayid,
        amount: order.amount,
        currency: "INR",
        name: "The Brew Club",
        description: `Supporting @${username}`,
        image: currentUser.profilepic || "",
        order_id: order.id,
        callback_url: callbackUrl,
        prefill: {
          name: paymentform.isAnonymous ? "Anonymous Supporter" : paymentform.name,
        },
        notes: {
          creator: username,
          message: paymentform.message || "",
          isAnonymous: String(paymentform.isAnonymous),
        },
        theme: {
          color: "#f59e0b",
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        toast.error("Payment was cancelled or failed.");
        setPaying(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      toast.error("Something went wrong while initiating the payment.");
    } finally {
      setPaying(false);
    }
  };

  const totalRaised = payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const isLinkMethod = currentUser?.paymentMethod === "razorpay_link";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
            <p className="text-sm text-gray-500">Loading creator portfolio...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold">Creator Not Found</h1>
          <p className="mt-2 text-sm text-gray-400">
            The creator @{username} doesn&apos;t seem to exist on The Brew Club yet.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              href="/creators"
              className="rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-xs font-bold text-black transition hover:opacity-95"
            >
              Discover Creators
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Filter valid projects & featured project
  const validProjects = Array.isArray(currentUser.projects)
    ? currentUser.projects.filter((p) => p && p.name && p.name.trim())
    : [];

  const featuredProject = validProjects.find((p) => p.featured);
  const regularProjects = validProjects.filter((p) => !p.featured);

  // Filter valid achievements
  const validAchievements = Array.isArray(currentUser.achievements)
    ? currentUser.achievements.filter((a) => typeof a === "string" && a.trim())
    : [];

  // Filter valid skills
  const validSkills = Array.isArray(currentUser.skills)
    ? currentUser.skills.filter((s) => typeof s === "string" && s.trim())
    : [];

  // Social Links
  const social = currentUser.socialLinks || {};
  const hasSocialLinks =
    social.github || social.linkedin || social.portfolio || social.twitter || social.other;

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <main className="min-h-screen bg-[#0b0b0f] text-white pb-24">
        {/* ================================================== */}
        {/* 1. CREATOR COVER & HERO SECTION */}
        {/* ================================================== */}
        <section className="relative">
          {/* Cover Banner */}
          <div className="h-56 w-full overflow-hidden bg-linear-to-b from-[#1f1912] via-[#141217] to-[#0b0b0f] md:h-80 relative">
            {currentUser.coverpic ? (
              <>
                <img
                  src={currentUser.coverpic}
                  alt={`${username}'s banner`}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.parentElement?.querySelector(".cover-fallback");
                    if (fallback) fallback.style.display = "block";
                  }}
                  className="h-full w-full object-cover opacity-80"
                />
                <div
                  style={{ display: "none" }}
                  className="cover-fallback h-full w-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent"
                />
              </>
            ) : (
              <div className="h-full w-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-[#0b0b0f] via-transparent to-black/20" />
          </div>

          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className="rounded-full border-4 border-[#0b0b0f] bg-[#15151c] p-1 shadow-2xl">
              {currentUser.profilepic ? (
                <>
                  <img
                    src={currentUser.profilepic}
                    alt={currentUser.name || username}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.parentElement?.querySelector(".creator-avatar-fallback");
                      if (fallback) fallback.style.display = "flex";
                    }}
                    className="h-28 w-28 rounded-full object-cover md:h-32 md:w-32"
                  />
                  <div
                    style={{ display: "none" }}
                    className="creator-avatar-fallback h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-4xl font-extrabold text-black md:h-32 md:w-32"
                  >
                    {(currentUser.name || username)?.charAt(0).toUpperCase()}
                  </div>
                </>
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 text-4xl font-extrabold text-black md:h-32 md:w-32">
                  {(currentUser.name || username)?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Creator Info & Header */}
        <section className="px-5 pb-8 pt-24 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-400/20 bg-amber-400/10 text-xs font-semibold text-amber-300">
                <span>☕</span>
                <span>Creator Profile</span>
              </span>

              {/* Share Profile Button */}
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                title="Share this creator's profile"
              >
                <span>🔗</span> Share
              </button>

              {/* Save / Bookmark Button */}
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={savingBookmark}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium transition cursor-pointer ${
                  isSaved
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
                title={isSaved ? "Saved in bookmarks" : "Save to bookmarks"}
              >
                <span>{isSaved ? "❤️" : "🤍"}</span>
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              {currentUser.name || username}
            </h1>

            <p className="mt-1 text-sm font-semibold text-amber-400">
              @{username}
            </p>

            {/* Short Bio */}
            {currentUser.bio && currentUser.bio.trim() ? (
              <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-gray-300">
                {currentUser.bio}
              </p>
            ) : (
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-gray-400">
                Independent creator sharing projects and creative work on The Brew Club.
              </p>
            )}

            {/* Skills Badges */}
            {validSkills.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {validSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-lg border border-white/10 bg-white/4 px-3 py-1 text-xs font-medium text-amber-300"
                  >
                    #{skill}
                  </span>
                ))}
              </div>
            )}

            {/* Social Links */}
            {hasSocialLinks && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                {social.github && (
                  <a
                    href={social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/4 px-3.5 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <span>🐙</span> GitHub
                  </a>
                )}

                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/4 px-3.5 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <span>💼</span> LinkedIn
                  </a>
                )}

                {social.portfolio && (
                  <a
                    href={social.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/4 px-3.5 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <span>✨</span> Portfolio
                  </a>
                )}

                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/4 px-3.5 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <span>🐦</span> X (Twitter)
                  </a>
                )}

                {social.other && (
                  <a
                    href={social.other}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/4 px-3.5 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
                  >
                    <span>🔗</span> Website
                  </a>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-8 inline-flex items-center gap-8 rounded-2xl border border-white/10 bg-white/3 px-8 py-4 shadow-lg">
              <div>
                <p className="text-2xl font-bold text-white">{payments.length}</p>
                <p className="text-xs uppercase tracking-wider text-gray-400 mt-0.5">Supporters</p>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <p className="text-2xl font-bold text-amber-400">
                  ₹{totalRaised.toLocaleString("en-IN")}
                </p>
                <p className="text-xs uppercase tracking-wider text-gray-400 mt-0.5">Total Raised</p>
              </div>
            </div>
          </div>
        </section>

        {/* CUSTOM THANK YOU BANNER */}
        {thankYouShown && currentUser.thankYouMessage && (
          <section className="mx-auto max-w-4xl px-5 mb-8">
            <div className="rounded-3xl border border-amber-400/40 bg-linear-to-r from-amber-400/15 via-orange-500/10 to-transparent p-6 sm:p-8 text-center shadow-xl">
              <span className="text-2xl">💌</span>
              <h3 className="text-lg font-bold text-white mt-2">
                A Note from {currentUser.name || username}
              </h3>
              <p className="mt-2 text-sm text-amber-200/90 leading-relaxed italic max-w-xl mx-auto">
                &ldquo;{currentUser.thankYouMessage}&rdquo;
              </p>
            </div>
          </section>
        )}

        {/* ================================================== */}
        {/* 2. CREATOR HIGHLIGHTS: ABOUT / BUILDING / PURPOSE */}
        {/* ================================================== */}
        <section className="mx-auto max-w-6xl px-5 py-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* About Section */}
            {currentUser.about && currentUser.about.trim() && (
              <div className="rounded-3xl border border-white/10 bg-white/3 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                    <span>📖</span> About @{username}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3">Meet the Creator</h2>
                  <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-line">
                    {currentUser.about}
                  </p>
                </div>
              </div>
            )}

            {/* Currently Building Section */}
            {currentUser.currentWork && currentUser.currentWork.trim() && (
              <div className="rounded-3xl border border-white/10 bg-white/3 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-3">
                    <span>🔨</span> Active Development
                  </div>
                  <h2 className="text-xl font-bold text-white mb-3">What I&apos;m Currently Building</h2>
                  <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-line">
                    {currentUser.currentWork}
                  </p>
                </div>
              </div>
            )}

            {/* Why Support Me Section */}
            {currentUser.whySupport && currentUser.whySupport.trim() && (
              <div className="rounded-3xl border border-amber-400/20 bg-linear-to-br from-amber-400/5 to-orange-500/5 p-6 sm:p-8 md:col-span-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                  <span>☕</span> Impact of Your Support
                </div>
                <h2 className="text-xl font-bold text-white mb-3">Why Back My Journey?</h2>
                <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-line max-w-4xl">
                  {currentUser.whySupport}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* FEATURED PROJECT SPOTLIGHT */}
        {featuredProject && (
          <section className="mx-auto max-w-6xl px-5 py-6">
            <div className="rounded-3xl border border-amber-400/30 bg-linear-to-br from-amber-400/10 via-black/40 to-black/20 p-6 sm:p-8 overflow-hidden relative shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    ⭐ Featured Project Spotlight
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    featuredProject.status === "Completed"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : featuredProject.status === "Archived"
                      ? "bg-gray-500/20 text-gray-300"
                      : "bg-amber-400/20 text-amber-300"
                  }`}>
                    {featuredProject.status || "In Progress"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {featuredProject.live && (
                    <a
                      href={featuredProject.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-4 py-1.5 text-xs font-bold text-black hover:opacity-95 transition"
                    >
                      <span>🚀</span> Live Demo ↗
                    </a>
                  )}
                  {featuredProject.github && (
                    <a
                      href={featuredProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
                    >
                      <span>🐙</span> GitHub
                    </a>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-2xl font-extrabold text-white">{featuredProject.name}</h3>
                  {featuredProject.description && (
                    <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                      {featuredProject.description}
                    </p>
                  )}

                  {featuredProject.technologies && featuredProject.technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {featuredProject.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-white/10 bg-black/40 px-2 py-0.5 text-[11px] font-mono text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {featuredProject.image && (
                  <div className="h-56 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/50">
                    <img
                      src={featuredProject.image}
                      alt={featuredProject.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* REGULAR PROJECTS LIST */}
        {regularProjects.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-6">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                Portfolio
              </p>
              <h2 className="text-2xl font-bold text-white mt-1">
                More Creations & Projects
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {regularProjects.map((project, idx) => (
                <div
                  key={idx}
                  className="group rounded-3xl border border-white/10 bg-white/3 overflow-hidden flex flex-col justify-between transition hover:border-amber-400/30 hover:bg-white/5 shadow-lg"
                >
                  {project.image && (
                    <div className="h-44 w-full overflow-hidden bg-black/40">
                      <img
                        src={project.image}
                        alt={project.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition">
                          {project.name}
                        </h3>
                        <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                          {project.status || "In Progress"}
                        </span>
                      </div>

                      {project.description && (
                        <p className="mt-2 text-xs leading-relaxed text-gray-400 line-clamp-4">
                          {project.description}
                        </p>
                      )}

                      {project.technologies && project.technologies.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {project.technologies.map((t, i) => (
                            <span key={i} className="text-[10px] text-amber-300/80">#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Links */}
                    {(project.live || project.github || project.url) && (
                      <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2">
                        {project.live && (
                          <a
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-black transition hover:opacity-95"
                          >
                            <span>🚀</span> Demo
                          </a>
                        )}

                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
                          >
                            <span>🐙</span> GitHub
                          </a>
                        )}

                        {project.url && !project.live && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition"
                          >
                            <span>🔗</span> View
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================================================== */}
        {/* 3. ACHIEVEMENTS & MILESTONES */}
        {/* ================================================== */}
        {validAchievements.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-6">
            <div className="rounded-3xl border border-white/10 bg-white/3 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400 mb-1">
                Milestones
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
                Achievements & Recognition
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {validAchievements.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl border border-white/5 bg-black/20 p-4 transition hover:border-amber-400/20"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 text-sm">
                      🏆
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-200 leading-relaxed pt-1">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================================================== */}
        {/* 4. SUPPORT & PAYMENT SECTION */}
        {/* ================================================== */}
        <section className="mx-auto max-w-6xl px-5 pt-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
              Fuel The Work
            </p>
            <h2 className="text-2xl font-bold text-white mt-1">
              Support @{username}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Send a cup of coffee and fuel their next release.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Supporters List */}
            <div className="rounded-3xl border border-white/10 bg-white/3 overflow-hidden flex flex-col">
              <div className="border-b border-white/10 px-6 py-6 md:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
                  Community Backing
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  Recent Supporters
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  Supporters who have backed @{username}.
                </p>
              </div>

              <div className="flex-1 max-h-120 overflow-y-auto px-6 py-6 md:px-8">
                {payments.length === 0 ? (
                  <div className="flex min-h-60 flex-col items-center justify-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-xl">
                      ☕
                    </div>
                    <p className="mt-4 text-sm font-semibold text-gray-200">
                      Be the first supporter of @{username}
                    </p>
                    <p className="mt-1 max-w-xs text-xs text-gray-400">
                      Your contribution directly empowers their ongoing creative work.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.map((payment, index) => (
                      <div
                        key={payment._id || index}
                        className="rounded-2xl border border-white/5 bg-white/2 p-4 transition hover:bg-white/4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-sm font-semibold text-amber-400">
                              {(payment.name || "A").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {payment.name}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {payment.createdAt
                                  ? new Date(payment.createdAt).toLocaleDateString(
                                      "en-IN",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )
                                  : "Supporter"}
                              </p>
                            </div>
                          </div>

                          <span className="rounded-lg bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-400 shrink-0">
                            ₹{payment.amount}
                          </span>
                        </div>

                        {payment.message && (
                          <p className="mt-3 rounded-xl bg-black/30 px-3 py-2 text-xs text-gray-300 leading-relaxed italic">
                            &ldquo;{payment.message}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Support Form Card */}
            <div className="rounded-3xl border border-white/10 bg-white/3 overflow-hidden">
              <div className="border-b border-white/10 px-6 py-6 md:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
                  Send A Contribution
                </p>
                <h3 className="mt-1 text-xl font-bold text-white">
                  Contribute to @{username}
                </h3>
                <p className="mt-1 text-xs text-gray-400">
                  {isLinkMethod
                    ? "Choose an amount and proceed to the creator's Razorpay Payment Link."
                    : "Choose an amount and contribute via integrated Razorpay Checkout."}
                </p>
              </div>

              <form onSubmit={handlePay} className="p-6 md:p-8">
                {/* Contribution Purpose Banner */}
                {currentUser.supportPurpose && (
                  <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                      <span>🎯</span> What this support helps with:
                    </div>
                    <p className="text-xs text-gray-300">{currentUser.supportPurpose}</p>
                  </div>
                )}

                {/* Configuration Alerts */}
                {isLinkMethod && !currentUser.razorpayLink && (
                  <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                    ⚠️ This creator has not linked their Razorpay payment link yet.
                  </div>
                )}

                {!isLinkMethod && !currentUser.razorpayid && (
                  <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                    ⚠️ This creator has not linked their Razorpay gateway credentials yet.
                  </div>
                )}

                {/* Supporter Name (Only required for gateway flow) */}
                {!isLinkMethod && !paymentform.isAnonymous && (
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Your Name or Handle
                    </label>
                    <input
                      id="name"
                      onChange={handleChange}
                      value={paymentform.name}
                      name="name"
                      type="text"
                      required={!paymentform.isAnonymous}
                      placeholder="e.g. Alex Rivera"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>
                )}

                {/* Anonymous Option (for gateway flow) */}
                {!isLinkMethod && (
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isAnonymous"
                        checked={paymentform.isAnonymous}
                        onChange={handleChange}
                        className="rounded border-white/20 text-amber-400 focus:ring-0"
                      />
                      <span>Make my contribution anonymous</span>
                    </label>
                  </div>
                )}

                {/* Supporter Message (for gateway flow) */}
                {!isLinkMethod && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="message"
                        className="block text-xs font-medium uppercase tracking-wider text-gray-300"
                      >
                        Note of Encouragement (Optional)
                      </label>
                      <span className="text-[11px] text-gray-500">
                        {paymentform.message.length}/300
                      </span>
                    </div>
                    <textarea
                      id="message"
                      onChange={handleChange}
                      value={paymentform.message}
                      name="message"
                      maxLength={300}
                      rows={3}
                      placeholder="Keep building amazing things!..."
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>
                )}

                {/* Amount Selection */}
                {!isLinkMethod && (
                  <div className="mb-4">
                    <label
                      htmlFor="amount"
                      className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-300"
                    >
                      Contribution Amount (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                        ₹
                      </span>
                      <input
                        id="amount"
                        onChange={handleChange}
                        value={paymentform.amount}
                        name="amount"
                        type="number"
                        min="1"
                        required
                        placeholder="100"
                        className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-8 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                      />
                    </div>
                  </div>
                )}

                {/* Quick Preset Buttons */}
                {!isLinkMethod && (
                  <div className="mb-6">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
                      Quick Amount Presets
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[50, 100, 250, 500].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            setPaymentform((prev) => ({
                              ...prev,
                              amount: String(preset),
                            }))
                          }
                          className={`rounded-xl border py-2.5 text-xs font-semibold transition cursor-pointer ${
                            paymentform.amount === String(preset)
                              ? "border-amber-400 bg-amber-400/15 text-amber-400"
                              : "border-white/10 bg-white/3 text-gray-300 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pay Button / Link Action */}
                {isLinkMethod ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-center">
                      <p className="text-xs text-gray-300">
                        @{username} accepts direct support via their personalized Razorpay Payment Page.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={!currentUser.razorpayLink}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-sm font-bold text-black transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-orange-500/20 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                    >
                      <span>☕</span>
                      <span>Support @{username} via Razorpay Link ↗</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={
                      paying ||
                      !currentUser.razorpayid ||
                      (!paymentform.isAnonymous && !paymentform.name.trim()) ||
                      !paymentform.amount ||
                      Number(paymentform.amount) < 1
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-sm font-bold text-black transition-all duration-200 hover:opacity-95 hover:shadow-lg hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none cursor-pointer"
                  >
                    {paying ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                        Opening Razorpay Gateway...
                      </>
                    ) : (
                      <>
                        Support @{username}{" "}
                        {paymentform.amount &&
                          Number(paymentform.amount) > 0 &&
                          ` · ₹${Number(paymentform.amount).toLocaleString("en-IN")}`}
                      </>
                    )}
                  </button>
                )}

                <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    🔒 Direct payments secured by Razorpay
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(true)}
                    className="text-gray-500 hover:text-rose-400 transition cursor-pointer"
                  >
                    Report profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* SHARE MODAL */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#14141b] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>✨</span> Share Creator Profile
                </h3>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-400 mb-5">
                Share @{username}&apos;s profile with your network to help them reach more supporters.
              </p>

              {/* Copy Link Input */}
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-2 mb-5">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-transparent px-2 text-xs text-gray-300 outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-lg bg-linear-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-black hover:opacity-95 transition cursor-pointer"
                >
                  Copy Link
                </button>
              </div>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out @${username} on The Brew Club: ${currentUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-white/10 transition"
                >
                  <span>💬</span> WhatsApp
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Support @${username} on The Brew Club! ☕`)}&url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-sky-400 hover:bg-white/10 transition"
                >
                  <span>🐦</span> X (Twitter)
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-blue-400 hover:bg-white/10 transition"
                >
                  <span>💼</span> LinkedIn
                </a>
              </div>
            </div>
          </div>
        )}

        {/* REPORT MODAL */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#14141b] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🚩</span> Report @{username}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Reason for Report
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#1d1d28] px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                  >
                    <option value="Spam">Spam / Advertisements</option>
                    <option value="Misleading Content">Misleading Information / Impersonation</option>
                    <option value="Copyright Concern">Copyright / Intellectual Property Infringement</option>
                    <option value="Harassment">Harassment or Inappropriate Content</option>
                    <option value="Other">Other Issues</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Additional Details
                  </label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please explain the issue briefly so our moderation team can review it..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="rounded-xl bg-rose-500/20 border border-rose-500/30 px-4 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition disabled:opacity-50"
                  >
                    {submittingReport ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default PaymentPage;