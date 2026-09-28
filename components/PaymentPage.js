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
          color: "#C96F43",
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
      <main className="min-h-screen bg-[#171613] text-[#F4F0E8]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#34322C] border-t-[#C96F43]" />
            <p className="text-xs text-[#AAA59A]">Loading creator page...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#171613] text-[#F4F0E8] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-2xl font-bold">Creator Not Found</h1>
          <p className="mt-2 text-xs text-[#AAA59A]">
            The creator @{username} doesn&apos;t seem to exist on The Brew Club yet.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              href="/creators"
              className="rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] px-4 py-2 text-xs font-medium text-white transition-colors"
            >
              Discover creators
            </Link>
            <Link
              href="/"
              className="rounded-[7px] border border-[#34322C] bg-[#201F1B] hover:bg-[#282721] px-4 py-2 text-xs font-medium text-[#F4F0E8] transition-colors"
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

      <main className="min-h-screen bg-[#171613] text-[#F4F0E8] pb-24">
        {/* Cover Banner (Restrained) */}
        <div className="h-44 w-full overflow-hidden bg-[#201F1B] border-b border-[#34322C] md:h-60 relative">
          {currentUser.coverpic ? (
            <img
              src={currentUser.coverpic}
              alt={`${displayName}'s banner`}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className="h-full w-full object-cover opacity-70"
            />
          ) : (
            <div className="h-full w-full bg-[#201F1B]" />
          )}
        </div>

        {/* Creator Header Section */}
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative -mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-8 border-b border-[#34322C]">
            {/* Avatar + Main Identity */}
            <div className="flex items-end gap-4">
              <div className="h-24 w-24 rounded-[10px] border-2 border-[#171613] bg-[#201F1B] overflow-hidden shrink-0 shadow-md">
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
                  className="creator-avatar-fallback h-full w-full items-center justify-center bg-[#282721] text-2xl font-bold text-[#E9DFD0]"
                >
                  {initial}
                </div>
              </div>

              <div className="pt-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#F4F0E8] tracking-tight">
                  {displayName}
                </h1>
                <p className="text-xs font-medium text-[#C96F43]">
                  @{username}
                </p>
              </div>
            </div>

            {/* Top Creator Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="rounded-[6px] border border-[#34322C] bg-[#201F1B] px-3 py-1.5 text-xs font-medium text-[#AAA59A] hover:text-[#F4F0E8] hover:bg-[#282721] transition-colors cursor-pointer"
                title="Share profile"
              >
                Share
              </button>

              <button
                type="button"
                onClick={handleToggleSave}
                disabled={savingBookmark}
                className={`rounded-[6px] border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  isSaved
                    ? "border-[#C96F43]/40 bg-[#C96F43]/15 text-[#C96F43]"
                    : "border-[#34322C] bg-[#201F1B] text-[#AAA59A] hover:text-[#F4F0E8] hover:bg-[#282721]"
                }`}
                title={isSaved ? "Saved" : "Save creator"}
              >
                {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* Bio & Social Links */}
          <div className="py-6 border-b border-[#34322C]">
            <p className="text-sm leading-relaxed text-[#AAA59A] max-w-2xl">
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
                    className="rounded-[6px] border border-[#34322C] bg-[#201F1B] px-2.5 py-0.5 text-xs text-[#AAA59A]"
                  >
                    {skill}
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
                    className="rounded-[6px] border border-[#34322C] bg-[#201F1B] px-2.5 py-1 text-xs text-[#AAA59A] hover:text-[#F4F0E8] hover:bg-[#282721] transition-colors"
                  >
                    GitHub ↗
                  </a>
                )}
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[6px] border border-[#34322C] bg-[#201F1B] px-2.5 py-1 text-xs text-[#AAA59A] hover:text-[#F4F0E8] hover:bg-[#282721] transition-colors"
                  >
                    LinkedIn ↗
                  </a>
                )}
                {social.portfolio && (
                  <a
                    href={social.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[6px] border border-[#34322C] bg-[#201F1B] px-2.5 py-1 text-xs text-[#AAA59A] hover:text-[#F4F0E8] hover:bg-[#282721] transition-colors"
                  >
                    Portfolio ↗
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[6px] border border-[#34322C] bg-[#201F1B] px-2.5 py-1 text-xs text-[#AAA59A] hover:text-[#F4F0E8] hover:bg-[#282721] transition-colors"
                  >
                    X (Twitter) ↗
                  </a>
                )}
                {social.other && (
                  <a
                    href={social.other}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[6px] border border-[#34322C] bg-[#201F1B] px-2.5 py-1 text-xs text-[#AAA59A] hover:text-[#F4F0E8] hover:bg-[#282721] transition-colors"
                  >
                    Website ↗
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="py-5 flex items-center gap-8 text-xs border-b border-[#34322C]">
            <div>
              <span className="font-heading text-lg font-bold text-[#F4F0E8] block">
                {payments.length}
              </span>
              <span className="text-[#77736B]">Supporters</span>
            </div>
            <div className="h-6 w-px bg-[#34322C]" />
            <div>
              <span className="font-heading text-lg font-bold text-[#C96F43] block">
                ₹{totalRaised.toLocaleString("en-IN")}
              </span>
              <span className="text-[#77736B]">Supported</span>
            </div>
          </div>

          {/* Thank You Note (if creator set one) */}
          {currentUser.thankYouMessage && (
            <div className="my-8 rounded-[10px] border border-[#34322C] bg-[#201F1B] p-5 text-xs text-[#AAA59A]">
              <span className="text-[#C96F43] font-medium block mb-1">A note from {displayName}:</span>
              <p className="italic leading-relaxed text-[#F4F0E8]">
                &ldquo;{currentUser.thankYouMessage}&rdquo;
              </p>
            </div>
          )}

          {/* Content & Support Grid */}
          <div className="mt-10 grid gap-12 lg:grid-cols-12">
            {/* Left Column: Story, Projects, Achievements (7 cols) */}
            <div className="space-y-10 lg:col-span-7">
              {/* About Section */}
              {currentUser.about && currentUser.about.trim() && (
                <section>
                  <h2 className="font-heading text-base font-semibold text-[#F4F0E8] mb-3">
                    About
                  </h2>
                  <p className="text-xs leading-relaxed text-[#AAA59A] whitespace-pre-line">
                    {currentUser.about}
                  </p>
                </section>
              )}

              {/* What I'm Building */}
              {currentUser.currentWork && currentUser.currentWork.trim() && (
                <section className="border-t border-[#34322C] pt-8">
                  <h2 className="font-heading text-base font-semibold text-[#F4F0E8] mb-3">
                    What I&apos;m building
                  </h2>
                  <p className="text-xs leading-relaxed text-[#AAA59A] whitespace-pre-line">
                    {currentUser.currentWork}
                  </p>
                </section>
              )}

              {/* Why Support Me */}
              {currentUser.whySupport && currentUser.whySupport.trim() && (
                <section className="border-t border-[#34322C] pt-8">
                  <h2 className="font-heading text-base font-semibold text-[#F4F0E8] mb-3">
                    Why support my work
                  </h2>
                  <p className="text-xs leading-relaxed text-[#AAA59A] whitespace-pre-line">
                    {currentUser.whySupport}
                  </p>
                </section>
              )}

              {/* Featured Project */}
              {featuredProject && (
                <section className="border-t border-[#34322C] pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading text-base font-semibold text-[#F4F0E8]">
                      Featured project
                    </h2>
                    <span className="rounded-[6px] border border-[#34322C] bg-[#201F1B] px-2 py-0.5 text-[10px] text-[#AAA59A]">
                      {featuredProject.status || "In Progress"}
                    </span>
                  </div>

                  <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-5">
                    <h3 className="font-heading text-base font-semibold text-[#F4F0E8]">
                      {featuredProject.name}
                    </h3>

                    {featuredProject.description && (
                      <p className="mt-2 text-xs leading-relaxed text-[#AAA59A]">
                        {featuredProject.description}
                      </p>
                    )}

                    {featuredProject.technologies && featuredProject.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {featuredProject.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="rounded-[4px] border border-[#34322C] bg-[#171613] px-1.5 py-0.5 text-[10px] text-[#AAA59A]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#34322C]">
                      {featuredProject.live && (
                        <a
                          href={featuredProject.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-[6px] bg-[#C96F43] hover:bg-[#D98255] px-3 py-1 text-xs font-medium text-white transition-colors"
                        >
                          Live Demo ↗
                        </a>
                      )}
                      {featuredProject.github && (
                        <a
                          href={featuredProject.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-[6px] border border-[#34322C] bg-[#171613] hover:bg-[#282721] px-3 py-1 text-xs font-medium text-[#F4F0E8] transition-colors"
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
                <section className="border-t border-[#34322C] pt-8">
                  <h2 className="font-heading text-base font-semibold text-[#F4F0E8] mb-4">
                    Other projects
                  </h2>

                  <div className="space-y-3">
                    {regularProjects.map((project, idx) => (
                      <div
                        key={idx}
                        className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-heading text-sm font-semibold text-[#F4F0E8]">
                              {project.name}
                            </h3>
                            <span className="text-[10px] text-[#77736B]">
                              {project.status || "In Progress"}
                            </span>
                          </div>

                          {project.description && (
                            <p className="mt-1.5 text-xs text-[#AAA59A] leading-relaxed line-clamp-3">
                              {project.description}
                            </p>
                          )}
                        </div>

                        {(project.live || project.github || project.url) && (
                          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-[#34322C]">
                            {project.live && (
                              <a
                                href={project.live}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#C96F43] hover:underline"
                              >
                                Live Demo ↗
                              </a>
                            )}
                            {project.github && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#AAA59A] hover:text-[#F4F0E8]"
                              >
                                GitHub ↗
                              </a>
                            )}
                            {project.url && !project.live && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#AAA59A] hover:text-[#F4F0E8]"
                              >
                                View Link ↗
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Achievements */}
              {validAchievements.length > 0 && (
                <section className="border-t border-[#34322C] pt-8">
                  <h2 className="font-heading text-base font-semibold text-[#F4F0E8] mb-3">
                    Milestones & Recognition
                  </h2>
                  <ul className="space-y-2">
                    {validAchievements.map((item, idx) => (
                      <li
                        key={idx}
                        className="rounded-[7px] border border-[#34322C] bg-[#201F1B] px-3.5 py-2 text-xs text-[#AAA59A]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Recent Supporters Wall */}
              <section className="border-t border-[#34322C] pt-8">
                <h2 className="font-heading text-base font-semibold text-[#F4F0E8] mb-1">
                  Recent support
                </h2>
                <p className="text-xs text-[#77736B] mb-4">
                  Supporters who have backed @{username}.
                </p>

                {payments.length === 0 ? (
                  <div className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6 text-center">
                    <p className="text-xs font-medium text-[#F4F0E8]">No support yet.</p>
                    <p className="mt-1 text-xs text-[#77736B]">
                      Your first supporter will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {payments.map((payment, index) => (
                      <div
                        key={payment._id || index}
                        className="rounded-[10px] border border-[#34322C] bg-[#201F1B] p-3.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#F4F0E8]">
                              {payment.name}
                            </span>
                            <span className="text-[11px] text-[#77736B]">
                              {payment.createdAt
                                ? new Date(payment.createdAt).toLocaleDateString(
                                    "en-IN",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                : "Supporter"}
                            </span>
                          </div>

                          <span className="font-medium text-[#C96F43]">
                            ₹{payment.amount}
                          </span>
                        </div>

                        {payment.message && (
                          <p className="mt-2 text-[#AAA59A] italic">
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
              <div className="sticky top-20 rounded-[10px] border border-[#34322C] bg-[#201F1B] p-6">
                <h2 className="font-heading text-base font-semibold text-[#F4F0E8]">
                  Support {displayName}
                </h2>
                <p className="mt-1 text-xs text-[#77736B]">
                  {isLinkMethod
                    ? "Proceed to the creator's direct Razorpay payment link."
                    : "Direct contribution via integrated Razorpay."}
                </p>

                {/* Purpose banner if set */}
                {currentUser.supportPurpose && (
                  <div className="mt-4 rounded-[7px] border border-[#34322C] bg-[#171613] p-3 text-xs text-[#AAA59A]">
                    <span className="text-[#C96F43] font-medium block mb-0.5">What this funds:</span>
                    {currentUser.supportPurpose}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handlePay} className="mt-5 space-y-4">
                  {/* Name field (for gateway flow) */}
                  {!isLinkMethod && !paymentform.isAnonymous && (
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-xs font-medium text-[#AAA59A] mb-1"
                      >
                        Your name
                      </label>
                      <input
                        id="name"
                        onChange={handleChange}
                        value={paymentform.name}
                        name="name"
                        type="text"
                        required={!paymentform.isAnonymous}
                        placeholder="e.g. Alex Rivera"
                        className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43] focus:ring-1 focus:ring-[#C96F43]/40"
                      />
                    </div>
                  )}

                  {/* Anonymous toggle (for gateway flow) */}
                  {!isLinkMethod && (
                    <div>
                      <label className="flex items-center gap-2 text-xs text-[#AAA59A] cursor-pointer">
                        <input
                          type="checkbox"
                          name="isAnonymous"
                          checked={paymentform.isAnonymous}
                          onChange={handleChange}
                          className="rounded border-[#34322C] text-[#C96F43] focus:ring-0"
                        />
                        <span>Make contribution anonymous</span>
                      </label>
                    </div>
                  )}

                  {/* Message (for gateway flow) */}
                  {!isLinkMethod && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="message"
                          className="block text-xs font-medium text-[#AAA59A]"
                        >
                          Message (optional)
                        </label>
                        <span className="text-[10px] text-[#77736B]">
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
                        placeholder="Keep building great things..."
                        className="w-full resize-none rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43] focus:ring-1 focus:ring-[#C96F43]/40"
                      />
                    </div>
                  )}

                  {/* Amount (for gateway flow) */}
                  {!isLinkMethod && (
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-xs font-medium text-[#AAA59A] mb-1"
                      >
                        Amount (₹)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#77736B]">
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
                          className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] py-2 pl-7 pr-3 text-xs text-[#F4F0E8] outline-none transition focus:border-[#C96F43] focus:ring-1 focus:ring-[#C96F43]/40"
                        />
                      </div>
                    </div>
                  )}

                  {/* Presets (for gateway flow) */}
                  {!isLinkMethod && (
                    <div className="grid grid-cols-4 gap-1.5">
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
                          className={`rounded-[6px] border py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                            paymentform.amount === String(preset)
                              ? "border-[#C96F43] bg-[#C96F43]/15 text-[#E9DFD0]"
                              : "border-[#34322C] bg-[#171613] text-[#AAA59A] hover:text-[#F4F0E8]"
                          }`}
                        >
                          ₹{preset}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action CTA Button */}
                  {isLinkMethod ? (
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={!currentUser.razorpayLink}
                        className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] active:bg-[#C96F43] px-4 py-2.5 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        Support {displayName} ↗
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
                        className="flex w-full items-center justify-center gap-2 rounded-[7px] bg-[#C96F43] hover:bg-[#D98255] active:bg-[#C96F43] px-4 py-2.5 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                      >
                        {paying ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/30 border-t-white" />
                            <span>Opening Razorpay...</span>
                          </>
                        ) : (
                          <>
                            Support {displayName}
                            {paymentform.amount &&
                              Number(paymentform.amount) > 0 &&
                              ` · ₹${Number(paymentform.amount).toLocaleString("en-IN")}`}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#77736B]">
                    <span>Direct payments via Razorpay</span>
                    <button
                      type="button"
                      onClick={() => setShowReportModal(true)}
                      className="hover:text-[#C85C52] transition-colors cursor-pointer"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-[12px] border border-[#34322C] bg-[#201F1B] p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-sm font-semibold text-[#F4F0E8]">
                  Share profile
                </h3>
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="text-[#77736B] hover:text-[#F4F0E8] text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#AAA59A] mb-4">
                Share @{username}&apos;s profile link with your network.
              </p>

              {/* Copy Link Input */}
              <div className="flex items-center gap-2 rounded-[7px] border border-[#34322C] bg-[#171613] p-1.5 mb-4">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="flex-1 bg-transparent px-2 text-xs text-[#AAA59A] outline-none truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="rounded-[6px] bg-[#C96F43] hover:bg-[#D98255] px-3 py-1 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  Copy
                </button>
              </div>

              {/* Social Share Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out @${username} on The Brew Club: ${currentUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-[6px] border border-[#34322C] bg-[#171613] py-2 text-xs font-medium text-[#AAA59A] hover:text-[#F4F0E8] transition-colors"
                >
                  WhatsApp
                </a>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Support @${username} on The Brew Club!`)}&url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-[6px] border border-[#34322C] bg-[#171613] py-2 text-xs font-medium text-[#AAA59A] hover:text-[#F4F0E8] transition-colors"
                >
                  X
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-[6px] border border-[#34322C] bg-[#171613] py-2 text-xs font-medium text-[#AAA59A] hover:text-[#F4F0E8] transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        )}

        {/* REPORT MODAL */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-[12px] border border-[#34322C] bg-[#201F1B] p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-sm font-semibold text-[#F4F0E8]">
                  Report profile
                </h3>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="text-[#77736B] hover:text-[#F4F0E8] text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#AAA59A] mb-1">
                    Reason
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none focus:border-[#C96F43]"
                  >
                    <option value="Spam">Spam / Advertisements</option>
                    <option value="Misleading Content">Misleading Information / Impersonation</option>
                    <option value="Copyright Concern">Copyright Infringement</option>
                    <option value="Harassment">Inappropriate Content</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#AAA59A] mb-1">
                    Details
                  </label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Briefly explain the issue for our moderation review..."
                    className="w-full resize-none rounded-[7px] border border-[#34322C] bg-[#171613] px-3 py-2 text-xs text-[#F4F0E8] outline-none focus:border-[#C96F43]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="rounded-[6px] border border-[#34322C] bg-[#171613] px-3 py-1.5 text-xs text-[#AAA59A] hover:text-[#F4F0E8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="rounded-[6px] bg-[#C85C52] hover:bg-[#C85C52]/90 px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50"
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