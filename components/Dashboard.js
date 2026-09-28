"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchuser,
  updateProfile,
  fetchCreatorAnalytics,
  fetchSupporterActivity,
  fetchSavedCreators,
  unsaveCreator,
  fetchNotifications,
  markNotificationAsRead,
  fetchAdminData,
  moderateReport,
} from "@/actions/useractions";
import { useToast } from "./Toast";

const Dashboard = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    about: "",
    currentWork: "",
    whySupport: "",
    supportPurpose: "",
    thankYouMessage: "",
    skills: "",
    achievements: [""],
    projects: [
      {
        name: "",
        description: "",
        image: "",
        github: "",
        live: "",
        url: "",
        technologies: "",
        status: "In Progress",
        featured: false,
      },
    ],
    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: "",
      twitter: "",
      other: "",
    },
    profilepic: "",
    coverpic: "",
    paymentMethod: "razorpay_gateway",
    razorpayLink: "",
    razorpayid: "",
    razorpaysecret: "",
    gatewayConfigured: false,
    isTestGateway: false,
    isLiveGateway: false,
    role: "user",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // 'profile' | 'story' | 'portfolio' | 'analytics' | 'supporters' | 'notifications' | 'payments' | 'admin'

  // Additional Data State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [savedCreators, setSavedCreators] = useState([]);
  const [supporterActivity, setSupporterActivity] = useState([]);
  const [supportersLoading, setSupportersLoading] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);
  const [notifsLoading, setNotifsLoading] = useState(false);

  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);

  // Initial Profile Load
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.name) {
      const getData = async () => {
        try {
          const user = await fetchuser(session.user.name);
          if (user) {
            setForm({
              name: user.name || "",
              email: session.user.email || user.email || "",
              username: user.username || session.user.name || "",
              bio: user.bio || "",
              about: user.about || "",
              currentWork: user.currentWork || "",
              whySupport: user.whySupport || "",
              supportPurpose: user.supportPurpose || "",
              thankYouMessage: user.thankYouMessage || "",
              skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
              achievements:
                Array.isArray(user.achievements) && user.achievements.length > 0
                  ? user.achievements
                  : [""],
              projects:
                Array.isArray(user.projects) && user.projects.length > 0
                  ? user.projects.map((p) => ({
                      name: p.name || "",
                      description: p.description || "",
                      image: p.image || "",
                      github: p.github || "",
                      live: p.live || "",
                      url: p.url || "",
                      technologies: Array.isArray(p.technologies)
                        ? p.technologies.join(", ")
                        : p.technologies || "",
                      status: p.status || "In Progress",
                      featured: Boolean(p.featured),
                    }))
                  : [
                      {
                        name: "",
                        description: "",
                        image: "",
                        github: "",
                        live: "",
                        url: "",
                        technologies: "",
                        status: "In Progress",
                        featured: false,
                      },
                    ],
              socialLinks: {
                github: user.socialLinks?.github || "",
                linkedin: user.socialLinks?.linkedin || "",
                portfolio: user.socialLinks?.portfolio || "",
                twitter: user.socialLinks?.twitter || "",
                other: user.socialLinks?.other || "",
              },
              profilepic: user.profilepic || "",
              coverpic: user.coverpic || "",
              paymentMethod:
                user.paymentMethod ||
                (user.razorpayLink && !user.razorpayid
                  ? "razorpay_link"
                  : "razorpay_gateway"),
              razorpayLink: user.razorpayLink || "",
              razorpayid: user.razorpayid || "",
              razorpaysecret: "",
              gatewayConfigured: Boolean(user.gatewayConfigured),
              isTestGateway: Boolean(user.isTestGateway),
              isLiveGateway: Boolean(user.isLiveGateway),
              role: user.role || session.user.role || "user",
            });
          }
        } catch (error) {
          console.error("Failed to load profile:", error);
          toast.error("Could not load your profile details.");
        } finally {
          setLoading(false);
        }
      };

      getData();
    }
  }, [session, status, router, toast]);

  // Tab Data Fetching on Demand
  useEffect(() => {
    if (!session?.user) return;

    if (activeTab === "analytics" && !analytics) {
      setAnalyticsLoading(true);
      fetchCreatorAnalytics(form.username || session.user.name)
        .then((res) => {
          if (res?.success) setAnalytics(res.analytics);
        })
        .finally(() => setAnalyticsLoading(false));
    }

    if (activeTab === "supporters") {
      setSupportersLoading(true);
      Promise.all([fetchSavedCreators(), fetchSupporterActivity()])
        .then(([savedRes, actRes]) => {
          if (savedRes?.success) setSavedCreators(savedRes.creators || []);
          if (actRes?.success) setSupporterActivity(actRes.activity || []);
        })
        .finally(() => setSupportersLoading(false));
    }

    if (activeTab === "notifications") {
      setNotifsLoading(true);
      fetchNotifications()
        .then((res) => {
          if (res?.success) {
            setNotifications(res.notifications || []);
            setUnreadNotifsCount(res.unreadCount || 0);
          }
        })
        .finally(() => setNotifsLoading(false));
    }

    if (activeTab === "admin" && (form.role === "admin" || session.user.role === "admin")) {
      setAdminLoading(true);
      fetchAdminData()
        .then((res) => {
          if (res?.success) setAdminData(res);
        })
        .finally(() => setAdminLoading(false));
    }
  }, [activeTab, session, form.username, form.role, analytics]);

  // Profile Completeness Calculation
  const completeness = useMemo(() => {
    const isPaymentDone = Boolean(
      (form.paymentMethod === "razorpay_link" && form.razorpayLink && form.razorpayLink.trim()) ||
      (form.paymentMethod === "razorpay_gateway" && (form.razorpayid || form.gatewayConfigured)) ||
      (form.razorpayLink && form.razorpayLink.trim()) ||
      form.razorpayid ||
      form.gatewayConfigured
    );

    const checks = [
      { id: "profilepic", label: "Profile Picture", done: Boolean(form.profilepic && form.profilepic.trim()), tip: "Add a profile picture URL to build instant trust with supporters." },
      { id: "bio", label: "Short Bio", done: Boolean(form.bio && form.bio.trim()), tip: "Add a concise bio to introduce yourself on discovery cards." },
      { id: "about", label: "About Me Story", done: Boolean(form.about && form.about.trim().length > 30), tip: "Share your developer journey and background in the Story tab." },
      { id: "currentWork", label: "Current Work", done: Boolean(form.currentWork && form.currentWork.trim()), tip: "Tell visitors what you are actively building right now." },
      { id: "whySupport", label: "Why Support Me", done: Boolean(form.whySupport && form.whySupport.trim()), tip: "Explain how contributions empower your work." },
      { id: "projects", label: "Showcase a Project", done: form.projects.some((p) => p.name && p.name.trim()), tip: "Add at least one project to highlight your skills." },
      { id: "skills", label: "Skills / Stack", done: Boolean(form.skills && form.skills.trim()), tip: "List your technical skills for discovery filters." },
      { id: "socialLinks", label: "Social Links", done: Boolean(form.socialLinks.github || form.socialLinks.linkedin || form.socialLinks.portfolio || form.socialLinks.twitter), tip: "Link your GitHub, LinkedIn, or personal website." },
      { id: "payment", label: "Payment Setup", done: isPaymentDone, tip: "Configure your Razorpay Payment Link or Gateway in the Payment Settings tab." },
    ];

    const completed = checks.filter((c) => c.done).length;
    const percentage = Math.round((completed / checks.length) * 100);
    const missing = checks.filter((c) => !c.done);

    return { percentage, completed, total: checks.length, missing };
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "profilepic") setImgError(false);
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [name]: value },
    }));
  };

  // Achievement helpers
  const handleAchievementChange = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.achievements];
      updated[index] = value;
      return { ...prev, achievements: updated };
    });
  };

  const addAchievement = () => {
    setForm((prev) => ({
      ...prev,
      achievements: [...prev.achievements, ""],
    }));
  };

  const removeAchievement = (index) => {
    setForm((prev) => {
      const updated = prev.achievements.filter((_, i) => i !== index);
      return {
        ...prev,
        achievements: updated.length > 0 ? updated : [""],
      };
    });
  };

  // Project helpers
  const handleProjectChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...prev.projects];
      if (field === "featured" && value === true) {
        // Only one project can be featured at a time
        updated.forEach((p, i) => {
          p.featured = i === index;
        });
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, projects: updated };
    });
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: "",
          description: "",
          image: "",
          github: "",
          live: "",
          url: "",
          technologies: "",
          status: "In Progress",
          featured: false,
        },
      ],
    }));
  };

  const removeProject = (index) => {
    setForm((prev) => {
      const updated = prev.projects.filter((_, i) => i !== index);
      return {
        ...prev,
        projects:
          updated.length > 0
            ? updated
            : [
                {
                  name: "",
                  description: "",
                  image: "",
                  github: "",
                  live: "",
                  url: "",
                  technologies: "",
                  status: "In Progress",
                  featured: false,
                },
              ],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!session?.user?.name) {
      toast.error("You must be logged in to save changes.");
      return;
    }

    setSaving(true);

    try {
      const cleanAchievements = form.achievements
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const cleanProjects = form.projects
        .filter((p) => p.name && p.name.trim())
        .map((p) => ({
          name: p.name.trim(),
          description: p.description ? p.description.trim() : "",
          image: p.image ? p.image.trim() : "",
          github: p.github ? p.github.trim() : "",
          live: p.live ? p.live.trim() : "",
          url: p.url ? p.url.trim() : "",
          technologies: typeof p.technologies === "string"
            ? p.technologies.split(",").map((t) => t.trim()).filter(Boolean)
            : p.technologies || [],
          status: p.status || "In Progress",
          featured: Boolean(p.featured),
        }));

      const cleanSkills =
        typeof form.skills === "string"
          ? form.skills
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s.length > 0)
          : [];

      const payload = {
        ...form,
        skills: cleanSkills,
        achievements: cleanAchievements,
        projects: cleanProjects,
      };

      const res = await updateProfile(payload, session.user.name);

      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success) {
        toast.success(res.message || "Settings updated successfully! ☕");

        if (res.user) {
          setForm((prev) => ({
            ...prev,
            name: res.user.name,
            username: res.user.username,
            bio: res.user.bio || "",
            about: res.user.about || "",
            currentWork: res.user.currentWork || "",
            whySupport: res.user.whySupport || "",
            supportPurpose: res.user.supportPurpose || "",
            thankYouMessage: res.user.thankYouMessage || "",
            skills: Array.isArray(res.user.skills) ? res.user.skills.join(", ") : "",
            achievements:
              Array.isArray(res.user.achievements) && res.user.achievements.length > 0
                ? res.user.achievements
                : [""],
            projects:
              Array.isArray(res.user.projects) && res.user.projects.length > 0
                ? res.user.projects.map((p) => ({
                    ...p,
                    technologies: Array.isArray(p.technologies)
                      ? p.technologies.join(", ")
                      : p.technologies || "",
                  }))
                : prev.projects,
            socialLinks: res.user.socialLinks || prev.socialLinks,
            profilepic: res.user.profilepic || "",
            coverpic: res.user.coverpic || "",
            paymentMethod: res.user.paymentMethod || prev.paymentMethod,
            razorpayLink: res.user.razorpayLink || "",
            razorpayid: res.user.razorpayid || "",
            gatewayConfigured: Boolean(res.user.gatewayConfigured),
            isTestGateway: Boolean(res.user.razorpayid?.startsWith("rzp_test_")),
            isLiveGateway: Boolean(res.user.razorpayid?.startsWith("rzp_live_")),
            razorpaysecret: "",
          }));
        }

        if (typeof update === "function") {
          await update();
        }

        router.refresh();
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Something went wrong while saving your changes.");
    } finally {
      setSaving(false);
    }
  };

  // Handle unsaving creator
  const handleUnsave = async (creatorUsername) => {
    try {
      const res = await unsaveCreator(creatorUsername);
      if (res?.success) {
        setSavedCreators((prev) => prev.filter((c) => c.username !== creatorUsername));
        toast.success("Creator removed from saved bookmarks.");
      } else {
        toast.error(res?.error || "Failed to remove bookmark.");
      }
    } catch (err) {
      toast.error("Failed to remove bookmark.");
    }
  };

  // Handle mark notifications as read
  const handleMarkNotifRead = async (id = "all") => {
    try {
      const res = await markNotificationAsRead(id);
      if (res?.success) {
        if (id === "all") {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          setUnreadNotifsCount(0);
        } else {
          setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, read: true } : n))
          );
          setUnreadNotifsCount((prev) => Math.max(0, prev - 1));
        }
        toast.success("Notification updated.");
      }
    } catch (err) {
      toast.error("Could not update notification.");
    }
  };

  // Handle report moderation
  const handleModerateReport = async (reportId, newStatus) => {
    try {
      const res = await moderateReport({ reportId, status: newStatus });
      if (res?.success) {
        setAdminData((prev) => ({
          ...prev,
          reports: prev.reports.map((r) =>
            r._id === reportId ? { ...r, status: newStatus } : r
          ),
          stats: {
            ...prev.stats,
            pendingReports: Math.max(0, prev.stats.pendingReports - 1),
          },
        }));
        toast.success(res.message);
      } else {
        toast.error(res?.error || "Failed to moderate report.");
      }
    } catch (err) {
      toast.error("Moderation error.");
    }
  };

  const skillsList = form.skills
    ? form.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  if (loading || status === "loading") {
    return (
      <main className="min-h-screen bg-[#0b0b0f] text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
            <p className="text-sm text-gray-500">Loading your creator studio...</p>
          </div>
        </div>
      </main>
    );
  }

  const isAdmin = form.role === "admin" || session?.user?.role === "admin";

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-14">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-2 rounded-full border border-amber-400/20 bg-amber-400/10 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <span>☕</span> Creator Studio
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome,{" "}
              <span className="bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {form.name || form.username || "Creator"}
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-gray-400">
              Customize your creator portfolio, track real supporter analytics, manage showcase projects, and choose your preferred payment method.
            </p>
          </div>

          {form.username && (
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Link
                href={`/${form.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 hover:text-white transition shadow-sm"
              >
                <span>✨</span>
                <span>View Public Page ↗</span>
              </Link>
            </div>
          )}
        </div>

        {/* PROFILE COMPLETENESS WIDGET */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-linear-to-r from-amber-400/5 via-orange-500/5 to-transparent p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">Profile Completeness</span>
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-extrabold text-amber-300">
                  {completeness.percentage}%
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {completeness.percentage === 100
                  ? "🎉 Amazing! Your creator profile is 100% complete and ready to convert supporters."
                  : completeness.missing.length > 0
                  ? `Tip: ${completeness.missing[0].tip}`
                  : "Complete your profile to help supporters discover and back your work."}
              </p>
            </div>

            <div className="w-full md:w-48 shrink-0">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>
              <p className="mt-1 text-right text-[11px] text-gray-500">
                {completeness.completed} of {completeness.total} completed
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "profile", label: "Basic Info", icon: "👤" },
            { id: "story", label: "Story & Purpose", icon: "📖" },
            { id: "portfolio", label: "Projects & Highlights", icon: "🚀" },
            { id: "analytics", label: "Analytics (Real Data)", icon: "📊" },
            { id: "supporters", label: "Bookmarks & Activity", icon: "🔖" },
            {
              id: "notifications",
              label: "Activity Feed",
              icon: "🔔",
              badge: unreadNotifsCount > 0 ? unreadNotifsCount : null,
            },
            { id: "payments", label: "Payment Settings", icon: "💳" },
            ...(isAdmin ? [{ id: "admin", label: "Admin & Reports", icon: "🛡️" }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-linear-to-r from-amber-400/20 to-orange-500/20 text-amber-300 border border-amber-400/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-bold text-black">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: BASIC PROFILE INFO */}
        {activeTab === "profile" && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
              <div className="border-b border-white/10 px-6 py-5 md:px-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {form.profilepic && !imgError ? (
                    <img
                      src={form.profilepic}
                      alt={form.name || "Profile"}
                      onError={() => setImgError(true)}
                      className="h-16 w-16 rounded-2xl border border-white/15 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-2xl font-extrabold text-black">
                      {(form.name || form.username || "C").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">Creator Identity</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Your public name, handle, avatar representation, and profile banners.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Display Name
                  </label>
                  <input
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="e.g. Alex Rivera"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Account Email <span className="text-[10px] text-amber-400/80">(Private)</span>
                  </label>
                  <input
                    value={form.email}
                    disabled
                    type="email"
                    name="email"
                    id="email"
                    className="w-full rounded-xl border border-white/5 bg-black/10 px-4 py-3 text-sm text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="username" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Creator Handle / Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">@</span>
                    <input
                      value={form.username}
                      onChange={handleChange}
                      type="text"
                      name="username"
                      id="username"
                      required
                      placeholder="yourhandle"
                      className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-8 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-gray-500">
                    Public URL: <span className="text-amber-400">/{form.username || "username"}</span>
                  </p>
                </div>

                <div>
                  <label htmlFor="profilepic" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Profile Picture URL
                  </label>
                  <input
                    value={form.profilepic}
                    onChange={handleChange}
                    type="url"
                    name="profilepic"
                    id="profilepic"
                    placeholder="https://images.unsplash.com/... or https://..."
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                  <p className="mt-1.5 text-[11px] text-gray-500">
                    Paste an image URL. Profile images are manually controlled by you.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="coverpic" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Cover Banner URL
                  </label>
                  <input
                    value={form.coverpic}
                    onChange={handleChange}
                    type="url"
                    name="coverpic"
                    id="coverpic"
                    placeholder="https://images.unsplash.com/... or https://..."
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
              <div className="border-b border-white/10 px-6 py-5 md:px-8">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>🌐</span> Social & Professional Links
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Connect your GitHub, LinkedIn, and personal website so supporters can explore your work.
                </p>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
                <div>
                  <label htmlFor="social-github" className="mb-1.5 block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <span>🐙</span> GitHub Profile
                  </label>
                  <input
                    value={form.socialLinks.github}
                    onChange={handleSocialChange}
                    type="url"
                    name="github"
                    id="social-github"
                    placeholder="https://github.com/username"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>

                <div>
                  <label htmlFor="social-linkedin" className="mb-1.5 block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <span>💼</span> LinkedIn Profile
                  </label>
                  <input
                    value={form.socialLinks.linkedin}
                    onChange={handleSocialChange}
                    type="url"
                    name="linkedin"
                    id="social-linkedin"
                    placeholder="https://linkedin.com/in/username"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>

                <div>
                  <label htmlFor="social-portfolio" className="mb-1.5 block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <span>✨</span> Portfolio / Website
                  </label>
                  <input
                    value={form.socialLinks.portfolio}
                    onChange={handleSocialChange}
                    type="url"
                    name="portfolio"
                    id="social-portfolio"
                    placeholder="https://yourportfolio.dev"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>

                <div>
                  <label htmlFor="social-twitter" className="mb-1.5 block text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <span>🐦</span> X (Twitter) Profile
                  </label>
                  <input
                    value={form.socialLinks.twitter}
                    onChange={handleSocialChange}
                    type="url"
                    name="twitter"
                    id="social-twitter"
                    placeholder="https://x.com/username"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>
              </div>
            </section>

            {/* Save Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/2 p-6">
              <div>
                <p className="text-sm font-semibold text-white">Ready to update your creator profile?</p>
                <p className="text-xs text-gray-400 mt-0.5">Saved changes take effect immediately on your public page.</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex min-w-44 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-black transition-all hover:opacity-95 hover:shadow-lg hover:shadow-orange-500/20 active:translate-y-0.5 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Saving changes...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: STORY, BIO, PURPOSE & THANK YOU */}
        {activeTab === "story" && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
              <div className="border-b border-white/10 px-6 py-5 md:px-8">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>📖</span> Creator Story & Mission
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Help supporters understand who you are, what you create, and how their support fuels your journey.
                </p>
              </div>

              <div className="space-y-6 p-6 md:p-8">
                {/* Short Bio */}
                <div>
                  <label htmlFor="bio" className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Short Bio / Tagline
                  </label>
                  <input
                    value={form.bio}
                    onChange={handleChange}
                    type="text"
                    name="bio"
                    id="bio"
                    placeholder="e.g. Full Stack Developer building open source developer tools."
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                  <p className="mt-1.5 text-[11px] text-gray-500">
                    Displayed on creator discovery cards and profile header.
                  </p>
                </div>

                {/* About Me */}
                <div>
                  <label htmlFor="about" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    About Me / Extended Story
                  </label>
                  <textarea
                    value={form.about}
                    onChange={handleChange}
                    name="about"
                    id="about"
                    rows={4}
                    placeholder="Share your background, what drives you, what technologies you use, and the kind of work you create..."
                    className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>

                {/* Current Work */}
                <div>
                  <label htmlFor="currentWork" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <span>🔨</span> What I&apos;m Currently Building
                  </label>
                  <textarea
                    value={form.currentWork}
                    onChange={handleChange}
                    name="currentWork"
                    id="currentWork"
                    rows={3}
                    placeholder="e.g. Building an open-source analytics engine for Next.js applications..."
                    className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>

                {/* Why Support Me */}
                <div>
                  <label htmlFor="whySupport" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <span>☕</span> Why Support Me
                  </label>
                  <textarea
                    value={form.whySupport}
                    onChange={handleChange}
                    name="whySupport"
                    id="whySupport"
                    rows={3}
                    placeholder="Explain what community backing allows you to do (e.g. cover hosting costs, dedicate more time to open source, build free developer tools)..."
                    className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                </div>

                {/* Contribution Purpose */}
                <div>
                  <label htmlFor="supportPurpose" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <span>🎯</span> What Your Support Helps With (Purpose)
                  </label>
                  <input
                    value={form.supportPurpose}
                    onChange={handleChange}
                    type="text"
                    name="supportPurpose"
                    id="supportPurpose"
                    placeholder="e.g. Server hosting, API costs, learning materials & coffee"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                  <p className="mt-1.5 text-[11px] text-gray-500">
                    Shown prominently on your profile payment box.
                  </p>
                </div>

                {/* Custom Thank-You Message */}
                <div>
                  <label htmlFor="thankYouMessage" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                    <span>💌</span> Custom Thank-You Message
                  </label>
                  <textarea
                    value={form.thankYouMessage}
                    onChange={handleChange}
                    name="thankYouMessage"
                    id="thankYouMessage"
                    rows={2}
                    placeholder="e.g. Thank you so much for supporting my work! Feel free to connect with me on GitHub or Twitter anytime."
                    className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />
                  <p className="mt-1.5 text-[11px] text-gray-500">
                    Displayed to supporters immediately upon successful payment verification.
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <label htmlFor="skills" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                    Skills & Tags <span className="text-[11px] text-gray-500 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    value={form.skills}
                    onChange={handleChange}
                    type="text"
                    name="skills"
                    id="skills"
                    placeholder="e.g. Next.js, React, Node.js, TypeScript, UI/UX, AI, Python"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/50 focus:ring-2 focus:ring-amber-400/10"
                  />

                  {skillsList.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-gray-500 mr-1">Preview:</span>
                      {skillsList.map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300"
                        >
                          #{skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Save Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/2 p-6">
              <div>
                <p className="text-sm font-semibold text-white">Save your story & purpose</p>
                <p className="text-xs text-gray-400 mt-0.5">Updated details will reflect on your public profile.</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex min-w-44 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-black transition-all hover:opacity-95 cursor-pointer"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: PROJECTS & ACHIEVEMENTS */}
        {activeTab === "portfolio" && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
              <div className="border-b border-white/10 px-6 py-5 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>🚀</span> Featured Projects & Creations
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Showcase projects you have built or are actively developing. You can designate one project as &quot;Featured&quot;.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addProject}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition border border-white/10 cursor-pointer self-start sm:self-auto"
                >
                  <span>+</span> Add Project
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {form.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-5 relative transition ${
                      proj.featured
                        ? "border-amber-400/40 bg-amber-400/5 shadow-md shadow-amber-400/5"
                        : "border-white/10 bg-black/30 hover:border-white/20"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                          Project #{idx + 1}
                        </span>
                        {proj.featured && (
                          <span className="rounded-full border border-amber-400/30 bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 uppercase">
                            ⭐ Featured Spotlight
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(proj.featured)}
                            onChange={(e) =>
                              handleProjectChange(idx, "featured", e.target.checked)
                            }
                            className="rounded border-white/20 text-amber-400 focus:ring-0"
                          />
                          <span className="text-[11px] text-amber-300/90 font-medium">Pin as Featured</span>
                        </label>

                        {form.projects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProject(idx)}
                            className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>🗑️</span> Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Project Name */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-300">
                          Project Name *
                        </label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) =>
                            handleProjectChange(idx, "name", e.target.value)
                          }
                          placeholder="e.g. BrewPulse Analytics"
                          className="w-full rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                        />
                      </div>

                      {/* Project Status */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-300">
                          Project Status
                        </label>
                        <select
                          value={proj.status || "In Progress"}
                          onChange={(e) =>
                            handleProjectChange(idx, "status", e.target.value)
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#16161f] px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50 cursor-pointer"
                        >
                          <option value="In Progress">🟢 In Progress</option>
                          <option value="Completed">✅ Completed</option>
                          <option value="Archived">📦 Archived</option>
                        </select>
                      </div>

                      {/* Technologies Stack */}
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-300">
                          Tech Stack <span className="text-[11px] text-gray-500 font-normal">(comma-separated)</span>
                        </label>
                        <input
                          type="text"
                          value={proj.technologies || ""}
                          onChange={(e) =>
                            handleProjectChange(idx, "technologies", e.target.value)
                          }
                          placeholder="e.g. Next.js 14, TailwindCSS, MongoDB, WebSockets"
                          className="w-full rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                        />
                      </div>

                      {/* Project Description */}
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-300">
                          Short Description
                        </label>
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) =>
                            handleProjectChange(idx, "description", e.target.value)
                          }
                          placeholder="What does this project do and what problem does it solve?"
                          className="w-full resize-y rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                        />
                      </div>

                      {/* Project Image */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-300">
                          Preview Image URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={proj.image}
                          onChange={(e) =>
                            handleProjectChange(idx, "image", e.target.value)
                          }
                          placeholder="https://images.unsplash.com/..."
                          className="w-full rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                        />
                      </div>

                      {/* Live Demo URL */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-300">
                          Live Demo URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={proj.live}
                          onChange={(e) =>
                            handleProjectChange(idx, "live", e.target.value)
                          }
                          placeholder="https://myproject.app"
                          className="w-full rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                        />
                      </div>

                      {/* GitHub URL */}
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-gray-300">
                          GitHub Repo URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={proj.github}
                          onChange={(e) =>
                            handleProjectChange(idx, "github", e.target.value)
                          }
                          placeholder="https://github.com/user/project"
                          className="w-full rounded-xl border border-white/10 bg-white/3 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements Section */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
              <div className="border-b border-white/10 px-6 py-5 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>🏆</span> Achievements & Milestones
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Hackathons, awards, open-source milestones, certifications, or accomplishments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addAchievement}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-amber-300 transition border border-white/10 cursor-pointer self-start sm:self-auto"
                >
                  <span>+</span> Add Milestone
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-3">
                {form.achievements.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-amber-400 text-sm">⭐</span>
                    <input
                      type="text"
                      value={ach}
                      onChange={(e) => handleAchievementChange(idx, e.target.value)}
                      placeholder="e.g. Winner of DevHacks 2025 · Built CLI tool with 2,000+ GitHub stars"
                      className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/50"
                    />
                    {form.achievements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAchievement(idx)}
                        className="p-2 text-gray-400 hover:text-rose-400 transition cursor-pointer"
                        title="Remove milestone"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Save Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/2 p-6">
              <div>
                <p className="text-sm font-semibold text-white">Save projects & milestones</p>
                <p className="text-xs text-gray-400 mt-0.5">Showcased projects will appear immediately on your public portfolio.</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex min-w-44 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-black transition-all hover:opacity-95 cursor-pointer"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: CREATOR ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            {analyticsLoading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
              </div>
            ) : analytics ? (
              <>
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Raised</span>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-400">
                      ₹{analytics.totalRaised.toLocaleString("en-IN")}
                    </p>
                    <span className="text-[11px] text-gray-500 mt-1 block">Real lifetime support</span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contributions</span>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-white">
                      {analytics.totalContributions}
                    </p>
                    <span className="text-[11px] text-gray-500 mt-1 block">Completed payments</span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Supporters</span>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-white">
                      {analytics.uniqueSupporters}
                    </p>
                    <span className="text-[11px] text-gray-500 mt-1 block">Unique contributors</span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Contribution</span>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-300">
                      ₹{analytics.averageContribution.toLocaleString("en-IN")}
                    </p>
                    <span className="text-[11px] text-gray-500 mt-1 block">Per completed support</span>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                {analytics.monthlyTrend && analytics.monthlyTrend.length > 0 && (
                  <section className="rounded-3xl border border-white/10 bg-white/3 p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span>📈</span> Contribution Trend
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {analytics.monthlyTrend.map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-white/5 bg-black/20 p-3 text-center">
                          <span className="text-[11px] text-gray-400 font-medium">{item.month}</span>
                          <p className="text-base font-bold text-amber-400 mt-1">₹{item.total.toLocaleString("en-IN")}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Recent Payments Table */}
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
                  <div className="border-b border-white/10 px-6 py-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>☕</span> Recent Verified Contributions
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Supporter contributions processed securely through Razorpay.
                    </p>
                  </div>

                  {analytics.recentPayments.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                      <p className="text-sm">No contributions received yet.</p>
                      <p className="text-xs text-gray-600 mt-1">Share your creator profile link to start receiving support!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 overflow-x-auto">
                      {analytics.recentPayments.map((p) => (
                        <div key={p._id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/2 transition">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-white">{p.name}</span>
                              {p.isAnonymous && (
                                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-gray-400 font-mono">
                                  Anonymous
                                </span>
                              )}
                            </div>
                            {p.message && (
                              <p className="text-xs text-gray-300 mt-1 italic">&ldquo;{p.message}&rdquo;</p>
                            )}
                            <span className="text-[11px] text-gray-500 mt-1 block">
                              {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-base font-bold text-amber-400">+₹{p.amount.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/3 p-10 text-center">
                <p className="text-sm text-gray-400">Failed to load analytics.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SUPPORTER HUB */}
        {activeTab === "supporters" && (
          <div className="space-y-8">
            {/* Bookmarked / Saved Creators Section */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
              <div className="border-b border-white/10 px-6 py-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>🔖</span> Bookmarked / Saved Creators
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Creators you have saved to keep track of their journey and projects.
                </p>
              </div>

              {supportersLoading ? (
                <div className="p-10 flex justify-center">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
                </div>
              ) : savedCreators.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <p className="text-sm">You haven&apos;t saved any creators yet.</p>
                  <Link
                    href="/creators"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    <span>🔍</span> Explore Creators Directory
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 p-6 sm:grid-cols-2">
                  {savedCreators.map((creator) => (
                    <div
                      key={creator._id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-4 flex items-center justify-between gap-3 hover:border-white/20 transition"
                    >
                      <Link
                        href={`/${creator.username}`}
                        className="flex items-center gap-3 min-w-0 flex-1 group"
                      >
                        {creator.profilepic ? (
                          <img
                            src={creator.profilepic}
                            alt={creator.name || creator.username}
                            className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-lg font-extrabold text-black">
                            {(creator.name || creator.username || "C").charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition truncate">
                            {creator.name || creator.username}
                          </h4>
                          <p className="text-xs text-gray-400 truncate">@{creator.username}</p>
                        </div>
                      </Link>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/${creator.username}`}
                          className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-400/20"
                        >
                          View ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleUnsave(creator.username)}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-rose-400 hover:bg-white/5 transition"
                          title="Remove bookmark"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* My Support Contributions */}
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
              <div className="border-b border-white/10 px-6 py-5">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>☕</span> Contributions You Made
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Creators and projects you have personally backed on The Brew Club.
                </p>
              </div>

              {supportersLoading ? (
                <div className="p-10 flex justify-center">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
                </div>
              ) : supporterActivity.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  <p className="text-sm">You haven&apos;t supported any creators yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {supporterActivity.map((act) => (
                    <div key={act._id} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Supported</span>
                          <Link href={`/${act.to_user}`} className="text-sm font-bold text-amber-300 hover:underline">
                            @{act.to_user}
                          </Link>
                        </div>
                        {act.message && (
                          <p className="text-xs text-gray-300 mt-1 italic">&ldquo;{act.message}&rdquo;</p>
                        )}
                        <span className="text-[11px] text-gray-500 mt-0.5 block">
                          {act.createdAt ? new Date(act.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : ""}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-white shrink-0">₹{act.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS & ACTIVITY FEED */}
        {activeTab === "notifications" && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
            <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>🔔</span> In-App Notifications & Activity
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time alerts for contributions and platform milestones.
                </p>
              </div>

              {notifications.some((n) => !n.read) && (
                <button
                  type="button"
                  onClick={() => handleMarkNotifRead("all")}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 transition cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifsLoading ? (
              <div className="p-10 flex justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <p className="text-sm">No notifications yet.</p>
                <p className="text-xs text-gray-600 mt-1">When someone supports your work, you will see it here.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-4 sm:px-6 flex items-start justify-between gap-4 transition ${
                      notif.read ? "bg-transparent opacity-75" : "bg-amber-400/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{notif.type === "payment" ? "☕" : "📢"}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                        {notif.message && (
                          <p className="text-xs text-gray-300 mt-0.5">{notif.message}</p>
                        )}
                        <span className="text-[11px] text-gray-500 mt-1 block">
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
                        </span>
                      </div>
                    </div>

                    {!notif.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkNotifRead(notif._id)}
                        className="rounded-lg p-1 text-xs text-amber-400 hover:text-amber-300 transition shrink-0 cursor-pointer"
                        title="Mark as read"
                      >
                        ✓ Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 7: PAYMENT SETTINGS (DUAL-METHOD SUPPORT) */}
        {activeTab === "payments" && (
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
              <div className="border-b border-white/10 px-6 py-6 md:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">Payment Method & Gateway Settings</h2>
                    <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                      Choose how supporters can contribute to you. You can choose between your personalized Razorpay Payment Link or integrated Razorpay Gateway.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                    Active Payment Method on Public Profile
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Method 1: Payment Link */}
                    <div
                      onClick={() => setForm((prev) => ({ ...prev, paymentMethod: "razorpay_link" }))}
                      className={`rounded-2xl border p-5 transition cursor-pointer ${
                        form.paymentMethod === "razorpay_link"
                          ? "border-amber-400/60 bg-amber-400/10 shadow-lg shadow-amber-500/5"
                          : "border-white/10 bg-black/30 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="razorpay_link"
                            checked={form.paymentMethod === "razorpay_link"}
                            onChange={handleChange}
                            className="text-amber-400 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>🔗</span> Razorpay Payment Link
                            </h4>
                            <span className="text-[10px] font-semibold uppercase text-amber-300">
                              Recommended & Quick Setup
                            </span>
                          </div>
                        </div>

                        {form.razorpayLink && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            Configured
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-gray-400 leading-relaxed">
                        Supporters click Support and are redirected directly to your personalized Razorpay payment page (e.g. <span className="text-gray-300 font-mono">https://razorpay.me/@username</span>).
                      </p>
                    </div>

                    {/* Method 2: Gateway */}
                    <div
                      onClick={() => setForm((prev) => ({ ...prev, paymentMethod: "razorpay_gateway" }))}
                      className={`rounded-2xl border p-5 transition cursor-pointer ${
                        form.paymentMethod === "razorpay_gateway"
                          ? "border-amber-400/60 bg-amber-400/10 shadow-lg shadow-amber-500/5"
                          : "border-white/10 bg-black/30 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="razorpay_gateway"
                            checked={form.paymentMethod === "razorpay_gateway"}
                            onChange={handleChange}
                            className="text-amber-400 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>⚡</span> Integrated Razorpay Gateway
                            </h4>
                            <span className="text-[10px] font-semibold uppercase text-gray-400">
                              In-App Modal Checkout
                            </span>
                          </div>
                        </div>

                        {form.gatewayConfigured ? (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            form.isLiveGateway || form.razorpayid?.startsWith("rzp_live_")
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-400/20 text-amber-300"
                          }`}>
                            {form.isLiveGateway || form.razorpayid?.startsWith("rzp_live_") ? "Live API" : "Test API"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                            Not Configured
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-gray-400 leading-relaxed">
                        Supporters contribute inside The Brew Club&apos;s embedded Razorpay modal using your custom API Key and Secret.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-6">
                  {/* SECTION 1: PAYMENT LINK SETTINGS */}
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>🔗</span> 1. Personalized Razorpay Payment Link
                      </h3>
                      {form.paymentMethod === "razorpay_link" && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                          Currently Active
                        </span>
                      )}
                    </div>

                    <div>
                      <label htmlFor="razorpayLink" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                        Your Razorpay Link URL
                      </label>
                      <input
                        value={form.razorpayLink}
                        onChange={handleChange}
                        type="url"
                        name="razorpayLink"
                        id="razorpayLink"
                        placeholder="https://razorpay.me/@username or https://rzp.io/l/..."
                        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/60 focus:ring-2 focus:ring-amber-400/10"
                      />
                      <p className="mt-1.5 text-[11px] text-gray-500">
                        You can create or copy your personalized link from your Razorpay Dashboard (Payment Links / razorpay.me).
                      </p>
                    </div>
                  </div>

                  {/* SECTION 2: GATEWAY API SETTINGS */}
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>⚡</span> 2. Razorpay API Gateway Credentials
                      </h3>
                      {form.paymentMethod === "razorpay_gateway" && (
                        <span className="rounded-full border border-amber-400/30 bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                          Currently Active
                        </span>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="razorpayid" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                          Razorpay Key ID
                        </label>
                        <input
                          value={form.razorpayid}
                          onChange={handleChange}
                          type="text"
                          name="razorpayid"
                          id="razorpayid"
                          placeholder="rzp_test_... or rzp_live_..."
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/60 focus:ring-2 focus:ring-amber-400/10"
                        />
                        <p className="mt-1 text-[11px] text-gray-500">
                          Supports both Test keys (<span className="text-amber-400">rzp_test_...</span>) and Live keys (<span className="text-emerald-400">rzp_live_...</span>).
                        </p>
                      </div>

                      <div>
                        <label htmlFor="razorpaysecret" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                          Razorpay Key Secret
                        </label>
                        <input
                          value={form.razorpaysecret}
                          onChange={handleChange}
                          type="password"
                          name="razorpaysecret"
                          id="razorpaysecret"
                          placeholder={
                            form.gatewayConfigured
                              ? "•••••••••••••••••••• (Configured — leave blank to keep unchanged)"
                              : "Enter Razorpay Secret Key"
                          }
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-amber-400/60 focus:bg-black/60 focus:ring-2 focus:ring-amber-400/10"
                        />
                        <p className="mt-1 text-[11px] text-amber-400/80">
                          🔒 Strictly protected. Stored server-side only and never sent to the browser.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Save Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/2 p-6">
              <div>
                <p className="text-sm font-semibold text-white">Save payment settings</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Your selected active payment method ({form.paymentMethod === "razorpay_link" ? "Razorpay Payment Link" : "Integrated Gateway"}) will apply to your profile.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex min-w-44 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-bold text-black transition-all hover:opacity-95 cursor-pointer"
              >
                {saving ? "Saving..." : "Save Payment Settings"}
              </button>
            </div>
          </form>
        )}

        {/* TAB 8: ADMIN & MODERATION */}
        {activeTab === "admin" && isAdmin && (
          <div className="space-y-8">
            {adminLoading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-amber-400" />
              </div>
            ) : adminData ? (
              <>
                {/* Platform Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Creators</span>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-white">{adminData.stats.totalUsers}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Payments</span>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-white">{adminData.stats.totalPayments}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform Volume</span>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-400">₹{adminData.stats.totalVolume.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Reports</span>
                    <p className="mt-2 text-2xl sm:text-3xl font-black text-rose-400">{adminData.stats.pendingReports}</p>
                  </div>
                </div>

                {/* Moderation Reports Table */}
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/3">
                  <div className="border-b border-white/10 px-6 py-5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>🛡️</span> Content & Creator Reports
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Review reports submitted by platform visitors and take moderation action.
                    </p>
                  </div>

                  {adminData.reports.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                      <p className="text-sm">No reports on file. Everything is clean!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 overflow-x-auto">
                      {adminData.reports.map((r) => (
                        <div key={r._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                                {r.reason}
                              </span>
                              <span className="text-xs text-gray-400">Target:</span>
                              <Link href={`/${r.targetUsername}`} target="_blank" className="text-xs font-bold text-amber-300 hover:underline">
                                @{r.targetUsername} ↗
                              </Link>
                            </div>
                            {r.description && (
                              <p className="text-xs text-gray-300 mt-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
                                {r.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500">
                              <span>Reporter: {r.reporterEmail}</span>
                              <span>•</span>
                              <span>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN") : ""}</span>
                              <span>•</span>
                              <span className={`font-semibold ${r.status === "pending" ? "text-amber-400" : "text-gray-400"}`}>
                                Status: {r.status}
                              </span>
                            </div>
                          </div>

                          {r.status === "pending" && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleModerateReport(r._id, "actioned")}
                                className="rounded-xl bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition cursor-pointer"
                              >
                                Take Action
                              </button>
                              <button
                                type="button"
                                onClick={() => handleModerateReport(r._id, "dismissed")}
                                className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 transition cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <div className="p-10 text-center text-gray-500">Failed to load admin panel.</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
