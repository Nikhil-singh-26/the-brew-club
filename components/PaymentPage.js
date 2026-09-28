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

const getRelativeTime = (dateString) => {
  if (!dateString) return "Supporter";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

const PaymentPage = ({ username, initialUser = null, initialPayments = [] }) => {
  const { data: session } = useSession();
  const [paymentform, setPaymentform] = useState({
    name: "",
    message: "",
    amount: "50",
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
        // ONLY verified payments where done is true are returned by fetchpayments
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
    if (!paymentStatus) return;

    if (paymentStatus === "true") {
      toast.success("Thank you for supporting this creator! ☕");
      let isMounted = true;
      const refreshAfterPayment = async () => {
        try {
          const user = await fetchuser(username);
          if (isMounted && user) setCurrentUser(user);
          const dbpayments = await fetchpayments(username);
          if (isMounted) setPayments(dbpayments || []);
        } catch (err) {
          console.error("Failed to refresh creator data:", err);
        }
      };
      refreshAfterPayment();
      router.replace(`/${username}`);
      return () => {
        isMounted = false;
      };
    } else if (paymentStatus === "failed") {
      toast.error("Payment was not completed or verification failed.");
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
          toast.success("Creator removed from bookmarks.");
        } else {
          toast.error(res?.error || "Could not remove bookmark.");
        }
      } else {
        const res = await saveCreator(username);
        if (res?.success) {
          setIsSaved(true);
          toast.success("Creator saved to your bookmarks.");
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
      toast.success("Profile link copied to clipboard.");
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
        let targetUrl = currentUser.razorpayLink.trim();
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
          targetUrl = `https://${targetUrl}`;
        }
        window.open(targetUrl, "_blank", "noopener,noreferrer");
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
          color: "#C86B3C",
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
      <main className="min-h-screen bg-[#F7F4EE] text-[#1E1D1A]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#DED8CE] border-t-[#C86B3C]" />
            <p className="text-xs text-[#6F6A60]">Loading creator profile...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#F7F4EE] text-[#1E1D1A] flex items-center justify-center px-6">
        <div className="text-center max-w-md rounded-[12px] border border-[#DED8CE] bg-[#FFFFFF] p-8 shadow-xs">
          <div className="h-12 w-12 rounded-[8px] bg-[#F5E8E0] text-[#C86B3C] text-xl flex items-center justify-center mx-auto mb-3">
            🔍
          </div>
          <h1 className="font-heading text-xl font-bold">Creator Not Found</h1>
          <p className="mt-2 text-xs text-[#6F6A60]">
            The creator @{username} doesn&apos;t exist on The Brew Club yet.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              href="/creators"
              className="rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] px-4 py-2 text-xs font-medium text-white shadow-xs transition"
            >
              Discover creators
            </Link>
            <Link
              href="/"
              className="rounded-[7px] border border-[#DED8CE] bg-[#FFFFFF] hover:bg-[#F0ECE4] px-4 py-2 text-xs font-medium text-[#1E1D1A] transition"
            >
              Back to home
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

  const displayName = currentUser.name || username;
  const initial = (displayName.charAt(0) || "C").toUpperCase();

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

      <main className="min-h-screen bg-[#F7F4EE] text-[#1E1D1A] pb-24">
        {/* Cover Banner with visual depth */}
        <div className="h-44 w-full overflow-hidden bg-linear-to-r from-[#F0ECE4] via-[#EAE5DC] to-[#F5E8E0] border-b border-[#DED8CE] md:h-64 relative">
          {currentUser.coverpic ? (
            <img
              src={currentUser.coverpic}
              alt={`${displayName}'s banner`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className="h-full w-full object-cover opacity-90"
            />
          ) : (
            <div className="h-full w-full bg-linear-to-br from-[#F5E8E0]/40 via-[#F0ECE4] to-[#EAE5DC]" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-[#1E1D1A]/10 via-transparent to-transparent" />
        </div>

        {/* Creator Header Section */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="relative -mt-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-8 border-b border-[#DED8CE]">
            {/* Avatar + Main Identity */}
            <div className="flex items-end gap-4">
              <div className="h-28 w-28 rounded-[12px] border-4 border-[#FFFFFF] bg-[#F0ECE4] overflow-hidden shrink-0 shadow-md">
                {currentUser.profilepic ? (
                  <img
                    src={currentUser.profilepic}
                    alt={displayName}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.parentElement?.querySelector(".creator-avatar-fallback");
                      if (fallback) fallback.style.display = "flex";
                    }}
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <div
                  style={{ display: currentUser.profilepic ? "none" : "flex" }}
                  className="creator-avatar-fallback h-full w-full items-center justify-center bg-[#F5E8E0] text-3xl font-bold text-[#C86B3C]"
                >
                  {initial}
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1E1D1A] tracking-tight">
                    {displayName}
                  </h1>
                  {currentUser.hasPaymentConfigured && (
                    <span className="rounded-[4px] bg-[#557A5C]/15 text-[#557A5C] px-1.5 py-0.5 text-[10px] font-semibold">
                      Accepts Backing
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-[#C86B3C]">
                  @{username}
                </p>
              </div>
            </div>

            {/* Top Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="rounded-[7px] border border-[#DED8CE] bg-[#FFFFFF] px-3.5 py-1.5 text-xs font-medium text-[#6F6A60] hover:text-[#1E1D1A] hover:bg-[#F0ECE4] shadow-xs transition cursor-pointer"
                title="Share profile"
              >
                Share
              </button>

              <button
                type="button"
                onClick={handleToggleSave}
                disabled={savingBookmark}
                className={`rounded-[7px] border px-3.5 py-1.5 text-xs font-medium shadow-xs transition cursor-pointer ${
                  isSaved
                    ? "border-[#C86B3C]/30 bg-[#F5E8E0] text-[#C86B3C]"
                    : "border-[#DED8CE] bg-[#FFFFFF] text-[#6F6A60] hover:text-[#1E1D1A] hover:bg-[#F0ECE4]"
                }`}
                title={isSaved ? "Saved" : "Bookmark creator"}
              >
                {isSaved ? "Saved 🔖" : "Save"}
              </button>
            </div>
          </div>

          {/* Bio, Skills & Social Links */}
          <div className="py-6 border-b border-[#DED8CE]">
            <p className="text-sm leading-relaxed text-[#1E1D1A] max-w-3xl">
              {currentUser.bio && currentUser.bio.trim()
                ? currentUser.bio
                : "Independent creator building and sharing creative work on The Brew Club."}
            </p>

            {/* Skills */}
            {validSkills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {validSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="rounded-[5px] border border-[#DED8CE] bg-[#FFFFFF] px-2.5 py-0.5 text-xs text-[#6F6A60] shadow-xs"
                  >
                    #{skill}
                  </span>
                ))}
              </div>
            )}

            {/* Social Links */}
            {hasSocialLinks && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {social.github && (
                  <a
                    href={social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#6F6A60] hover:text-[#1E1D1A] hover:bg-[#F0ECE4] shadow-xs transition"
                  >
                    GitHub ↗
                  </a>
                )}
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#6F6A60] hover:text-[#1E1D1A] hover:bg-[#F0ECE4] shadow-xs transition"
                  >
                    LinkedIn ↗
                  </a>
                )}
                {social.portfolio && (
                  <a
                    href={social.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#6F6A60] hover:text-[#1E1D1A] hover:bg-[#F0ECE4] shadow-xs transition"
                  >
                    Portfolio ↗
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#6F6A60] hover:text-[#1E1D1A] hover:bg-[#F0ECE4] shadow-xs transition"
                  >
                    X (Twitter) ↗
                  </a>
                )}
                {social.other && (
                  <a
                    href={social.other}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[6px] border border-[#DED8CE] bg-[#FFFFFF] px-2.5 py-1 text-xs text-[#6F6A60] hover:text-[#1E1D1A] hover:bg-[#F0ECE4] shadow-xs transition"
                  >
                    Website ↗
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Metrics Bar (REAL VERIFIED DATA ONLY) */}
          <div className="py-5 flex items-center gap-8 text-xs border-b border-[#DED8CE]">
            <div>
              <span className="font-heading text-lg font-bold text-[#1E1D1A] block">
                {payments.length}
              </span>
              <span className="text-[#6F6A60]">Verified Supporters</span>
            </div>
            <div className="h-6 w-px bg-[#DED8CE]" />
            <div>
              <span className="font-heading text-lg font-bold text-[#C86B3C] block">
                ₹{totalRaised.toLocaleString("en-IN")}
              </span>
              <span className="text-[#6F6A60]">Total Supported</span>
            </div>
          </div>

          {/* Thank You Note (if creator set one) */}
          {currentUser.thankYouMessage && (
            <div className="my-8 rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-5 text-xs text-[#6F6A60] shadow-xs">
              <span className="text-[#C86B3C] font-semibold block mb-1">A note from {displayName}:</span>
              <p className="italic leading-relaxed text-[#1E1D1A]">
                &ldquo;{currentUser.thankYouMessage}&rdquo;
              </p>
            </div>
          )}

          {/* Content & Support Grid */}
          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            {/* Left Column: Story, Projects, Achievements, Supporter Wall (7 cols) */}
            <div className="space-y-10 lg:col-span-7">
              {/* About Section */}
              {currentUser.about && currentUser.about.trim() && (
                <section>
                  <h2 className="font-heading text-base font-bold text-[#1E1D1A] mb-3">
                    About the creator
                  </h2>
                  <p className="text-xs leading-relaxed text-[#6F6A60] whitespace-pre-line">
                    {currentUser.about}
                  </p>
                </section>
              )}

              {/* What I'm Building */}
              {currentUser.currentWork && currentUser.currentWork.trim() && (
                <section className="border-t border-[#DED8CE] pt-8">
                  <h2 className="font-heading text-base font-bold text-[#1E1D1A] mb-3">
                    What I&apos;m currently building
                  </h2>
                  <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-5 shadow-xs">
                    <p className="text-xs leading-relaxed text-[#1E1D1A] whitespace-pre-line font-medium">
                      {currentUser.currentWork}
                    </p>
                  </div>
                </section>
              )}

              {/* Why Support Me */}
              {currentUser.whySupport && currentUser.whySupport.trim() && (
                <section className="border-t border-[#DED8CE] pt-8">
                  <h2 className="font-heading text-base font-bold text-[#1E1D1A] mb-3">
                    Why support my work
                  </h2>
                  <p className="text-xs leading-relaxed text-[#6F6A60] whitespace-pre-line">
                    {currentUser.whySupport}
                  </p>
                </section>
              )}

              {/* Featured Project */}
              {featuredProject && (
                <section className="border-t border-[#DED8CE] pt-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-heading text-base font-bold text-[#1E1D1A]">
                      Featured project
                    </h2>
                    <span className="rounded-[5px] bg-[#F5E8E0] text-[#C86B3C] px-2 py-0.5 text-[10px] font-semibold">
                      {featuredProject.status || "In Progress"}
                    </span>
                  </div>

                  <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-5 shadow-xs space-y-3">
                    <h3 className="font-heading text-base font-bold text-[#1E1D1A]">
                      {featuredProject.name}
                    </h3>

                    {featuredProject.description && (
                      <p className="text-xs leading-relaxed text-[#6F6A60]">
                        {featuredProject.description}
                      </p>
                    )}

                    {featuredProject.technologies && featuredProject.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {featuredProject.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="rounded-[4px] border border-[#DED8CE] bg-[#F7F4EE] px-1.5 py-0.5 text-[10px] text-[#6F6A60]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 flex items-center gap-2 border-t border-[#DED8CE]/60">
                      {featuredProject.live && (
                        <a
                          href={featuredProject.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-[6px] bg-[#C86B3C] hover:bg-[#A9552F] text-white px-3 py-1 text-xs font-medium shadow-xs transition"
                        >
                          Live Demo ↗
                        </a>
                      )}
                      {featuredProject.github && (
                        <a
                          href={featuredProject.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-[6px] border border-[#DED8CE] bg-[#F7F4EE] hover:bg-[#F0ECE4] text-[#1E1D1A] px-3 py-1 text-xs font-medium transition"
                        >
                          GitHub ↗
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Regular Projects */}
              {regularProjects.length > 0 && (
                <section className="border-t border-[#DED8CE] pt-8">
                  <h2 className="font-heading text-base font-bold text-[#1E1D1A] mb-4">
                    Other creations & projects
                  </h2>

                  <div className="space-y-3">
                    {regularProjects.map((project, idx) => (
                      <div
                        key={idx}
                        className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-4 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-heading text-sm font-bold text-[#1E1D1A]">
                            {project.name}
                          </h3>
                          <span className="text-[10px] text-[#918B80]">
                            {project.status || "In Progress"}
                          </span>
                        </div>

                        {project.description && (
                          <p className="mt-1.5 text-xs text-[#6F6A60] leading-relaxed line-clamp-3">
                            {project.description}
                          </p>
                        )}

                        {(project.live || project.github || project.url) && (
                          <div className="mt-3 flex items-center gap-3 pt-2 border-t border-[#DED8CE]/60">
                            {project.live && (
                              <a
                                href={project.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-[#C86B3C] hover:underline"
                              >
                                Live Demo ↗
                              </a>
                            )}
                            {project.github && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#6F6A60] hover:text-[#1E1D1A]"
                              >
                                GitHub ↗
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Achievements & Milestones */}
              {validAchievements.length > 0 && (
                <section className="border-t border-[#DED8CE] pt-8">
                  <h2 className="font-heading text-base font-bold text-[#1E1D1A] mb-3">
                    Milestones & Recognition
                  </h2>
                  <ul className="space-y-2">
                    {validAchievements.map((item, idx) => (
                      <li
                        key={idx}
                        className="rounded-[7px] border border-[#DED8CE] bg-[#FFFFFF] px-3.5 py-2 text-xs text-[#6F6A60] shadow-xs"
                      >
                        🏆 {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Verified Supporter Wall */}
              <section className="border-t border-[#DED8CE] pt-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-heading text-base font-bold text-[#1E1D1A]">
                      Recent verified support
                    </h2>
                    <p className="text-xs text-[#6F6A60]">
                      Community members who have backed @{username}.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#557A5C] bg-[#557A5C]/15 px-2 py-0.5 rounded-[4px]">
                    Verified Payments Only
                  </span>
                </div>

                {payments.length === 0 ? (
                  <div className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-8 text-center shadow-xs">
                    <p className="text-xs font-semibold text-[#1E1D1A]">No verified support yet.</p>
                    <p className="mt-1 text-xs text-[#6F6A60]">
                      Be the first supporter to back @{username}&apos;s work.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {payments.map((payment, index) => (
                      <div
                        key={payment._id || index}
                        className="rounded-[10px] border border-[#DED8CE] bg-[#FFFFFF] p-3.5 shadow-xs text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1E1D1A]">
                              {payment.name}
                            </span>
                            <span className="text-[11px] text-[#918B80]">
                              · {getRelativeTime(payment.createdAt)}
                            </span>
                          </div>

                          <span className="font-bold text-[#C86B3C]">
                            ₹{payment.amount}
                          </span>
                        </div>

                        {payment.message && (
                          <p className="mt-2 text-[#6F6A60] italic bg-[#F7F4EE] p-2 rounded-[5px]">
                            &ldquo;{payment.message}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column: Support Action Box (5 cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-20 rounded-[12px] border border-[#DED8CE] bg-[#FFFFFF] p-6 shadow-md">
                <h2 className="font-heading text-base font-bold text-[#1E1D1A]">
                  Support {displayName}
                </h2>
                <p className="mt-1 text-xs text-[#6F6A60]">
                  {isLinkMethod
                    ? "Direct contribution via creator's personalized Razorpay link."
                    : "Direct contribution via integrated Razorpay checkout."}
                </p>

                {/* Purpose banner if set */}
                {currentUser.supportPurpose && (
                  <div className="mt-4 rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] p-3 text-xs text-[#6F6A60]">
                    <span className="text-[#C86B3C] font-semibold block mb-0.5">What this funds:</span>
                    {currentUser.supportPurpose}
                  </div>
                )}

                {/* Support Form */}
                <form onSubmit={handlePay} className="mt-5 space-y-4">
                  {/* Name field (for gateway flow) */}
                  {!isLinkMethod && !paymentform.isAnonymous && (
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium text-[#6F6A60] mb-1"
                      >
                        Your name or handle
                      </label>
                      <input
                        id="name"
                        onChange={handleChange}
                        value={paymentform.name}
                        name="name"
                        type="text"
                        required={!paymentform.isAnonymous}
                        placeholder="e.g. Alex Rivera"
                        className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#C86B3C]/20"
                      />
                    </div>
                  )}

                  {/* Anonymous toggle (for gateway flow) */}
                  {!isLinkMethod && (
                    <div>
                      <label className="flex items-center gap-2 text-xs text-[#6F6A60] cursor-pointer">
                        <input
                          type="checkbox"
                          name="isAnonymous"
                          checked={paymentform.isAnonymous}
                          onChange={handleChange}
                          className="rounded border-[#DED8CE] text-[#C86B3C] focus:ring-0"
                        />
                        <span>Make my contribution anonymous</span>
                      </label>
                    </div>
                  )}

                  {/* Message (for gateway flow) */}
                  {!isLinkMethod && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="message"
                          className="block text-xs font-medium text-[#6F6A60]"
                        >
                          Note of encouragement (optional)
                        </label>
                        <span className="text-[10px] text-[#918B80]">
                          {paymentform.message.length}/300
                        </span>
                      </div>
                      <textarea
                        id="message"
                        onChange={handleChange}
                        value={paymentform.message}
                        name="message"
                        maxLength={300}
                        rows={2}
                        placeholder="Keep building amazing things!..."
                        className="w-full resize-none rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#C86B3C]/20"
                      />
                    </div>
                  )}

                  {/* Amount (for gateway flow) */}
                  {!isLinkMethod && (
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-xs font-medium text-[#6F6A60] mb-1"
                      >
                        Contribution Amount (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#918B80]">
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
                          placeholder="50"
                          className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] py-2 pl-7 pr-3 text-xs text-[#1E1D1A] font-semibold outline-none transition focus:border-[#C86B3C] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#C86B3C]/20"
                        />
                      </div>
                    </div>
                  )}

                  {/* Presets (for gateway flow) */}
                  {!isLinkMethod && (
                    <div className="grid grid-cols-5 gap-1.5">
                      {[2, 5, 10, 25, 50].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() =>
                            setPaymentform((prev) => ({
                              ...prev,
                              amount: String(preset),
                            }))
                          }
                          className={`rounded-[6px] border py-1.5 text-xs font-semibold transition-colors cursor-pointer shadow-xs ${
                            paymentform.amount === String(preset)
                              ? "border-[#C86B3C] bg-[#F5E8E0] text-[#C86B3C]"
                              : "border-[#DED8CE] bg-[#F7F4EE] text-[#6F6A60] hover:text-[#1E1D1A] hover:bg-[#FFFFFF]"
                          }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Submit CTA */}
                  {isLinkMethod ? (
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={!currentUser.razorpayLink}
                        className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] active:bg-[#C86B3C] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        <span>☕</span>
                        <span>Support {displayName} via Razorpay Link ↗</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={
                          paying ||
                          !currentUser.razorpayid ||
                          (!paymentform.isAnonymous && !paymentform.name.trim()) ||
                          !paymentform.amount ||
                          Number(paymentform.amount) < 1
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-[#C86B3C] hover:bg-[#A9552F] active:bg-[#C86B3C] px-4 py-2.5 text-xs font-medium text-white shadow-xs hover:shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        {paying ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/30 border-t-white" />
                            <span>Opening Razorpay Checkout...</span>
                          </>
                        ) : (
                          <>
                            <span>☕</span>
                            <span>
                              Support {displayName}
                              {paymentform.amount &&
                                Number(paymentform.amount) > 0 &&
                                ` · ₹${Number(paymentform.amount).toLocaleString("en-IN")}`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#918B80]">
                    <span>🔒 Secured by Razorpay</span>
                    <button
                      type="button"
                      onClick={() => setShowReportModal(true)}
                      className="hover:text-[#B8544B] transition cursor-pointer"
                    >
                      Report profile
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* SHARE MODAL */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-[12px] border border-[#DED8CE] bg-[#FFFFFF] p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-sm font-bold text-[#1E1D1A]">
                  Share creator profile
                </h3>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="text-[#918B80] hover:text-[#1E1D1A] text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#6F6A60] mb-4">
                Share @{username}&apos;s profile to help them reach more backers.
              </p>

              {/* Copy Link Input */}
              <div className="flex items-center gap-2 rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] p-1.5 mb-4">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-transparent px-2 text-xs text-[#6F6A60] outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-[6px] bg-[#C86B3C] hover:bg-[#A9552F] px-3 py-1 text-xs font-medium text-white transition shadow-xs cursor-pointer"
                >
                  Copy
                </button>
              </div>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Support @${username} on The Brew Club: ${currentUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-[6px] border border-[#DED8CE] bg-[#F7F4EE] py-2 text-xs font-medium text-[#1E1D1A] hover:bg-[#F0ECE4] transition"
                >
                  WhatsApp
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Support @${username} on The Brew Club!`)}&url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-[6px] border border-[#DED8CE] bg-[#F7F4EE] py-2 text-xs font-medium text-[#1E1D1A] hover:bg-[#F0ECE4] transition"
                >
                  X
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-[6px] border border-[#DED8CE] bg-[#F7F4EE] py-2 text-xs font-medium text-[#1E1D1A] hover:bg-[#F0ECE4] transition"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        )}

        {/* REPORT MODAL */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-[12px] border border-[#DED8CE] bg-[#FFFFFF] p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-sm font-bold text-[#1E1D1A]">
                  Report profile
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-[#918B80] hover:text-[#1E1D1A] text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#6F6A60] mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none focus:border-[#C86B3C]"
                  >
                    <option value="Spam">Spam / Advertisements</option>
                    <option value="Misleading Content">Misleading Information / Impersonation</option>
                    <option value="Copyright Concern">Copyright Infringement</option>
                    <option value="Harassment">Inappropriate Content</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6F6A60] mb-1">
                    Details
                  </label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Briefly explain the issue for review..."
                    className="w-full resize-none rounded-[7px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-2 text-xs text-[#1E1D1A] outline-none focus:border-[#C86B3C]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="rounded-[6px] border border-[#DED8CE] bg-[#F7F4EE] px-3 py-1.5 text-xs font-medium text-[#6F6A60] hover:text-[#1E1D1A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="rounded-[6px] bg-[#B8544B] hover:bg-[#B8544B]/90 px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50"
                  >
                    {submittingReport ? "Submitting..." : "Submit report"}
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